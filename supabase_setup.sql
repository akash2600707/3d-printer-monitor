-- supabase_setup.sql
-- Run this in Supabase Dashboard → SQL Editor

-- Create print_jobs table
create table if not exists print_jobs (
  id uuid default gen_random_uuid() primary key,
  file_name text not null,
  status text not null check (status in ('completed', 'cancelled', 'failed')),
  start_time timestamptz not null,
  end_time timestamptz default now(),
  duration integer,
  filament_used numeric,
  layers_completed integer,
  total_layers integer,
  max_nozzle_temp numeric,
  max_bed_temp numeric,
  notes text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table print_jobs enable row level security;

-- Allow public read/write (for demo — restrict in production)
create policy "Allow public access"
  on print_jobs
  for all
  using (true)
  with check (true);

-- Index for faster sorting
create index if not exists print_jobs_end_time_idx on print_jobs (end_time desc);
