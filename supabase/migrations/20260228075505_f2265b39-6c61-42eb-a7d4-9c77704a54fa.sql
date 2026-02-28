
UPDATE agent_configs AS ac
SET image_url = other.image_url
FROM agent_configs AS other
WHERE (ac.id = 'tarot' AND other.id = 'eastern')
   OR (ac.id = 'eastern' AND other.id = 'tarot');
