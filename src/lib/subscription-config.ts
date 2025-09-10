// Configuration for subscription tiers and limits
export const getSubscriptionConfig = () => {
  const config = {
    trialDays: parseInt(process.env.TRIAL_DAYS || '7'),
    limits: {
      free: {
        daily: parseInt(process.env.FREE_DAILY_LIMIT || '3'),
        monthly: parseInt(process.env.FREE_MONTHLY_LIMIT || '10')
      },
      pro: {
        monthly: parseInt(process.env.PRO_MONTHLY_LIMIT || '120'),
        trial_daily: parseInt(process.env.PRO_TRIAL_DAILY_LIMIT || '4')
      },
      pro_plus: {
        monthly: parseInt(process.env.PRO_PLUS_MONTHLY_LIMIT || '300'),
        trial_daily: parseInt(process.env.PRO_PLUS_TRIAL_DAILY_LIMIT || '7')
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

// Helper function to calculate trial end date
export const calculateTrialEndDate = (startDate: Date = new Date()): Date | null => {
  const config = getSubscriptionConfig()
  if (config.trialDays <= 0) {
    return null // No trial period
  }
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + config.trialDays)
  return endDate
}

// Helper to check if trials are enabled
export const isTrialEnabled = (): boolean => {
  const config = getSubscriptionConfig()
  return config.trialDays > 0
}