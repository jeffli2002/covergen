# How to Access the Application from Windows

Since WSL2 has network issues with Google OAuth, you need to access the application from Windows. Here are the correct steps:

## Option 1: Use localhost from Windows (Simplest)
1. The server is running in WSL2 on port 3001
2. Simply open your Windows browser and go to:
   ```
   http://localhost:3001/test-bestauth
   ```

## Option 2: Allow Windows Firewall (if localhost doesn't work)
If localhost doesn't work, Windows Firewall might be blocking it:

1. Open Windows PowerShell as Administrator
2. Run this command to allow WSL2 access:
   ```powershell
   New-NetFirewallRule -DisplayName "WSL" -Direction Inbound -InterfaceAlias "vEthernet (WSL)" -Action Allow
   ```

## Option 3: Use WSL2 IP directly
1. Your WSL2 IP is: `172.26.198.29`
2. Try accessing:
   ```
   http://172.26.198.29:3001/test-bestauth
   ```

## Testing
Once you can access the page:
1. Click "Sign in with Google"
2. Complete the OAuth flow
3. You should be redirected back successfully

The key is that the browser making the OAuth request must be running in Windows (not WSL2) to avoid the network timeout issue.