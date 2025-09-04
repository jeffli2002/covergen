# Subscription Paused Status UI Fix

## Issue
Test failure: "Paused status not properly handled in UI"

## Root Cause
The UI doesn't have handling for the 'paused' subscription status from Creem webhooks.

## Fix Required

1. **Update Subscription Type Definition**
   ```typescript
   // In types/supabase.ts or similar
   export type SubscriptionStatus = 
     | 'active'
     | 'past_due'
     | 'canceled'
     | 'paused'  // Add this
     | 'trialing';
   ```

2. **Handle Paused Status in Account Page**
   ```tsx
   // In account page component
   const getSubscriptionStatusBadge = (status: SubscriptionStatus) => {
     switch (status) {
       case 'active':
         return <Badge variant="success">Active</Badge>;
       case 'paused':
         return <Badge variant="warning">Paused</Badge>;
       case 'past_due':
         return <Badge variant="error">Payment Required</Badge>;
       case 'canceled':
         return <Badge variant="default">Canceled</Badge>;
       default:
         return null;
     }
   };
   
   // Show appropriate message for paused subscriptions
   {subscription?.status === 'paused' && (
     <Alert variant="warning">
       <AlertDescription>
         Your subscription is currently paused. You won't be charged until you resume it.
         <Button 
           onClick={handleResumeSubscription}
           className="mt-2"
           size="sm"
         >
           Resume Subscription
         </Button>
       </AlertDescription>
     </Alert>
   )}
   ```

3. **Update Webhook Handler**
   ```typescript
   // In webhook route handler
   case 'subscription.paused':
     await supabase
       .from('subscriptions')
       .update({
         status: 'paused',
         paused_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       })
       .eq('creem_subscription_id', subscription.id);
     break;
   ```

4. **Add Resume Functionality**
   ```typescript
   const handleResumeSubscription = async () => {
     const response = await fetch('/api/payment/resume-subscription', {
       method: 'POST',
     });
     if (response.ok) {
       toast.success('Subscription resumed successfully');
       router.refresh();
     }
   };
   ```