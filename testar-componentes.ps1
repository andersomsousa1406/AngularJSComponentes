param([switch]$Ui)
$ErrorActionPreference = 'Stop'
$projectDirectory = $PSScriptRoot
$nodeExecutable = (Get-Command node -ErrorAction SilentlyContinue).Source
$nodeMajor = 0
if ($nodeExecutable) {
    $nodeVersion = & $nodeExecutable --version
    if ($nodeVersion -match '^v(\d+)\.') { $nodeMajor = [int]$Matches[1] }
}
if ($nodeMajor -lt 22) {
    $nvmDirectory = Join-Path $env:APPDATA 'nvm'
    $installedNodes = Get-ChildItem -LiteralPath $nvmDirectory -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match '^v(\d+)\.' -and [int]$Matches[1] -ge 22 } |
        Sort-Object { [version]($_.Name.Substring(1)) } -Descending
    $nodeExecutable = $installedNodes | ForEach-Object { Join-Path $_.FullName 'node.exe' } |
        Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}
if (-not $nodeExecutable) { throw 'Node.js 22 ou superior nao encontrado.' }
Push-Location -LiteralPath $projectDirectory
try {
    $buildScript = if ($Ui) { 'scripts/build-ui-kit.js' } else { 'scripts/build-legacy-migration.js' }
    & $nodeExecutable $buildScript
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar os componentes.' }
    if ($Ui) { & $nodeExecutable scripts/serve-lab.js --ui-kit }
    else { & $nodeExecutable scripts/serve-lab.js }
} finally {
    Pop-Location
}
