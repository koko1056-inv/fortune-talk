# 決済機能実装計画書

モバイルアプリ（iOS）とWeb版の両方で、占いチケットを購入できるようにするための実装計画です。

## 📱 前提条件・方針
iOSアプリとしてApp Storeでリリースする場合、デジタルコンテンツ（チケット）の販売には **Appleのアプリ内課金 (In-App Purchase)** の使用が義務付けられています。Web版では **Stripe** を使用するのが一般的です。

これらを効率よく管理するため、**RevenueCat** という課金管理プラットフォームの導入を推奨します。

### 推奨構成
- **iOSアプリ**: RevenueCat SDK 経由で Apple In-App Purchase を利用
- **Web版**: Stripe Checkout を利用（RevenueCat経由または直接）
- **バックエンド**: Supabase Edge Functions で、購入完了の通知（Webhook）を受け取り、チケット残高を加算

---

## 📅 実装ステップ

### Phase 1: Web決済（Stripe）の実装
まずはWeb版で確実に課金できるようにします。

1. **Stripeアカウント作成**
   - APIキーの取得（Publishable Key, Secret Key）
2. **Supabase Edge Functions 作成**
   - `create-checkout-session`: 決済画面のURLを発行する関数
   - `stripe-webhook`: 決済完了通知を受け取り、ユーザーのチケット残高を増やす関数
3. **フロントエンド実装**
   - 「購入」ボタンを押したときに、上記Functionを呼び出してStripe決済画面へ遷移させる

### Phase 2: iOS決済（RevenueCat）の実装
Appleの審査を通すための対応です。

1. **App Store Connect 設定**
   - 「有料App契約」の同意
   - 課金アイテム（Consumable: 消耗型）の登録
     - 例: `ticket_01` (1枚), `ticket_10` (10枚)...
2. **RevenueCat 設定**
   - プロジェクト作成、Apple/Stripeとの連携設定
3. **アプリ実装**
   - `purchases-capacitor` プラグインのインストール
   - RevenueCat SDKを使って「商品一覧の取得」と「購入処理」を実装
4. **Webhook連携**
   - RevenueCatからのWebhookをSupabaseで受け取り、Phase 1で作ったロジックを再利用してチケットを付与

---

## 🛠 必要な準備（ToDo）

- [ ] **Stripeアカウント** の開設
- [ ] **Apple Developer Program** の「契約/税金/口座情報」の設定（まだの場合）
- [ ] **RevenueCatアカウント** の開設（無料プランでOK）

## ⚠️ 注意点（Apple審査対策）

iOSアプリ内では、**「Webで買うと安くなります」や「こちらのサイトで購入してください」といったWeb決済への誘導（リンクや文言）は厳禁**です。見つかるとアプリがリジェクト（審査落ち）されます。

- **iOSアプリ**: アプリ内課金のみを表示
- **Web**: Stripe決済のみを表示（または両方）

このように、プラットフォームによって決済方法を出し分ける実装を行います。
