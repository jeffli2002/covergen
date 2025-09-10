// Client-side configuration for subscription tiers and limits
// This file is for use in client components

export const getClientSubscriptionConfig = () => {
  const config = {
    trialDays: parseInt(process.env.NEXT_PUBLIC_TRIAL_DAYS || '7'),
    limits: {
      free: {
        daily: parseInt(process.env.NEXT_PUBLIC_FREE_DAILY_LIMIT || '3'),
        monthly: parseInt(process.env.NEXT_PUBLIC_FREE_MONTHLY_LIMIT || '10')
      },
      pro: {
        monthly: parseInt(process.env.NEXT_PUBLIC_PRO_MONTHLY_LIMIT || '120'),
        trial_daily: parseInt(process.env.NEXT_PUBLIC_PRO_TRIAL_DAILY_LIMIT || '4')
      },
      pro_plus: {
        monthly: parseInt(process.env.NEXT_PUBLIC_PRO_PLUS_MONTHLY_LIMIT || '300'),
        trial_daily: parseInt(process.env.NEXT_PUBLIC_PRO_PLUS_TRIAL_DAILY_LIMIT || '7')
      }
    }
  }

  // Calculate trial limits based on trial days
  if (config.trialDays > 0) {
    config.limits.pro.trial_total = Math.ceil((config.limits.pro.monthly / 30) * config.trialDays)
    config.limits.pro_plus.trial_total = Math.ceil((config.limits.pro_plus.monthly / 30) * config.trialDays)
  } else {
    // No trial if trial days is 0
    config.limits.pro.trial_total = 0
    config.limits.pro_plus.trial_total = 0
  }

  return config
}

// Helper to format trial period text
export const getTrialPeriodText = (): string => {
  const config = getClientSubscriptionConfig()
  if (config.trialDays === 0) {
    return 'No trial'
  } else if (config.trialDays === 1) {
    return '1-day trial'
  } else {
    return `${config.trialDays}-day trial`
  }
}

// Helper to format trial period with "free" text
export const getTrialPeriodFullText = (): string => {
  const config = getClientSubscriptionConfig()
  if (config.trialDays === 0) {
    return ''
  } else if (config.trialDays === 1) {
    return '1-day free trial'
  } else {
    return `${config.trialDays}-day free trial`
  }
}

// Helper to check if trials are enabled
export const isTrialEnabledClient = (): boolean => {
  const config = getClientSubscriptionConfig()
  return config.trialDays > 0
}