-- Casa Congo: rename unlock fee setting key to KES
UPDATE platform_settings
SET key = 'unlock_fee_kes',
    value = COALESCE(value, '500'::jsonb)
WHERE key = 'unlock_fee_ngn';

INSERT INTO platform_settings (key, value, updated_at)
SELECT 'unlock_fee_kes', '500'::jsonb, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM platform_settings WHERE key = 'unlock_fee_kes'
);
