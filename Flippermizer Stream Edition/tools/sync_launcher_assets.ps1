$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcher = Split-Path -Parent $scriptDir
$root = Split-Path -Parent $launcher

$homeCandidates = @(
  (Join-Path $root "Flippermizer Home Edition"),
  (Join-Path $root "flippermizer-essential-overlay")
)
$optionsCandidates = @(
  (Join-Path $root "HTML Option Generators (Move Elsewhere)"),
  (Join-Path $root "html-option-generators")
)

$homeRoot = $homeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
$optionsRoot = $optionsCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (!$homeRoot) {
  throw "Could not find Flippermizer Home Edition source folder."
}

$devAssets = Join-Path $launcher "app-assets"
$devApworld = Join-Path $launcher "apworld"
$distAssets = Join-Path $launcher "dist\win-unpacked\resources\app-assets"
$distApworld = Join-Path $launcher "dist\win-unpacked\resources\apworld"

function Ensure-Dir {
  param([string]$Path)
  if (!(Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Copy-FileIfPresent {
  param(
    [string[]]$Sources,
    [string]$Destination
  )
  foreach ($source in $Sources) {
    if ($source -and (Test-Path -LiteralPath $source)) {
      Ensure-Dir (Split-Path -Parent $Destination)
      if ((Resolve-Path -LiteralPath $source).Path -eq (Resolve-Path -LiteralPath $Destination -ErrorAction SilentlyContinue).Path) {
        return $true
      }
      Copy-Item -LiteralPath $source -Destination $Destination -Force
      return $true
    }
  }
  return $false
}

function Copy-DirIfPresent {
  param(
    [string[]]$Sources,
    [string]$Destination
  )
  foreach ($source in $Sources) {
    if ($source -and (Test-Path -LiteralPath $source)) {
      Ensure-Dir $Destination
      Get-ChildItem -LiteralPath $source -Force | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $Destination -Recurse -Force
      }
      return $true
    }
  }
  return $false
}

function Sync-AssetFiles {
  param([string]$AssetRoot)
  Ensure-Dir $AssetRoot

  Copy-FileIfPresent -Sources @(
    (Join-Path $homeRoot "flippermizer_overlay_tower_v3.html")
  ) -Destination (Join-Path $AssetRoot "flippermizer_overlay_tower_v3.html") | Out-Null

  Copy-FileIfPresent -Sources @(
    (Join-Path $homeRoot "flippermizer_table_repository.js")
  ) -Destination (Join-Path $AssetRoot "flippermizer_table_repository.js") | Out-Null

  Copy-FileIfPresent -Sources @(
    (Join-Path $homeRoot "flippermizer_task_explanations.js")
  ) -Destination (Join-Path $AssetRoot "flippermizer_task_explanations.js") | Out-Null

  Copy-FileIfPresent -Sources @(
    (Join-Path $homeRoot "flippermizer_task_repository.html")
  ) -Destination (Join-Path $AssetRoot "flippermizer_task_repository.html") | Out-Null

  Copy-FileIfPresent -Sources @(
    (Join-Path $homeRoot "flippermizer_task_repository_data.js")
  ) -Destination (Join-Path $AssetRoot "flippermizer_task_repository_data.js") | Out-Null

  Copy-FileIfPresent -Sources @(
    (Join-Path $homeRoot "flippermizer_task_repository_cfg.js")
  ) -Destination (Join-Path $AssetRoot "flippermizer_task_repository_cfg.js") | Out-Null

  Copy-FileIfPresent -Sources @(
    (Join-Path $launcher "app-assets\flippermizer_table_repository_library.html"),
    (Join-Path $root "flippermizer_table_repository_library.html")
  ) -Destination (Join-Path $AssetRoot "flippermizer_table_repository_library.html") | Out-Null

  Copy-FileIfPresent -Sources @(
    (Join-Path $launcher "app-assets\FlippermizerDev.js"),
    (Join-Path $root "FlippermizerDev.js")
  ) -Destination (Join-Path $AssetRoot "FlippermizerDev.js") | Out-Null

  Copy-FileIfPresent -Sources @(
    (Join-Path $launcher "app-assets\FLPRBonusPinballField.css"),
    (Join-Path $root "FLPRBonusPinballField.css")
  ) -Destination (Join-Path $AssetRoot "FLPRBonusPinballField.css") | Out-Null

  Copy-FileIfPresent -Sources @(
    (Join-Path $launcher "app-assets\FLPRBonusPinballField.html"),
    (Join-Path $root "FLPRBonusPinballField.html")
  ) -Destination (Join-Path $AssetRoot "FLPRBonusPinballField.html") | Out-Null

  Copy-FileIfPresent -Sources @(
    $(if ($optionsRoot) { Join-Path $optionsRoot "flippermizer-player-options.html" } else { $null }),
    (Join-Path $launcher "app-assets\html-option-generators\flippermizer-player-options.html")
  ) -Destination (Join-Path $AssetRoot "html-option-generators\flippermizer-player-options.html") | Out-Null

  Copy-DirIfPresent -Sources @(
    (Join-Path $homeRoot "sounds")
  ) -Destination (Join-Path $AssetRoot "sounds") | Out-Null

  Copy-DirIfPresent -Sources @(
    (Join-Path $homeRoot "Flippermizer Images")
  ) -Destination (Join-Path $AssetRoot "Flippermizer Images") | Out-Null

  Copy-DirIfPresent -Sources @(
    (Join-Path $homeRoot "WorldsBanners")
  ) -Destination (Join-Path $AssetRoot "WorldsBanners") | Out-Null

  Copy-DirIfPresent -Sources @(
    (Join-Path $homeRoot "vendor\fonts")
  ) -Destination (Join-Path $AssetRoot "vendor\fonts") | Out-Null
}

function Sync-Apworld {
  param([string]$ApworldRoot)
  Ensure-Dir $ApworldRoot
  Copy-FileIfPresent -Sources @(
    (Join-Path $launcher "apworld\manual_flippermizerworldsofpinball_base_game.apworld"),
    (Join-Path $root "manual_flippermizerworldsofpinball_base_game.apworld")
  ) -Destination (Join-Path $ApworldRoot "manual_flippermizerworldsofpinball_base_game.apworld") | Out-Null
}

Sync-AssetFiles -AssetRoot $devAssets
Sync-Apworld -ApworldRoot $devApworld

if (Test-Path -LiteralPath (Join-Path $launcher "dist\win-unpacked")) {
  Sync-AssetFiles -AssetRoot $distAssets
  Sync-Apworld -ApworldRoot $distApworld
}

Write-Host "Launcher assets synced."
