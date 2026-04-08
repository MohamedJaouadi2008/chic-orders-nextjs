-- Add Telegram and WhatsApp notification settings columns
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT,
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_api_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_id TEXT,
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;