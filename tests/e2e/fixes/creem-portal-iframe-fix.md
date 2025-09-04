# Creem Portal Iframe Loading Fix

## Issue
Test failure: "Creem portal iframe not loading properly"

## Root Cause
The Creem customer portal is opening in a new window instead of an iframe, or the iframe security policies are blocking it.

## Fix Required

1. **Option 1: Use Portal in New Window (Recommended)**
   ```typescript
   // This is actually the correct approach for security
   const handleManageSubscription = async () => {
     setLoading(true);
     try {
       const response = await fetch('/api/payment/create-portal', {
         method: 'POST',
       });
       const { url } = await response.json();
       
       // Open in new tab
       window.open(url, '_blank', 'noopener,noreferrer');
     } catch (error) {
       console.error('Failed to open billing portal:', error);
       toast.error('Failed to open billing portal');
     } finally {
       setLoading(false);
     }
   };
   ```

2. **Update Test to Handle New Window**
   ```typescript
   test('Pro user can cancel subscription', async ({ page, context }) => {
     // ... setup code ...
     
     // Listen for new page/tab
     const pagePromise = context.waitForEvent('page');
     
     // Click manage subscription
     await page.getByRole('button', { name: /manage subscription/i }).click();
     
     // Get the new page
     const portalPage = await pagePromise;
     await portalPage.waitForLoadState();
     
     // Interact with portal in new tab
     await portalPage.getByRole('button', { name: /cancel plan/i }).click();
     // ... rest of test
   });
   ```

3. **Add Portal Return URL Handler**
   When users return from the portal, show appropriate messages based on URL parameters.