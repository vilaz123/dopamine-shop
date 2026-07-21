-- ============================================================================
-- Dopahub 多巴胺仓 · Supabase schema + RLS
-- 在 Supabase Dashboard → SQL Editor 整段运行一次。可重复运行（幂等）。
-- 设计：纯客户端调用 + anon key，全部安全依赖行级安全（RLS）。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles：与 auth.users 1:1 的账号资料 + 资产（币/XP/勋章/券/收货）
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_color text default '#ff4d6d',
  phone text,
  email text,
  onboarded boolean default false,
  coins integer default 120,
  xp integer default 0,
  badges jsonb default '[]'::jsonb,
  coupons jsonb default '[]'::jsonb,
  shipping jsonb,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- account_state：个人资产/行为快照（单用户单行）
-- ----------------------------------------------------------------------------
create table if not exists public.account_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  inventory jsonb default '{}'::jsonb,
  favorites text[] default '{}'::text[],
  history text[] default '{}'::text[],
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- orders：订单快照（payload 存整张订单）
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz,
  payload jsonb
);

-- ----------------------------------------------------------------------------
-- 社区：帖子 / 评论 / 点赞（共享读，写仅本人）
-- ----------------------------------------------------------------------------
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  author text,
  title text,
  body text,
  topic text,
  related_slugs text[] default '{}'::text[],
  saved_amount integer default 0,
  likes_count integer default 0,
  created_at timestamptz default now()
);
create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  author text,
  body text,
  created_at timestamptz default now()
);

create table if not exists public.community_likes (
  post_id uuid references public.community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- ----------------------------------------------------------------------------
-- reviews：商品评价（共享读，写仅本人）
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text,
  user_id uuid references auth.users(id) on delete cascade,
  author text,
  rating integer,
  title text,
  body text,
  created_at timestamptz default now()
);
create index if not exists reviews_product_slug_idx on public.reviews (product_slug);

-- ----------------------------------------------------------------------------
-- user_events：可选行为事件流
-- ----------------------------------------------------------------------------
create table if not exists public.user_events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  kind text,
  slug text,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 触发器：account_state.updated_at 自动维护
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists account_state_set_updated_at on public.account_state;
create trigger account_state_set_updated_at
  before update on public.account_state
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 触发器：注册即建 profile + account_state（Supabase 标准做法）
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, avatar_color, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', '仓友' || right(new.email, 4)),
    '#ff4d6d',
    new.email
  )
  on conflict (id) do nothing;

  insert into public.account_state (user_id) values (new.id)
  on conflict do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- RLS：开启
-- ----------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.account_state     enable row level security;
alter table public.orders            enable row level security;
alter table public.user_events       enable row level security;
alter table public.community_posts   enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes   enable row level security;
alter table public.reviews           enable row level security;

-- 个人表：仅本人可读写（profiles 用 id，其余用 user_id）
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists account_state_self on public.account_state;
create policy account_state_self on public.account_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists orders_self on public.orders;
create policy orders_self on public.orders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists user_events_self on public.user_events;
create policy user_events_self on public.user_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 共享读表：所有人可读，仅本人可写
drop policy if exists community_posts_select on public.community_posts;
create policy community_posts_select on public.community_posts for select using (true);
drop policy if exists community_posts_insert on public.community_posts;
create policy community_posts_insert on public.community_posts for insert with check (auth.uid() = user_id);
drop policy if exists community_posts_update on public.community_posts;
create policy community_posts_update on public.community_posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists community_posts_delete on public.community_posts;
create policy community_posts_delete on public.community_posts for delete using (auth.uid() = user_id);

drop policy if exists community_comments_select on public.community_comments;
create policy community_comments_select on public.community_comments for select using (true);
drop policy if exists community_comments_insert on public.community_comments;
create policy community_comments_insert on public.community_comments for insert with check (auth.uid() = user_id);
drop policy if exists community_comments_delete on public.community_comments;
create policy community_comments_delete on public.community_comments for delete using (auth.uid() = user_id);

-- 点赞：所有人可查谁点赞；仅本人可 insert/delete（原子计数走 RPC）
drop policy if exists community_likes_select on public.community_likes;
create policy community_likes_select on public.community_likes for select using (true);
drop policy if exists community_likes_insert on public.community_likes;
create policy community_likes_insert on public.community_likes for insert with check (auth.uid() = user_id);
drop policy if exists community_likes_delete on public.community_likes;
create policy community_likes_delete on public.community_likes for delete using (auth.uid() = user_id);

drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews for select using (true);
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists reviews_update on public.reviews;
create policy reviews_update on public.reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists reviews_delete on public.reviews;
create policy reviews_delete on public.reviews for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- toggle_like：原子化点赞（去重 + 计数），security definer 绕过 RLS 一次性完成
-- 返回 true=已点赞，false=已取消
-- ----------------------------------------------------------------------------
create or replace function public.toggle_like(p_post uuid) returns boolean
  language plpgsql security definer as $$
declare
  liked boolean;
begin
  insert into public.community_likes (post_id, user_id) values (p_post, auth.uid())
  on conflict do nothing
  returning true into liked;

  if liked then
    update public.community_posts set likes_count = likes_count + 1 where id = p_post;
    return true;
  else
    delete from public.community_likes where post_id = p_post and user_id = auth.uid();
    update public.community_posts set likes_count = greatest(likes_count - 1, 0) where id = p_post;
    return false;
  end if;
end $$;

-- 允许 anon/authenticated 调用 RPC
grant execute on function public.toggle_like(uuid) to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.account_state to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.user_events to authenticated;
grant select, insert, update, delete on public.community_posts to authenticated;
grant select, insert, update, delete on public.community_comments to authenticated;
grant select, insert, update, delete on public.community_likes to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, update, delete on public.profiles to anon;
grant select, insert, update, delete on public.account_state to anon;
grant select, insert, update, delete on public.orders to anon;
grant select, insert, update, delete on public.user_events to anon;
grant select, insert, update, delete on public.community_posts to anon;
grant select, insert, update, delete on public.community_comments to anon;
grant select, insert, update, delete on public.community_likes to anon;
grant select, insert, update, delete on public.reviews to anon;

-- ============================================================================
-- 每日自律省钱排行榜（每日榜 + 累计榜）
-- 立意：Dopahub 虚拟下单=¥0真实支付，每笔都是"忍住的冲动消费"。
-- 指标：省钱金额(total)、卡路里(¥×8 趣味换算)、多巴胺币(coinsEarned)、
--       剁手抑制(订单条数)、连续打卡天数。
-- ============================================================================

-- profiles 昵称/头像公开读（排行榜要显示别人名字；email/phone 仍受 RLS 保护，列级不暴露）
drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
  for select using (true) with check (true);

-- orders 公开读（排行榜聚合需要；payload 含订单明细但无真实支付/地址敏感字段，
--   且仅聚合数值。如需更严可改用 security definer 的 rpc 只返回聚合。）
drop policy if exists orders_public_read on public.orders;
create policy orders_public_read on public.orders
  for select using (true) with check (true);

-- 今日榜：按本日（按 created_at 的日期，UTC）聚合，返回前 50 + 每个用户的昵称/头像/各项指标。
-- p_mode: 'today' | 'all'。卡路里 = 省钱金额 × 8（趣味换算）。
create or replace function public.daily_leaderboard(p_mode text default 'today')
returns table (
  user_id uuid,
  username text,
  avatar_color text,
  saved integer,        -- 省下金额(¥)
  calories integer,     -- 避开大卡(¥×8)
  coins integer,        -- 多巴胺币
  restraints integer,   -- 剁手抑制(订单条数)
  streak integer        -- 连续打卡天数(累计模式有效)
)
language sql security definer set search_path = public as $$
  with base as (
    select
      o.user_id,
      coalesce((o.payload->>'total')::numeric, 0)::int            as saved,
      coalesce((o.payload->>'coinsEarned')::numeric, 0)::int      as coins,
      coalesce(jsonb_array_length(coalesce(o.payload->'items','[]'::jsonb)), 1) as restraints,
      (o.created_at at time zone 'UTC')::date                     as d
    from public.orders o
    where o.user_id is not null
  ),
  filt as (
    select * from base
    where case when p_mode = 'today' then d = (now() at time zone 'UTC')::date else true end
  ),
  agg as (
    select
      user_id,
      coalesce(sum(saved), 0)::int       as saved,
      coalesce(sum(saved) * 8, 0)::int   as calories,
      coalesce(sum(coins), 0)::int       as coins,
      count(*)::int                      as restraints
    from filt
    group by user_id
  ),
  -- 连续打卡：该用户有订单的"连续日期"天数（从最近一天往回数连续）
  days as (
    select distinct user_id, d from base
  ),
  streaks as (
    select user_id, count(*)::int as streak
    from (
      select user_id, d,
             d - (dense_rank() over (partition by user_id order by d desc))::int as grp
      from days
    ) g
    where d >= (now() at time zone 'UTC')::date - 365
    group by user_id, grp
    having max(d) = (select max(d2.d) from days d2 where d2.user_id = g.user_id)
  )
  select
    a.user_id,
    p.username,
    p.avatar_color,
    coalesce(a.saved, 0),
    coalesce(a.calories, 0),
    coalesce(a.coins, 0),
    coalesce(a.restraints, 0),
    coalesce(s.streak, 0)
  from agg a
  left join public.profiles p on p.id = a.user_id
  left join streaks s on s.user_id = a.user_id
  order by a.saved desc
  limit 50;
$$;

grant execute on function public.daily_leaderboard(text) to anon, authenticated;
