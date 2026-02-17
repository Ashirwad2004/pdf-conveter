-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  tier text default 'free' check (tier in ('free', 'pro')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CONVERSIONS (Job History)
create table conversions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  original_file_path text not null,
  processed_file_path text,
  conversion_type text not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Conversions
alter table conversions enable row level security;
create policy "Users can view own conversions" on conversions for select using (auth.uid() = user_id);
create policy "Users can insert own conversions" on conversions for insert with check (auth.uid() = user_id);

-- USER USAGE (Rate Limiting)
create table user_usage (
  user_id uuid references auth.users not null,
  date date default CURRENT_DATE not null,
  conversion_count int default 0,
  primary key (user_id, date)
);

-- RLS for Usage
alter table user_usage enable row level security;
create policy "Users can view own usage" on user_usage for select using (auth.uid() = user_id);

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('raw_files', 'raw_files', false);
insert into storage.buckets (id, name, public) values ('converted_files', 'converted_files', true);

-- STORAGE POLICIES
-- Allow authenticated users to upload to raw_files
create policy "Authenticated users can upload raw files"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'raw_files' );

-- Allow authenticated users to view their own raw files (optional, mostly for worker)
-- Worker uses Service Role key, so it bypasses RLS.
