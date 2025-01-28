/*
  # Create news table and related schemas

  1. New Tables
    - `news`
      - `id` (bigint, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `image_url` (text, required)
      - `video_url` (text, optional)
      - `category` (text, required)
      - `created_at` (timestamptz, default: now())
      - `updated_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `news` table
    - Add policies for authenticated users to manage news
    - Add policies for public users to read news
*/

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  video_url text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage news
CREATE POLICY "Allow authenticated users to manage news"
  ON news
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for public users to read news
CREATE POLICY "Allow public users to read news"
  ON news
  FOR SELECT
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();