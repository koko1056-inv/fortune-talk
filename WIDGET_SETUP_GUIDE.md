# iOSウィジェット設定ガイド

このガイドでは、Fortune Talkアプリのホーム画面ウィジェットを設定する方法を説明します。

## ウィジェットの種類

アプリには2種類のウィジェットが用意されています:

### 1. 占い開始ウィジェット
- **機能**: タップするとアプリが開き、音声占いモードに切り替わります
- **デザイン**: 🔮 クリスタルボールのアイコン
- **サイズ**: スモール

### 2. 今日の運勢ウィジェット
- **機能**: タップするとアプリが開き、今日の運勢ダイアログが表示されます
- **デザイン**: ✨ スパークルアイコンと星評価
- **サイズ**: スモール

## Xcodeでのウィジェット拡張機能の追加

### 手順

1. **Xcodeでプロジェクトを開く**
   ```bash
   cd ios/App
   open App.xcworkspace
   ```

2. **Widget Extensionターゲットを追加**
   - File → New → Target を選択
   - iOS → Widget Extension を選択
   - 「Next」をクリック
   - Product Name: `FortuneWidget`
   - Include Configuration Intent: チェックを外す
   - 「Finish」をクリック
   - 「Activate」をクリック

3. **既存のウィジェットコードを使用**
   - 作成された `FortuneWidget` フォルダ内の `FortuneWidget.swift` を削除
   - プロジェクトに既に配置されている `/ios/App/FortuneWidget/FortuneWidget.swift` を追加
   - プロジェクトに既に配置されている `/ios/App/FortuneWidget/Info.plist` を追加

4. **Bundle Identifierの設定**
   - FortuneWidgetターゲットを選択
   - General → Identity → Bundle Identifier を確認
   - `com.fortunetalk.app.FortuneWidget` になっていることを確認

5. **URL Schemeの設定**
   - Appターゲットを選択
   - Info → URL Types を開く
   - 「+」ボタンをクリック
   - URL Schemes: `fortunetalk`
   - Identifier: `com.fortunetalk.app`
   - Role: Editor

6. **ビルドとテスト**
   ```bash
   # Capacitorの同期
   npx cap sync ios
   
   # Xcodeでビルド
   # Product → Build (⌘B)
   ```

## ウィジェットの追加方法(ユーザー向け)

1. iPhoneのホーム画面を長押し
2. 左上の「+」ボタンをタップ
3. 「Fortune Talk」を検索
4. 「占い開始」または「今日の運勢」ウィジェットを選択
5. 「ウィジェットを追加」をタップ
6. ホーム画面に配置

## 技術詳細

### Deep Linkの仕組み

ウィジェットは以下のURL schemeを使用してアプリと通信します:

- `fortunetalk://start-fortune` - 占い開始
- `fortunetalk://daily-fortune` - 今日の運勢

### 実装ファイル

1. **Widget Extension**
   - `/ios/App/FortuneWidget/FortuneWidget.swift` - ウィジェットのUI実装
   - `/ios/App/FortuneWidget/Info.plist` - ウィジェット設定

2. **React/TypeScript**
   - `/src/hooks/useDeepLinks.ts` - Deep linkハンドラー
   - `/src/App.tsx` - Deep link統合
   - `/src/pages/Index.tsx` - ウィジェットイベント処理
   - `/src/components/DailyFortuneCard.tsx` - 運勢ダイアログ制御

3. **設定**
   - `/capacitor.config.ts` - URL scheme設定

### カスタマイズ

ウィジェットのデザインは `FortuneWidget.swift` で変更できます:

- **色**: `Color(hue:saturation:brightness:)` で調整
- **テキスト**: `Text()` コンポーネントで変更
- **アイコン**: 絵文字またはSF Symbolsを使用

## トラブルシューティング

### ウィジェットが表示されない
- Xcodeでビルドエラーがないか確認
- Bundle Identifierが正しいか確認
- Widget Extensionターゲットが有効になっているか確認

### ウィジェットをタップしてもアプリが開かない
- URL Schemeが正しく設定されているか確認
- `capacitor.config.ts` の `ios.scheme` 設定を確認
- アプリを再インストールしてみる

### Deep Linkが動作しない
- `@capacitor/app` パッケージがインストールされているか確認
- `useDeepLinks` フックが `App.tsx` で使用されているか確認
- コンソールログでdeep linkイベントを確認

## 次のステップ

- ウィジェットに動的データ(運勢の星評価など)を表示
- ミディアム/ラージサイズのウィジェットを追加
- ウィジェットの更新頻度を調整
- App Groupsを使用してアプリとウィジェット間でデータを共有
