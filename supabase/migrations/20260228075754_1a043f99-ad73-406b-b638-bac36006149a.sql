
WITH tarot_img AS (SELECT image_url FROM agent_configs WHERE id = 'tarot'),
     eastern_img AS (SELECT image_url FROM agent_configs WHERE id = 'eastern')
UPDATE agent_configs
SET image_url = CASE
  WHEN id = 'tarot' THEN (SELECT image_url FROM eastern_img)
  WHEN id = 'eastern' THEN (SELECT image_url FROM tarot_img)
END
WHERE id IN ('tarot', 'eastern');
