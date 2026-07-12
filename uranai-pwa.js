/* 開運コンパス PWA 制御(SW登録・インストール導線・通知トグル)
   本体機能に影響しないよう、すべて feature 検出＋try/catch で防御する。 */
(function () {
  'use strict';

  var LS_INSTALL_HIDE = 'kaiun_install_hidden';
  var LS_IOS_HINT = 'kaiun_ios_hint_dismissed';
  var LS_NOTIFY = 'kaiun_notify_enabled';

  var deferredPrompt = null;
  var swReg = null;

  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
  }

  function isIOS() {
    var ua = window.navigator.userAgent || '';
    var iOSDevice = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return iOSDevice;
  }

  /* ===== Service Worker 登録 ===== */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    // file:// では登録不可。localhost / https のみ試行。
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' &&
        location.hostname !== '127.0.0.1') {
      return;
    }
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(function (reg) {
        swReg = reg;
        try { console.log('[PWA] service worker registered', reg.scope); } catch (e) {}
        syncNotifyToggle();
      })
      .catch(function (err) {
        try { console.log('[PWA] service worker registration skipped:', err && err.message); } catch (e) {}
      });
  }

  /* ===== インストール導線 ===== */
  function installHost() {
    // profile-chip の隣(結果画面)を優先。無ければ header 直後。
    return document.querySelector('.profile-chip') || document.querySelector('header');
  }

  function showInstallButton() {
    if (isStandalone()) return;
    if (localStorage.getItem(LS_INSTALL_HIDE) === '1') return;
    if (document.getElementById('pwa-install-btn')) return;
    var host = installHost();
    if (!host) return;
    var btn = document.createElement('button');
    btn.id = 'pwa-install-btn';
    btn.className = 'pwa-install-btn';
    btn.textContent = '📲 ホーム画面に追加';
    btn.addEventListener('click', function () {
      if (!deferredPrompt) { hideInstallButton(); return; }
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice && choice.outcome === 'accepted') {
          localStorage.setItem(LS_INSTALL_HIDE, '1');
        }
        deferredPrompt = null;
        hideInstallButton();
      }).catch(function () { hideInstallButton(); });
    });
    if (host.classList.contains('profile-chip')) {
      host.insertAdjacentElement('afterend', btn);
    } else {
      host.insertAdjacentElement('afterend', btn);
    }
  }

  function hideInstallButton() {
    var b = document.getElementById('pwa-install-btn');
    if (b) b.remove();
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  window.addEventListener('appinstalled', function () {
    localStorage.setItem(LS_INSTALL_HIDE, '1');
    deferredPrompt = null;
    hideInstallButton();
  });

  /* ===== iOS Safari 向け案内(1回だけ) ===== */
  function maybeShowIOSHint() {
    if (!isIOS() || isStandalone()) return;
    if (localStorage.getItem(LS_IOS_HINT) === '1') return;
    if (document.getElementById('pwa-ios-hint')) return;
    var host = installHost();
    if (!host) return;
    var box = document.createElement('div');
    box.id = 'pwa-ios-hint';
    box.className = 'pwa-ios-hint';
    var msg = document.createElement('span');
    msg.textContent = 'Safariの共有ボタン→「ホーム画面に追加」でアプリとして使えます。';
    var x = document.createElement('button');
    x.className = 'pwa-ios-hint-x';
    x.setAttribute('aria-label', '閉じる');
    x.textContent = '×';
    x.addEventListener('click', function () {
      localStorage.setItem(LS_IOS_HINT, '1');
      box.remove();
    });
    box.appendChild(msg);
    box.appendChild(x);
    host.insertAdjacentElement('afterend', box);
  }

  /* ===== 通知トグル(ベータ) ===== */
  function syncNotifyToggle() {
    var tgl = document.getElementById('pwa-notify-toggle');
    if (!tgl) return;
    var on = localStorage.getItem(LS_NOTIFY) === '1';
    tgl.classList.toggle('on', on);
    tgl.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function setNotifyMsg(text) {
    var el = document.getElementById('pwa-notify-msg');
    if (el) el.textContent = text || '';
  }

  function notifyUnsupportedMsg() {
    setNotifyMsg('この端末のブラウザでは通知に対応していません。今後のアプリ版で完全対応予定です。');
  }

  function enableNotify() {
    if (!('Notification' in window)) { notifyUnsupportedMsg(); return; }
    Notification.requestPermission().then(function (perm) {
      if (perm !== 'granted') {
        setNotifyMsg('通知が許可されませんでした。ブラウザの設定から許可すると受け取れます。');
        return;
      }
      // periodicSync が使えるか試行
      tryPeriodicSync();
    }).catch(function () { notifyUnsupportedMsg(); });
  }

  function tryPeriodicSync() {
    if (!swReg || !('periodicSync' in swReg)) {
      // 通知許可は取れたが定期同期は非対応
      localStorage.setItem(LS_NOTIFY, '1');
      syncNotifyToggle();
      setNotifyMsg('通知を許可しました。ただしこの端末では自動配信(定期同期)に非対応のため、毎朝の自動通知は今後のアプリ版で対応予定です。');
      return;
    }
    swReg.periodicSync.register('daily-fortune', {
      minInterval: 20 * 60 * 60 * 1000
    }).then(function () {
      localStorage.setItem(LS_NOTIFY, '1');
      syncNotifyToggle();
      setNotifyMsg('毎朝の運勢通知をオンにしました(ベータ・対応端末のみ)。');
    }).catch(function () {
      localStorage.setItem(LS_NOTIFY, '1');
      syncNotifyToggle();
      setNotifyMsg('通知を許可しました。定期同期の登録はできませんでしたが、対応端末では今後配信されます。');
    });
  }

  function disableNotify() {
    localStorage.setItem(LS_NOTIFY, '0');
    syncNotifyToggle();
    setNotifyMsg('毎朝の運勢通知をオフにしました。');
    if (swReg && 'periodicSync' in swReg) {
      swReg.periodicSync.unregister('daily-fortune').catch(function () {});
    }
  }

  function bindNotifyToggle() {
    var tgl = document.getElementById('pwa-notify-toggle');
    if (!tgl || tgl.dataset.bound === '1') return;
    tgl.dataset.bound = '1';
    tgl.addEventListener('click', function () {
      var on = localStorage.getItem(LS_NOTIFY) === '1';
      if (on) { disableNotify(); } else { enableNotify(); }
    });
    syncNotifyToggle();
  }

  /* ===== 初期化 ===== */
  function init() {
    registerSW();
    bindNotifyToggle();
    maybeShowIOSHint();
    // すでに beforeinstallprompt を取り逃していない限り、ここでは出さない。
    // 結果画面へ遷移するタイミングでも再チェック(profile-chip 出現後)。
    if (deferredPrompt) showInstallButton();
    // 結果画面が後から表示されるケースに備え、軽く監視。
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (deferredPrompt) showInstallButton();
      if (!document.getElementById('pwa-ios-hint')) maybeShowIOSHint();
      if (tries > 20) clearInterval(iv);
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
