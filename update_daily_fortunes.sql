-- 1. daily_fortunesテーブルにlucky_itemカラムを追加
ALTER TABLE daily_fortunes 
ADD COLUMN IF NOT EXISTS lucky_item TEXT;

-- 2. 既存のデータに対してはNULLのままになります
-- 必要であればデフォルト値を入れることも可能です
-- UPDATE daily_fortunes SET lucky_item = '特になし' WHERE lucky_item IS NULL;
