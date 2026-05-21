$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectName = Split-Path -Leaf $root
$parent = Split-Path -Parent $root
$staging = Join-Path $parent "$projectName-submission-staging"
$zipPath = Join-Path $parent "$projectName-submission.zip"

$excludeDirectories = @(
    ".git",
    ".vscode",
    ".idea",
    "venv",
    "__pycache__",
    "node_modules",
    "dist",
    ".vite"
)

$excludeFiles = @(
    ".env",
    "backend.log",
    "backend.err.log",
    "fanpulse.db",
    "*.pyc",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*"
)

if (Test-Path $staging) {
    Remove-Item -LiteralPath $staging -Recurse -Force
}

if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

New-Item -ItemType Directory -Path $staging | Out-Null

robocopy $root $staging /E /XD $excludeDirectories /XF $excludeFiles /NFL /NDL /NJH /NJS /NC /NS | Out-Null
if ($LASTEXITCODE -gt 7) {
    throw "robocopy failed with exit code $LASTEXITCODE"
}

Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -Force
Remove-Item -LiteralPath $staging -Recurse -Force

Write-Output "Created submission zip: $zipPath"
