# Evidence harness only. Use in a fresh disposable Windows x64 developer VM or same-session
# stock Windows hosted runner. Never use on the owner's PC, non-disposable profiles, or wine.
[CmdletBinding()]
param(
  [Parameter(Mandatory)][string]$Checkout,
  [Parameter(Mandatory)][string]$EvidencePath
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ReviewedCommit = 'f040305b8ddaf0abd511201ac1ab6e5b2d17b77b'
$ExpectedCommit = $env:ENDERLOOM_WRAPPER_EVIDENCE_COMMIT
if ($ExpectedCommit -cnotmatch '^[0-9a-f]{40}$') { throw 'Missing exact GitHub proof head.' }
if (-not $IsWindows -or -not [Environment]::Is64BitProcess) { throw 'Requires stock Windows x64 PowerShell 7.' }
if (-not [Environment]::UserInteractive) { throw 'Normal window evidence unavailable: no interactive Windows desktop.' }
$lockedEnv = @('ELECTRON_PATH', 'ELECTRON_OVERRIDE_DIST_PATH', 'ELECTRON_RUN_AS_NODE', 'ELECTRON_SKIP_BINARY_DOWNLOAD',
  'ELECTRON_MIRROR', 'ELECTRON_NIGHTLY_MIRROR', 'ELECTRON_CUSTOM_DIR', 'ELECTRON_CUSTOM_FILENAME',
  'NODE_PATH', 'NODE_OPTIONS', 'CARGO_TARGET_DIR', 'ENDERLOOM_SERVICE_PATH')
foreach ($key in $lockedEnv) {
  if ([Environment]::GetEnvironmentVariable($key, 'Process')) { throw "Normal product launch cannot have ambient override `$key." }
}
if ($env:RUSTUP_TOOLCHAIN -ne '1.100.0-x86_64-pc-windows-msvc') { throw 'Select the previously verified stock MSVC Rust toolchain.' }
if ((& node --version) -ne 'v22.23.5' -or $LASTEXITCODE -ne 0) { throw 'Use the exact Node version verified with #83.' }
$providedCheckout = (Resolve-Path -LiteralPath $Checkout).ProviderPath
$checkoutPath = & node -e "console.log(require('node:fs').realpathSync.native(process.argv[1]))" $providedCheckout
if ($LASTEXITCODE -ne 0 -or -not $checkoutPath) { throw 'Could not resolve owned physical checkout path.' }
if ($checkoutPath -notmatch ' ') { throw 'Use a fresh checkout in a path containing a space.' }
if ($checkoutPath -match '["%!^&|<>]') { throw 'Use a checkout path without cmd metacharacters.' }
if (Test-Path -LiteralPath $EvidencePath) { throw 'Refuse to replace existing evidence.' }
function AssertCheckout {
  if ((& git -C $checkoutPath rev-parse HEAD) -ne $ExpectedCommit -or $LASTEXITCODE -ne 0) { throw 'Unexpected source commit.' }
  $dirty = & git -C $checkoutPath status --porcelain
  if ($LASTEXITCODE -ne 0 -or $dirty) { throw 'Checkout not clean; no proof admitted.' }
}
AssertCheckout
$parentLine = & git -C $checkoutPath rev-list --parents -n 1 HEAD
if ($LASTEXITCODE -ne 0 -or $parentLine -cne "$ExpectedCommit $ReviewedCommit") { throw 'Proof must be a single-parent commit on the exact reviewed #84 source.' }
$headTree = & git -C $checkoutPath rev-parse 'HEAD^{tree}'
if ($LASTEXITCODE -ne 0 -or $headTree -cnotmatch '^[0-9a-f]{40}$') { throw 'Unable to verify exact evidence checkout tree.' }
$proofFiles = @('.github/workflows/windows-source-wrapper-evidence.yml', 'scripts/windows-source-wrapper-evidence.ps1',
  'scripts/windows-source-wrapper-snapshot.cjs')
$changed = @(& git -C $checkoutPath diff --name-only --no-renames $ReviewedCommit $ExpectedCommit)
if ($LASTEXITCODE -ne 0 -or ($changed -join '|') -cne ($proofFiles -join '|')) { throw 'Proof head changes non-evidence paths.' }
foreach ($relative in @('node_modules', 'launcher/node_modules', 'launcher/dist', 'native/target', '.enderloom-runtime')) {
  if (Test-Path -LiteralPath (Join-Path $checkoutPath $relative)) { throw "Cold checkout contains existing output: `$relative" }
}
$wrapper = Join-Path $checkoutPath 'START_ENDERLOOM.cmd'
$electronExe = Join-Path $checkoutPath 'node_modules\electron\dist\electron.exe'
function OwnedElectron {
  # Exceptional unrelated process/path failures do not count as matches.
  foreach ($p in (Get-Process -Name electron -ErrorAction SilentlyContinue)) {
    if ($p.Path -ieq $electronExe) { $p }
  }
}
function CaptureSnapshot {
  $json = & node (Join-Path $PSScriptRoot 'windows-source-wrapper-snapshot.cjs') $checkoutPath
  if ($LASTEXITCODE -ne 0 -or -not $json) { throw 'Build output evidence did not validate.' }
  return ($json -join [Environment]::NewLine)
}
$workDir = Join-Path ([IO.Path]::GetTempPath()) ('Enderloom wrapper proof ' + [guid]::NewGuid().ToString('N'))
New-Item -Type Directory -Path $workDir | Out-Null
$inputFile = Join-Path $workDir 'input.txt'
[IO.File]::WriteAllText($inputFile, "`r`n")
function InvokeWrapper([string]$phase, [int]$seconds) {
  if (@(OwnedElectron).Count) { throw 'Owned Electron was already running before this launch.' }
  $outFile = Join-Path $workDir "$phase.stdout"
  $errFile = Join-Path $workDir "$phase.stderr"
  $normalWindow = $null
  $watch = [Diagnostics.Stopwatch]::StartNew()
  $cmd = Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\cmd.exe') -ArgumentList ('/d /c call "' + $wrapper + '"') `
    -WorkingDirectory $workDir -NoNewWindow -RedirectStandardInput $inputFile `
    -RedirectStandardOutput $outFile -RedirectStandardError $errFile -PassThru
  try {
    while (-not $cmd.HasExited -and $watch.Elapsed.TotalSeconds -lt $seconds) {
      $found = @(OwnedElectron | Where-Object {
        $_.Refresh()
        # Child Chromiums do not qualify: only the runner's own actual main window.
        $_.SessionId -eq $cmd.SessionId -and $_.MainWindowHandle -ne [IntPtr]::Zero -and $_.MainWindowTitle -ceq 'Enderloom'
      })
      if ($found.Count -gt 1) { throw 'More than one qualifying Enderloom window.' }
      if ($found.Count -eq 1) { $normalWindow = $found[0]; break }
      Start-Sleep -Milliseconds 750
    }
    if ($null -eq $normalWindow) { throw "$phase wrapper: no observable owned Enderloom main window; cannot claim normal boot." }
    $seenMs = $watch.ElapsedMilliseconds
    # Hold process handle while it is still running so its actual order/exit code are observable.
    $null = $normalWindow.Handle
    if (-not $normalWindow.CloseMainWindow()) { throw "$phase wrapper: ordinary window close refused." }
    if (-not $normalWindow.WaitForExit(45000) -or $normalWindow.ExitCode -ne 0) { throw "$phase wrapper: Electron did not exit cleanly." }
    if (-not $cmd.WaitForExit(15000) -or $cmd.ExitCode -ne 0) { throw "$phase wrapper: normal command did not return zero." }
    if (@(OwnedElectron).Count) { throw "$phase wrapper: checkout's Electron process survived clean shutdown." }
    $log = Get-Content -LiteralPath $outFile -Raw
    if ($log -notmatch '(?m)^Preparing current Enderloom source build\.\.\.' -or
        $log -notmatch '(?m)^Starting Enderloom\.\.\.' -or $log -notmatch '(?m)^> node scripts/run\.js') {
      throw "$phase wrapper: ordinary source command markers are missing."
    }
    if ($phase -ceq 'cold' -and ($log -notmatch '(?m)^Downloading Electron binary\.\.\.' -or
        $log -notmatch '(?m)^> enderloom@\S+ build:launcher\s*$' -or $log -notmatch '(?m)^> enderloom@\S+ build:launcher-service\s*$')) {
      throw 'Cold wrapper did not demonstrate the real required prerequisites and lazy resolver.'
    }
    if ($phase -ceq 'warm' -and ($log -match '(?m)^Downloading Electron binary' -or $log -match '(?m)^> enderloom@\S+ build:')) {
      throw 'Warm wrapper unexpectedly replayed a prerequisite.'
    }
    return [ordered]@{ observedWindowTitle = 'Enderloom'; electronExitCode = 0; cmdExitCode = 0; windowObservedAfterMs = $seenMs }
  } finally {
    # Failure cleanup is ordinary close only, scoped to the same owned window; no force kill.
    if ($null -ne $normalWindow -and -not $normalWindow.HasExited) { $null = $normalWindow.CloseMainWindow() }
  }
}
$cold = InvokeWrapper 'cold' 1200
$coldSnapshot = CaptureSnapshot
$warm = InvokeWrapper 'warm' 180
$warmSnapshot = CaptureSnapshot
if ($coldSnapshot -cne $warmSnapshot) { throw 'Build bytes or receipt write time changed on warm startup.' }
AssertCheckout
[ordered]@{
  schema = 'enderloom-source-wrapper-evidence-v1'
  commit = $ExpectedCommit
  tree = $headTree
  reviewedProductCommit = $ReviewedCommit
  cold = $cold
  warm = $warm
  build = ($warmSnapshot | ConvertFrom-Json)
  scope = 'Windows x64, actual normal source wrapper, visible main-window handle + graceful exit; not renderer acceptance, installer or portable-app-data acceptance'
} | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $EvidencePath -Encoding utf8NoBOM
