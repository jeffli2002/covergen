# Prorated Pricing Display Fix

## Issue
Test failure: "Prorated amount calculation incorrect"

## Root Cause
The payment page is not calculating or displaying prorated amounts when upgrading from Pro to Pro+.

## Fix Required

1. **Add Proration Calculation Logic**
   ```typescript
   // In payment page component
   const calculateProration = (currentPlan: string, newPlan: string, daysRemaining: number) => {
     const plans = {
       pro: 9.99,
       'pro-plus': 19.99
     };
     
     const dailyCurrentRate = plans[currentPlan] / 30;
     const dailyNewRate = plans[newPlan] / 30;
     
     const unusedCredit = dailyCurrentRate * daysRemaining;
     const newCharge = dailyNewRate * daysRemaining;
     
     return {
       credit: unusedCredit,
       charge: newCharge,
       total: newCharge - unusedCredit
     };
   };
   ```

2. **Update Payment Page UI**
   ```tsx
   {isUpgrade && proration && (
     <div className="border rounded-lg p-4 mb-4">
       <h3 className="font-semibold mb-2">Upgrade Summary</h3>
       <div className="space-y-1 text-sm">
         <div className="flex justify-between">
           <span>Credit for unused Pro time:</span>
           <span>-${proration.credit.toFixed(2)}</span>
         </div>
         <div className="flex justify-between">
           <span>Pro+ charge (prorated):</span>
           <span>${proration.charge.toFixed(2)}</span>
         </div>
         <div className="flex justify-between font-semibold border-t pt-1">
           <span>Total due today:</span>
           <span>${proration.total.toFixed(2)}</span>
         </div>
       </div>
     </div>
   )}
   ```

3. **Pass Proration to Creem**
   Include the prorated amount in the payment intent creation.