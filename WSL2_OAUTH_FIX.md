# WSL2 Google OAuth Fix

## Problem
Google OAuth is failing with network timeout errors in WSL2. This is a common issue where WSL2 cannot connect to external services like Google OAuth endpoints.

## Solution Options

### Option 1: Use Windows Host Browser (Recommended)
Instead of using `http://localhost:3001`, use your Windows host IP:

1. Find your Windows host IP from WSL2:
   ```bash
   cat /etc/resolv.conf | grep nameserver | awk '{print $2}'
   ```

2. Access your app using the Windows host IP:
   ```
   http://[WINDOWS_HOST_IP]:3001
   ```

3. Google OAuth should work properly when accessed from Windows.

### Option 2: Fix WSL2 DNS (Applied)
The code has been updated with a WSL2 DNS fix that:
- Forces Google DNS servers (8.8.8.8)
- Implements retry logic with exponential backoff
- Uses shorter timeouts for faster failure detection

### Option 3: Use WSL2 Network Bridge (Advanced)
1. In Windows PowerShell (as Administrator):
   ```powershell
   New-NetIPAddress -IPAddress 192.168.50.1 -PrefixLength 24 -InterfaceAlias "vEthernet (WSL)"
   ```

2. In WSL2, add to `/etc/wsl.conf`:
   ```
   [network]
   generateResolvConf = false
   ```

3. Create `/etc/resolv.conf`:
   ```
   nameserver 8.8.8.8
   nameserver 8.8.4.4
   ```

### Option 4: Disable IPv6 in WSL2
Add to `.wslconfig` in your Windows user folder:
```
[wsl2]
ipv6=false
```

Then restart WSL2:
```powershell
wsl --shutdown
```

## Quick Test
Test if Google OAuth endpoint is reachable:
```bash
curl -I https://oauth2.googleapis.com/token --max-time 5
```

If this times out, you have a WSL2 networking issue and should use Option 1 (Windows host browser).