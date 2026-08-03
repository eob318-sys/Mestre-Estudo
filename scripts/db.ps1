param(
  [Parameter(Position = 0, Mandatory = $true)]
  [ValidateSet("start", "stop", "status", "setup")]
  [string]$Action
)

$ErrorActionPreference = "Stop"
$root = Join-Path $env:USERPROFILE ".mestre-postgres"
$bin  = Join-Path $root "pgsql\bin"
$data = Join-Path $root "data"
$log  = Join-Path $root "pg.log"
$db   = "mestredofestudo"
$isRunning = $false
if (Test-Path "$data\postmaster.pid") {
  $ready = & (Join-Path $bin "pg_isready.exe") -q -h 127.0.0.1 -p 5432 2>$null
  $isRunning = ($LASTEXITCODE -eq 0)
}

function StartPgViaWmi {
  # Win32_Process.Create desanexa o Postgres do terminal (sobrevive ao fechar o shell).
  $cmd = "`"$bin\pg_ctl.exe`" start -D `"$data`" -l `"$log`" -o `"-p 5432`""
  $r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmd }
  if ($r.ReturnValue -ne 0) { throw "Falha ao iniciar o Postgres (rc=$($r.ReturnValue))" }
  Start-Sleep -Seconds 3
}

switch ($Action) {
  "start" {
    if ($isRunning) {
      Write-Host "PostgreSQL ja esta rodando."
    } else {
      StartPgViaWmi
      Write-Host "PostgreSQL iniciado (porta 5432). Parar com: npm run db:stop"
    }
  }
  "stop" {
    if (-not $isRunning) {
      Write-Host "PostgreSQL nao esta rodando."
    } else {
      & (Join-Path $bin "pg_ctl.exe") @("stop", "-D", $data)
      if ($LASTEXITCODE -ne 0) { throw "pg_ctl stop falhou" }
      Write-Host "PostgreSQL parado."
    }
  }
  "status" {
    & (Join-Path $bin "pg_isready.exe") -h 127.0.0.1 -p 5432
  }
  "setup" {
    if (-not $isRunning) { StartPgViaWmi }
    $exists = & (Join-Path $bin "psql.exe") -U postgres -h 127.0.0.1 -p 5432 -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" 2>$null
    if (($exists | Out-String).Trim() -ne "1") {
      & (Join-Path $bin "createdb.exe") -U postgres -h 127.0.0.1 -p 5432 $db
      if ($LASTEXITCODE -ne 0) { throw "createdb falhou" }
      Write-Host "Banco '$db' criado."
    } else {
      Write-Host "Banco '$db' ja existe."
    }
    Push-Location (Join-Path $PSScriptRoot "..")
    try {
      npx.cmd prisma db push
      if ($LASTEXITCODE -ne 0) { throw "prisma db push falhou" }
      npx.cmd prisma db seed
      if ($LASTEXITCODE -ne 0) { throw "prisma db seed falhou" }
      Write-Host "Schema e seed aplicados com sucesso."
    } finally {
      Pop-Location
    }
  }
}