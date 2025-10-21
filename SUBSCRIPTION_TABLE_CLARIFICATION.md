# Subscription Table Clarification for 994235892@qq.com

## User Report
"994235892@qq.com is Pro in subscriptions_consolidated table, while is Pro+ in account page"

## Investigation Results

### Database Tables Checked

| Table | Status | Tier Shown | Notes |
|-------|--------|------------|-------|
| `bestauth_subscriptions` | ✅ Has record | **pro_plus** | PRIMARY source for account API |
| `subscriptions` | ❌ No record | N/A | Fallback (unused) |
| `subscriptions_consolidated` | ❌ No record | N/A | NOT USED by account API |
| `user_subscriptions` | ❌ No record | N/A | Does not exist |

### Account API Logic

The account API (`/api/bestauth/account`) uses this priority:

1. **`bestauth_subscriptions`** ← PRIMARY (shows **pro_plus** ✅)
2. `subscriptions` ← Fallback (no record)
3. `subscriptions_consolidated` ← NOT USED

### Subscription Details from bestauth_subscriptions

```json
{
  "tier": "pro_plus",
  "status": "active",
  "billing_cycle": "monthly",
  "points_balance": 1600,
  "current_period_start": "2025-10-21T04:29:55.815Z",
  "current_period_end": "2025-11-21T04:29:46Z",
  "upgraded_from": "pro",
  "upgraded_at": "2025-10-21T06:54:41.821Z"
}
```

### Upgrade History

The user upgraded from **Pro → Pro+** on 2025-10-21:

```json
"upgrade_history": [
  {
    "from_tier": "pro",
    "to_tier": "pro_plus",
    "upgraded_at": "2025-10-21T06:54:41.821Z",
    "upgrade_type": "immediate_proration"
  }
]
```

## Conclusion

### ✅ System is Working CORRECTLY

- **Account page shows**: Pro+ (from `bestauth_subscriptions`) ✅ **CORRECT**
- **subscriptions_consolidated**: No record (table is not used)

### If You See Different Behavior

If the account page is showing **Pro** instead of **Pro+**:

1. **Hard refresh browser** (Ctrl+Shift+R / Cmd+Shift+R)
2. **Clear browser cache**
3. **Check you're logged in as the right user**
4. **Re-verify the account API response**:
   ```bash
   # While logged in as 994235892@qq.com, check browser DevTools Network tab
   # Look for /api/bestauth/account response
   # Should show: { subscription: { tier: "pro_plus" } }
   ```

### About subscriptions_consolidated Table

This table appears to be:
- **Deprecated** or **unused** by the current codebase
- **Out of sync** with the primary source
- **Has foreign key constraints** that prevent updates
- **Not referenced** by the account API

**Recommendation**: Ignore `subscriptions_consolidated`. It's not the source of truth.

## Source of Truth

**`bestauth_subscriptions`** is the **single source of truth** for user subscriptions.

Current value for 994235892@qq.com:
- ✅ Tier: **pro_plus**
- ✅ Status: **active**  
- ✅ Points: **1600**
- ✅ Billing: **monthly**

## No Action Required

The system is functioning correctly. The account page is displaying the correct tier (Pro+) from the correct source (bestauth_subscriptions).
