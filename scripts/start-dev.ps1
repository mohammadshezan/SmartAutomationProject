# PowerShell script to clean ports and start development server
Write-Host "Cleaning up ports..." -ForegroundColor Yellow

# Do not kill all Node.js processes (this can terminate npm itself). We'll free specific ports instead.

function Stop-PortListeners {
    param([int[]]$Ports)
    foreach ($port in $Ports) {
        $connections = @()
        try { $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue } catch {}
        if ($connections -and $connections.Count -gt 0) {
            Write-Host "Port $port in LISTENING state, attempting to free..." -ForegroundColor Yellow
            $pids = @()
            foreach ($c in $connections) { if ($c.OwningProcess) { $pids += $c.OwningProcess } }
            $pids = $pids | Sort-Object -Unique
            foreach ($pid in $pids) {
                try { taskkill /PID $pid /F 2>$null; Write-Host "Killed process $pid (port $port)" -ForegroundColor Green }
                catch { Write-Host "Could not kill process $pid (port $port)" -ForegroundColor Red }
            }
            Start-Sleep -Seconds 1
        }
    }
}

# Free common dev ports that may conflict (web:3000, api:3001/4000)
Stop-PortListeners -Ports @(3000,3001,4000,5000)

## Web: prefer 3005 by default to avoid frequent 3000 collisions on Windows
$env:NEXT_PUBLIC_WEB_PORT = "3005"
Write-Host "Web dev will run on port $($env:NEXT_PUBLIC_WEB_PORT)" -ForegroundColor Green
${useAlt} = $true

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Blue

    # Ensure API and Web agree on API base URL; pick a free API port dynamically starting at 5000
    function Test-PortFree {
        param([int]$Port)
        try {
            $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
            $listener.Start()
            $listener.Stop()
            return $true
        } catch { return $false }
    }

    function Find-FirstFreePort {
        param([int]$StartPort, [int]$MaxAttempts = 20)
        $p = $StartPort
        for ($i = 0; $i -lt $MaxAttempts; $i++) {
            if (Test-PortFree -Port $p) { return $p }
            $p++
        }
        return $StartPort
    }

    $apiPort = Find-FirstFreePort -StartPort 5000
    $env:PORT = "$apiPort"
    $env:NEXT_PUBLIC_API_URL = "http://localhost:$apiPort"
    # Dev OTP behavior: disable email sending and log OTPs for demo
    if (-not $env:SMTP_HOST -or -not $env:SMTP_USER -or -not $env:SMTP_PASS) {
        $env:DISABLE_EMAIL = "1"
        $env:OTP_DEV_LOG = "1"
        # Optional: verify SMTP transporter when configured
        $env:OTP_DEBUG = "0"
        Write-Host "SMTP not configured. DISABLE_EMAIL=1, OTP_DEV_LOG=1 (use 123456 for *@sail.test)" -ForegroundColor Yellow
    }
    Write-Host "API will run on port $apiPort" -ForegroundColor Green

# Start the development server (fallback to alt when 3000 busy)
Set-Location $PSScriptRoot\..
# Always start dev-alt since we default web to 3005
Write-Host "Starting dev-alt (API + Web on $($env:NEXT_PUBLIC_WEB_PORT))" -ForegroundColor Green
npm run dev-alt