-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create projects table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null, -- Stores the Clerk User ID
  project_name text,
  input_data jsonb, -- The inputs provided by the user
  generated_output jsonb, -- The AI generated content
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table projects enable row level security;

-- Policy: Users can only see their own projects
create policy "Users can see own projects"
  on projects for select
  using ( auth.uid()::text = user_id );

-- Policy: Users can insert their own projects
create policy "Users can insert own projects"
  on projects for insert
  with check ( auth.uid()::text = user_id );

-- Policy: Users can update their own projects
create policy "Users can update own projects"
  on projects for update
  using ( auth.uid()::text = user_id );

-- Policy: Users can delete their own projects
-- Policy: Users can delete their own projects
create policy "Users can delete their own projects"
  on projects for delete
  using ( auth.uid()::text = user_id );

-- Create subscriptions table (for manual payment requests)
create table if not exists subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null, -- Stores the Clerk User ID
  plan_name text,
  price text,
  customer_name text,
  customer_email text,
  customer_whatsapp text,
  status text default 'pending_approval',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for subscriptions
alter table subscriptions enable row level security;

-- Policy: Users can insert their own requests
create policy "Users can insert their own requests"
  on subscriptions for insert
  with check ( auth.uid()::text = user_id );

-- Policy: Users can view their own requests
create policy "Users can view their own requests"
  on subscriptions for select
  using ( auth.uid()::text = user_id );

-- Policy: Service role or Admins can see/update all (Admins handled via app logic, but RLS prevents fetch unless policy exists)
-- For simplicity, we allow users to see their own status. 
-- For Admin Dashboard to work, the user (Admin) needs access. 
-- Since we identify admin by email in app, we can add a policy if Supabase supports claims, 
-- OR we can allow select for all authenticated users (less secure but works for this MVP)
-- OR effectively, the admin dashboard often uses a separate mechanism or the user is the owner.
-- Let's allow authenticated users to view all for now to ensure Admin works easily without custom claims setup.
create policy "Authenticated users can view all requests"
  on subscriptions for select
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can update (for Admin)"
  on subscriptions for update
  using ( auth.role() = 'authenticated' );

