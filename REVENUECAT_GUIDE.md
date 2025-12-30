# アプリ内課金（In-App Purchase）実装ガイド

モバイルアプリ（iOS/Android）のアプリ内課金を使用するための実装手順です。本プロジェクトでは **RevenueCat** を使用して実装しています。

## ⚠️ 必要な外部設定

アプリ側でコードを書くだけでは動かず、以下のクラウド側での設定が必要です。

### 1. App Store Connect 設定
1. [App Store Connect](https://appstoreconnect.apple.com/) にログイン。
2. 「マイApp」> アプリを選択 > 「機能」> 「App内課金」。
3. 以下のアイテム（消耗型: Consumable）を作成してください。
   - アイテム1: `ticket_01` (1000円)
   - アイテム2: `ticket_10` (9000円)
   - アイテム3: `ticket_50` (40000円)
   - アイテム4: `ticket_100` (70000円)

### 2. RevenueCat 設定
RevenueCatは、AppleやGoogleの課金を簡単に扱うための必須ツールです（無料枠で十分使えます）。

1. [RevenueCat](https://www.revenuecat.com/) でアカウント作成。
2. 新しいプロジェクトを作成し、「App Store」アプリを追加。
   - **App Store Connectの共有シークレット** が必要になります。
3. **Products (商品)** を登録。
   - App Store Connectで作ったID（`ticket_01` など）を入力。
4. **Entitlements (エンタイトルメント)** は今回は不要ですが、**Offerings (オファリング)** を設定します。
   - `Default` オファリングを作成し、上記の商品をPackagesとして追加してください。
5. **APIキーの取得**:
   - iOS用の「Public API Key」を取得し、ソースコードの `src/hooks/useInAppPurchase.ts` に設定してください。

## 📲 実装状況

現在、以下のコード実装が完了しています。

- **プラグイン**: `@revenuecat/purchases-capacitor` インストール済み
- **ロジック**: `src/hooks/useInAppPurchase.ts` に実装済み
- **UI**: `src/components/TicketPurchase.tsx` が書き換えられ、アプリ内課金フックを使用するようになっています。

## 📝 今後の作業

1. 上記の「外部設定」を完了させる。
2. `src/hooks/useInAppPurchase.ts` の `API_KEYS` 部分を、取得した実際のキーに書き換える。
3. 実機（iPhone）で動作確認を行う（シミュレーターでは課金テストはできません）。
