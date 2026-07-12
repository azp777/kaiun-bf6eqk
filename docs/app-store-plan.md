# 開運コンパス App Store 申請計画書

作成: 2026-07-12 / 対象: kaiun-compass(現在PWAとして公開中)

## 0. 結論(いちばん大事なこと)

iOSアプリの**ビルドにはMac(Xcode)が必須**。Windowsのみの現環境では最終工程ができない。
選択肢は次の3つで、**おすすめはB**。

| 案 | 内容 | 費用感 | 備考 |
|---|---|---|---|
| A. Macを用意 | 中古Mac mini等でも可 | 5〜10万円(中古) | 長期的には最も自由 |
| **B. クラウドビルド** | Codemagic等のmacOSクラウドでビルド | 無料枠あり(Codemagic 月500分) | Windowsのまま申請まで可能 |
| C. Android先行 | Google Play を先に出す | 登録$25(買い切り) | Windowsでビルド可能。実績づくりに有効 |

※どの案でも **Apple Developer Program($99/年)** は必須。

## 1. フリーミアム設計(課金の線引き案)

### 無料(Web版・アプリ版共通)
- 総合ダッシュボード/今日の運勢/各占術の基本結果
- 相談室(ルナ)/性格タイプ診断
- 相性診断: 1日1回まで(アプリ版)

### プレミアム(アプリ版のみ)
- 🔮 さらに深く読む(全占術の深読み全文)
- 💞 相性診断 無制限+取扱説明書(攻略ガイド)
- 🔔 毎朝の運勢通知(ネイティブのローカル通知で確実に配信)
- 新占術・新機能の先行利用

### 価格案
- 月額: 480円 or 年額: 3,600円(2ヶ月分お得) or 買い切り: 1,600円
- Apple Small Business Program(年収$100万以下)適用で手数料15%
- **Web版(GitHub Pages)は全機能無料のまま残す** → 集客・お試し導線として機能

## 2. 申請前チェックリスト

- [ ] Apple Developer Program 登録($99/年、個人でOK)
- [ ] プライバシーポリシーページ(URL必須。「データは端末内のみ・外部送信なし」を明記 → 本アプリは有利)
- [ ] サポート用連絡先(メール or フォームURL)
- [ ] アプリ名の商標確認(J-PlatPatで「開運コンパス」を正式検索)
- [ ] スクリーンショット(6.7インチ/6.5インチ/5.5インチ、各3枚以上)
- [ ] App Store 説明文(差別化ポイント: 7占術統合+相性+相談室+心理学+完全オフライン)
- [ ] 審査ガイドライン対策
  - 4.3(スパム/類似): 「7占術+吉方位コンパス+文脈チャット」の独自性を Review Notes に明記
  - 5.6 等: エンターテインメント目的であることをアプリ内に明記(対応済み)
  - 課金: In-App Purchase 必須(外部決済誘導は不可)
- [ ] 年齢レーティング: 4+ で申請可(占いはエンタメ扱い)

## 3. Capacitor化の技術手順(実施はNode.js導入後)

1. Node.js LTS をインストール(Windows)
2. `npm init -y && npm i @capacitor/core @capacitor/cli`
3. `npx cap init 開運コンパス com.azp777.kaiuncompass --web-dir .`
4. `npx cap add android`(Windows可)/ `npx cap add ios`(Mac or クラウド)
5. 毎朝通知: `@capacitor/local-notifications` で毎朝7時のローカル通知(サーバー不要・確実)
6. 課金: `@revenuecat/purchases-capacitor` が定番(無料枠あり、IAP実装が大幅に楽)
7. iOSビルド: Mac なら Xcode / クラウドなら Codemagic に GitHub リポジトリを接続

## 4. 推奨ロードマップ

1. 今: PWA版でテスター継続 + 鑑定文増量(②)完了
2. プライバシーポリシー・サポートページ作成(Webに設置)
3. Apple Developer Program 登録(審査に数日かかるので早めに)
4. Node.js導入 → Capacitorプロジェクト化 → まずAndroid版で通知・課金を検証
5. Codemagic接続 → iOSビルド → TestFlight でテスター配布 → 申請

---
※本書は計画メモ。数値・仕様は実施時に最新情報を要確認。
