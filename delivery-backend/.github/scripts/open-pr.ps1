param(
  [Parameter(Mandatory = $true)]
  [string]$Title,

  [string]$Base = "main",
  [string]$BodyFile = ".github/pull_request_template.md",

  [string[]]$Labels = @("auth", "security", "backend", "refactor"),
  [string[]]$Reviewers = @()
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI (gh) was not found. Install it first: https://cli.github.com/"
}

if ($Reviewers.Count -eq 0 -and $env:DEFAULT_PR_REVIEWERS) {
  $Reviewers = $env:DEFAULT_PR_REVIEWERS.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

$bodyArgs = @("--body", "")
if (Test-Path $BodyFile) {
  $bodyArgs = @("--body-file", $BodyFile)
}

Write-Host "Creating pull request from current branch..."
gh pr create --base $Base --title $Title @bodyArgs | Out-Null

$prUrl = gh pr view --json url --jq .url
Write-Host "PR created: $prUrl"

if ($Labels.Count -gt 0) {
  try {
    gh pr edit $prUrl --add-label ($Labels -join ",") | Out-Null
    Write-Host "Labels applied: $($Labels -join ', ')"
  } catch {
    Write-Warning "Could not apply one or more labels. Check if labels exist and your permissions."
  }
}

if ($Reviewers.Count -gt 0) {
  try {
    gh pr edit $prUrl --add-reviewer ($Reviewers -join ",") | Out-Null
    Write-Host "Reviewers requested: $($Reviewers -join ', ')"
  } catch {
    Write-Warning "Could not request one or more reviewers. Check usernames and permissions."
  }
}

Write-Host "Done."
