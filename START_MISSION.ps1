param([string]$OutputDirectory = "results")
$ErrorActionPreference = "Stop"
$missionRoot = $PSScriptRoot
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand) {
    throw "Python 3.10+ is required. Install Python, reopen PowerShell, then run this script again."
}
try {
    & $pythonCommand.Source -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)" *> $null
    $pythonProbeExit = $LASTEXITCODE
} catch { throw "Python 3.10+ is required. Install Python, reopen PowerShell, then run this script again." }
if ($pythonProbeExit -ne 0) { throw "Python 3.10+ is required. Install Python, reopen PowerShell, then run this script again." }
$missionData = Join-Path $missionRoot "data"
foreach ($missionFile in @("audit.csv", "source-registry.json", "deployments.csv", "github-inventory.ndjson")) {
    if (-not (Test-Path -LiteralPath (Join-Path $missionData $missionFile) -PathType Leaf)) {
        throw "Missing data/$missionFile. Use the complete QMOOSA master package, or supply the audited inputs described in the runbook."
    }
}
$missionOutput = if ([IO.Path]::IsPathRooted($OutputDirectory)) { $OutputDirectory } else { Join-Path $missionRoot $OutputDirectory }
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$gitCommand = Get-Command git -ErrorAction SilentlyContinue
if (-not $nodeCommand -or -not $gitCommand) { throw "Node.js 22+ and Git are required for the local technical self-tests." }
Push-Location $missionRoot
try {
    & $pythonCommand.Source -m unittest discover -s tests -p test_portfolio_master.py -v
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & $nodeCommand.Source --test tests/mission-control.test.mjs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally { Pop-Location }
$missionArguments = @(
    (Join-Path $missionRoot "tools/portfolio_master.py"), "plan",
    "--audit", (Join-Path $missionData "audit.csv"),
    "--registry", (Join-Path $missionData "source-registry.json"),
    "--deployments", (Join-Path $missionData "deployments.csv"),
    "--inventory", (Join-Path $missionData "github-inventory.ndjson"),
    "--chains", (Join-Path $missionRoot "config/top100-chains.json"),
    "--focus", "country-un", "--out", $missionOutput
)
& $pythonCommand.Source @missionArguments
$missionExitCode = $LASTEXITCODE
if ($missionExitCode -ne 0) { exit $missionExitCode }
Write-Host "Inventory and review queue reproduced. These results do not certify completed products."
Write-Host "Next: give MASTER_PROMPT.md to the coding agent to continue repairs, real tests and reviewed PRs."
Write-Host "No deployment, signing, minting, paid infrastructure or mainnet spending was executed."
Write-Host "Results: $missionOutput"
