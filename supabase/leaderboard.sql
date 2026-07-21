-- ============================================================================
-- 每日自律省钱排行榜（每日榜 + 累计榜）—— 单独执行段
-- 在 Supabase SQL Editor 整段粘贴运行即可。
-- 立意：Dopahub 虚拟下单=¥0真实支付，每笔都是"忍住的冲动消费"。
-- 指标：省钱金额(total)、卡路里(¥×8 趣味换算)、多巴胺币(coinsEarned)、
--       剁手抑制(订单条数)、连续打卡天数。
-- ============================================================================

-- profiles 公开读（排行榜要显示别人昵称/头像；email/phone 仍受各自 RLS 保护）
drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
  for select using (true);

-- orders 公开读（排行榜聚合需要；rpc 只返回聚合数值，不暴露明细）
drop policy if exists orders_public_read on public.orders;
create policy orders_public_read on public.orders
  for select using (true);

-- 今日榜 / 累计榜聚合函数。p_mode: 'today' | 'all'。卡路里 = 省钱金额 × 8。
create or replace function public.daily_leaderboard(p_mode text default 'today')
returns table (
  user_id uuid,
  username text,
  avatar_color text,
  saved integer,
  calories integer,
  coins integer,
  restraints integer,
  streak integer
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
