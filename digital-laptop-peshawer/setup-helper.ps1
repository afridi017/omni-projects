# Digital Laptop - DB Setup Helper
# Runs database push + seed and logs output to setup-output.txt

$ErrorActionPreference = "Continue"
$log = "C:\CODEX\digital-laptop-peshawer\setup-output.txt"
"=== SETUP START $(Get-Date) ===" | Out-File $log -Encoding utf8

# 1. Check node/npm
"node: $(node --version 2>&1)" | Out-File $log -Append -Encoding utf8
"npm: $(npm --version 2>&1)" | Out-File $log -Append -Encoding utf8

# 2. Install deps if missing
if (-not (Test-Path "C:\CODEX\digital-laptop-peshawer\node_modules")) {
    "Installing dependencies..." | Out-File $log -Append -Encoding utf8
    Push-Location "C:\CODEX\digital-laptop-peshawer"
    npm install --no-audit --no-fund 2>&1 | Out-File $log -Append -Encoding utf8
    Pop-Location
} else {
    "node_modules exists - skipping install" | Out-File $log -Append -Encoding utf8
}

# 3. Test DB connection directly (without channel_binding)
"--- DB CONNECTION TEST ---" | Out-File $log -Append -Encoding utf8
Push-Location "C:\CODEX\digital-laptop-peshawer"
node -e "const {Pool}=require('pg'); const p=new Pool({connectionString:'postgresql://neondb_owner:npg_ptDR6bWjFYL4@ep-proud-hat-a5m3ej53-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'}); p.query('select 1 as ok').then(r=>{require('fs').appendFileSync('$log','CONNECTED '+JSON.stringify(r.rows[0])+'\n'); p.end();}).catch(e=>{require('fs').appendFileSync('$log','FAILED: '+e.message+'\n'); p.end();});" 2>&1 | Out-File $log -Append -Encoding utf8
Pop-Location

"=== SETUP END $(Get-Date) ===" | Out-File $log -Append -Encoding utf8