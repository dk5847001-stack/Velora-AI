param(
  [ValidateRange(1, 500)]
  [int]$Count = 100
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  & git @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw ("git {0} failed with exit code {1}." -f ($Arguments -join ' '), $LASTEXITCODE)
  }
}

# Stop early so `git add .` only captures the changes created by this script.
if (git status --porcelain) {
  throw 'The working tree must be clean before running batch-progress-updates.ps1.'
}

$progressDir = Join-Path $repoRoot 'docs\progress'
$ledgerPath = Join-Path $progressDir 'updates.md'

if (-not (Test-Path $progressDir)) {
  New-Item -ItemType Directory -Path $progressDir | Out-Null
}

if (-not (Test-Path $ledgerPath)) {
  @(
    '# Progress Updates'
    ''
    'This file records intentionally small, repo-safe documentation updates.'
    ''
  ) | Set-Content -Path $ledgerPath -Encoding utf8
}

# Keep the batch limited to documentation so the app behavior stays unchanged.
$areas = @(
  'client app shell'
  'client auth flow'
  'chat composer'
  'chat header'
  'chat message renderer'
  'empty state'
  'sidebar interactions'
  'auth context'
  'API client setup'
  'format helpers'
  'server bootstrap'
  'Express app wiring'
  'database connection'
  'auth controller'
  'chat controller'
  'auth middleware'
  'error middleware'
  'chat model'
  'user model'
  'auth routes'
  'chat routes'
  'assistant service'
  'demo assistant'
  'local knowledge service'
  'math assistant'
  'OpenAI service'
  'async utilities'
  'token generation'
  'README setup steps'
  'environment examples'
  'build outputs'
  'development scripts'
  'Vite proxy behavior'
  'JWT token lifecycle'
  'Mongo persistence'
  'Markdown rendering'
  'syntax highlighting'
  'mobile layout'
  'desktop layout'
  'loading states'
  'error handling'
  'request validation'
  'response formatting'
  'session recovery'
  'route protection'
  'chat history loading'
  'message persistence'
  'AI fallback handling'
  'logout behavior'
  'signup flow'
  'login flow'
  'form feedback'
  'placeholder copy'
  'component naming'
  'folder structure'
  'API route surface'
  'deployment assumptions'
  'local demo mode'
  'history sidebar'
  'chat deletion flow'
  'new chat creation'
  'message submit path'
  'copy button behavior'
  'scroll behavior'
  'environment variable usage'
  'port configuration'
  'client entry point'
  'server entry point'
  'Mongoose models'
  'React pages'
  'shared utilities'
  'documentation tone'
  'setup clarity'
  'runbook details'
  'debug logs hygiene'
  'production build notes'
  'package scripts'
  'dependency boundaries'
  'frontend state flow'
  'backend service boundaries'
  'error messages'
  'API fallback paths'
  'response timing notes'
  'prompt handling'
  'request auth headers'
  'client routing'
  'server routing'
  'modular file layout'
  'project overview'
  'feature list'
  'testing gaps'
  'maintenance checklist'
  'future backlog'
  'troubleshooting notes'
  'developer onboarding'
  'release notes'
  'repo hygiene'
  'safe commit cadence'
  'change log structure'
  'documentation coverage'
)

$commitMessages = @(
  'docs: note {0} progress'
  'docs: refine {0} update'
  'docs: record {0} checkpoint'
  'docs: clarify {0} progress'
  'docs: track {0} update'
)

$existingCount = 0

if (Test-Path $ledgerPath) {
  $existingCount = (Select-String -Path $ledgerPath -Pattern '^- Update \d+:' | Measure-Object).Count
}

if ($existingCount -gt 0) {
  $ledger = Get-Content -Path $ledgerPath

  if ($ledger.Count -ge 3 -and $ledger[2] -eq 'This file records 100 intentionally small, repo-safe documentation updates.') {
    $ledger[2] = 'This file records intentionally small, repo-safe documentation updates.'
    Set-Content -Path $ledgerPath -Value $ledger -Encoding utf8
  }
}

$targetCount = $existingCount + $Count

if ($Count -le 0) {
  Write-Host 'No pending updates. The requested count is zero.'
  exit 0
}

for ($i = $existingCount; $i -lt $targetCount; $i++) {
  $updateNumber = $i + 1
  $area = $areas[$i % $areas.Count]
  $passNumber = [math]::Floor($i / $areas.Count) + 1
  $line = "- Update {0:D3}: Recorded pass {1} progress note about the {2}." -f $updateNumber, $passNumber, $area
  $commitMessageTemplate = $commitMessages[$i % $commitMessages.Count]
  $commitMessage = ($commitMessageTemplate -f $area)

  Add-Content -Path $ledgerPath -Value $line -Encoding utf8
  Write-Host ("Applying update {0:D3}/{1:D3}" -f $updateNumber, $targetCount)

  Invoke-Git -Arguments @('add', '.')
  Invoke-Git -Arguments @('commit', '-m', $commitMessage)
  Invoke-Git -Arguments @('push', 'origin', 'main')
}

Write-Host ("Completed {0} small updates." -f $Count)
