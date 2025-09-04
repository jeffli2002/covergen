# Payment Cancellation Flow Fix

## Issue
Test failure: "Expected button 'Cancel Subscription' not found"

## Root Cause
The cancellation flow in the account page is not properly implemented. The button to manage subscription needs to be added and connected to the Creem customer portal.

## Fix Required

1. **Add Cancel Subscription Button in Account Page**
   - Update `/src/app/[locale]/account/page-client.tsx` to include a manage subscription button
   - Add proper data-testid for testing

2. **Implement Creem Portal Integration**
   ```typescript
   // In payment service
   async createCustomerPortalSession(customerId: string) {
     const portalSession = await creem.billingPortal.sessions.create({
       customer: customerId,
       return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
     });
     return portalSession.url;
   }
   ```

3. **Update Account Page Component**
   ```tsx
   const handleManageSubscription = async () => {
     const response = await fetch('/api/payment/create-portal', {
       method: 'POST',
     });
     const { url } = await response.json();
     window.open(url, '_blank');
   };
   ```

## Test Update
The test should be updated to handle the portal opening in a new window/tab.