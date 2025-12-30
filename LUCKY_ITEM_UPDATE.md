# ラッキーアイテム機能の追加手順

毎日の運勢に「ラッキーアイテム」を表示する変更を行いましたが、これを完全に動作させるにはサーバー側（Supabase）の更新が必要です。

## 1. データベースの更新
Supabaseのダッシュボードにある **SQL Editor** で、以下のコマンドを実行してデータベースに新しいデータ項目（カラム）を追加してください。
このファイル `update_daily_fortunes.sql` にも同じ内容を保存しています。

```sql
ALTER TABLE daily_fortunes ADD COLUMN IF NOT EXISTS lucky_item TEXT;
```

## 2. Edge Functionのデプロイ
占いの生成ロジック（サーバ側）を変更したため、ターミナルで以下のコマンドを実行して更新を反映させてください。
（Supabaseへのログインを求められる場合があります）

```bash
npx supabase functions deploy daily-fortune
```

## 3. アプリの確認
上記2つが完了したら、アプリ（iOSシミュレータ）を再起動して「今日の運勢」を確認してください。新しく占われたデータからラッキーアイテムが表示されるようになります。
