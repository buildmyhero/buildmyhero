-- Add status and generation progress columns to characters table
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'complete',
ADD COLUMN IF NOT EXISTS generation_progress integer NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS play_guide_content text,
ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS email_requested boolean NOT NULL DEFAULT false;

-- Add constraint for status values
ALTER TABLE public.characters 
ADD CONSTRAINT characters_status_check 
CHECK (status IN ('generating', 'complete', 'error'));

-- Add constraint for progress range
ALTER TABLE public.characters 
ADD CONSTRAINT characters_progress_check 
CHECK (generation_progress >= 0 AND generation_progress <= 100);

-- Enable realtime for characters table to support progress updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;