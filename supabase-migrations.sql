-- Migration: Enhanced Campaign Creation, CV Ranking & Best Candidates
-- Run this in your Supabase SQL editor

-- 1. Add criteria JSONB column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS criteria JSONB DEFAULT NULL;

-- 2. Add enhanced scoring columns to applicants table
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS scoring_breakdown JSONB DEFAULT NULL;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS matched_skills TEXT[] DEFAULT '{}';
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS matched_keywords TEXT[] DEFAULT '{}';
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS relevance VARCHAR(20) DEFAULT 'medium';
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS ranking_reason TEXT DEFAULT '';
