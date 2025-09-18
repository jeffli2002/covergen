-- 查询用户基础信息，包含邮箱、登录时间、用户等级
SELECT 
    -- 用户基本信息
    au.id AS user_id,
    au.email,
    au.raw_user_meta_data->>'full_name' AS full_name,
    au.raw_user_meta_data->>'avatar_url' AS avatar_url,
    
    -- 认证登录时间
    au.created_at AS first_registered_at,
    au.last_sign_in_at AS last_login_at,
    au.confirmed_at AS email_confirmed_at,
    
    -- 用户等级和订阅信息（从subscriptions_consolidated表获取）
    COALESCE(sc.tier, 'free') AS subscription_plan,
    COALESCE(sc.status, 'inactive') AS subscription_status,
    sc.daily_limit AS daily_quota_limit,
    sc.current_period_end AS subscription_expires_at,
    
    -- 用户使用情况（从user_usage表获取）
    COALESCE(uu.usage_count, 0) AS current_month_usage,
    COALESCE(uu.subscription_tier, 'free') AS user_level,
    uu.month_key AS usage_month,
    uu.last_used_at AS last_generation_time,
    
    -- 账户状态
    CASE 
        WHEN au.banned_until IS NOT NULL AND au.banned_until > NOW() THEN 'banned'
        WHEN au.confirmed_at IS NULL THEN 'unconfirmed'
        ELSE 'active'
    END AS account_status,
    
    -- 登录方式
    CASE 
        WHEN au.raw_user_meta_data->>'provider' = 'google' THEN 'Google OAuth'
        WHEN au.raw_user_meta_data->>'provider' = 'email' THEN 'Email/Password'
        ELSE COALESCE(au.raw_user_meta_data->>'provider', 'Unknown')
    END AS login_provider

FROM auth.users au

-- 关联用户订阅表
LEFT JOIN public.subscriptions_consolidated sc ON sc.user_id = au.id

-- 关联当前月份的使用情况
LEFT JOIN public.user_usage uu ON uu.user_id = au.id 
    AND uu.month_key = TO_CHAR(NOW(), 'YYYY-MM')

-- 按最近登录时间排序
ORDER BY au.last_sign_in_at DESC NULLS LAST;

-- 如果只想看活跃用户，可以添加WHERE条件：
-- WHERE au.confirmed_at IS NOT NULL
-- AND au.last_sign_in_at > NOW() - INTERVAL '30 days'

-- 如果想按用户等级筛选：
-- WHERE COALESCE(p.subscription_tier, 'free') = 'pro'

-- 如果想看特定时间段的授权登录用户：
-- WHERE au.created_at BETWEEN '2025-01-01' AND '2025-01-31'