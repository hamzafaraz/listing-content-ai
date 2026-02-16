
-- Subscriptions Table to track payment status (Manual Strategy)
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Clerk User ID
  status text not null default 'pending_approval', -- pending_approval, active, rejected
  payment_method text default 'manual',
  payment_reference text, -- Transaction ID provided by user
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Policies
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid()::text = user_id);

create policy "Users can insert their own subscription"
  on public.subscriptions for insert
  with check (auth.uid()::text = user_id);

create policy "Admins can manage all subscriptions"
  on public.subscriptions for all
  using (true); 
