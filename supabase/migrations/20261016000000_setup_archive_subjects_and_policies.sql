-- ==============================================================================
-- 1. FIX FOR PRIMARY DATABASE (Toufoule Topics)
-- Run this in the Primary Supabase SQL Editor (NEXT_PUBLIC_SUPABASE_URL):
-- Allows public (unauthenticated) visitors to read the subjects list
-- ==============================================================================

ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to subjects" ON public.subjects;
CREATE POLICY "Allow public read access to subjects"
ON public.subjects
FOR SELECT
USING (true);


-- ==============================================================================
-- 2. SCHEMA FOR YOUTH / ARCHIVED TOPICS
-- Run this in the database configured for NEXT_PUBLIC_ARCHIVE_SUBJECTS_URL
-- (or in Project 2 if using the same database for daily readings + youth topics):
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subtitles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subject_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    file_path TEXT NOT NULL DEFAULT 'google_drive',
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read on subjects" ON public.subjects;
CREATE POLICY "Allow public read on subjects"
ON public.subjects
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public read on subtitles" ON public.subtitles;
CREATE POLICY "Allow public read on subtitles"
ON public.subtitles
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public read on subject_documents" ON public.subject_documents;
CREATE POLICY "Allow public read on subject_documents"
ON public.subject_documents
FOR SELECT
USING (true);

-- Allow authenticated / admin users to manage records
DROP POLICY IF EXISTS "Allow authenticated insert on subject_documents" ON public.subject_documents;
CREATE POLICY "Allow authenticated insert on subject_documents"
ON public.subject_documents
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete on subject_documents" ON public.subject_documents;
CREATE POLICY "Allow authenticated delete on subject_documents"
ON public.subject_documents
FOR DELETE
TO authenticated
USING (true);
