#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Creates all required Sentry alert rules for Cross Angle Interior via the Sentry REST API.

.DESCRIPTION
  Runs once. Idempotent — existing rules with the same name are left unchanged.
  Requires: SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT (fill below or pass as env vars).

.USAGE
  # Option A: fill in the values below and run
  .\create-sentry-alerts.ps1

  # Option B: pass as env vars
  $env:SENTRY_AUTH_TOKEN="sntrys_..."; $env:SENTRY_ORG="crossangle"; $env:SENTRY_PROJECT="crossangle-web"
  .\create-sentry-alerts.ps1

.HOW TO GET VALUES
  SENTRY_AUTH_TOKEN : Sentry → Settings → Auth Tokens → Create New Token
                      Scopes needed: project:write, project:read, alerts:write
  SENTRY_ORG        : Your Sentry org slug (URL slug shown in sentry.io/organizations/YOUR_ORG_SLUG/)
  SENTRY_PROJECT    : Your project slug (sentry.io/YOUR_ORG/YOUR_PROJECT/)
#>

# ─── Configuration ────────────────────────────────────────────────────────────
# Fill these in OR leave empty to use environment variables
$SENTRY_AUTH_TOKEN = $env:SENTRY_AUTH_TOKEN  # e.g. "sntrys_eyJ..."
$SENTRY_ORG        = $env:SENTRY_ORG         # e.g. "crossangle"
$SENTRY_PROJECT    = $env:SENTRY_PROJECT     # e.g. "crossangle-web"

# ─── Validation ───────────────────────────────────────────────────────────────
if (-not $SENTRY_AUTH_TOKEN) { Write-Error "SENTRY_AUTH_TOKEN is required"; exit 1 }
if (-not $SENTRY_ORG)        { Write-Error "SENTRY_ORG is required"; exit 1 }
if (-not $SENTRY_PROJECT)    { Write-Error "SENTRY_PROJECT is required"; exit 1 }

$BASE_URL = "https://sentry.io/api/0"
$HEADERS  = @{
    "Authorization" = "Bearer $SENTRY_AUTH_TOKEN"
    "Content-Type"  = "application/json"
}

# ─── Helper ───────────────────────────────────────────────────────────────────
function Invoke-SentryAPI {
    param(
        [string]$Method,
        [string]$Path,
        [hashtable]$Body = $null
    )
    $url = "$BASE_URL$Path"
    $params = @{ Uri = $url; Method = $Method; Headers = $HEADERS; TimeoutSec = 30 }
    if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }

    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $msg = $_.ErrorDetails.Message
        if ($statusCode -eq 400 -and $msg -match "already exists") {
            Write-Host "  ↩ Skipped (already exists)" -ForegroundColor Yellow
            return $null
        }
        Write-Error "  ✗ API call failed [$statusCode]: $msg"
        return $null
    }
}

function Write-Step { param([string]$Text) Write-Host "`n──── $Text" -ForegroundColor Cyan }
function Write-OK   { param([string]$Text) Write-Host "  ✓ $Text" -ForegroundColor Green }

# ─── Verify connectivity ──────────────────────────────────────────────────────
Write-Step "Verifying Sentry credentials..."
$me = Invoke-SentryAPI -Method GET -Path "/projects/$SENTRY_ORG/$SENTRY_PROJECT/"
if (-not $me) {
    Write-Error "Could not reach project '$SENTRY_PROJECT' in org '$SENTRY_ORG'. Check your credentials and slugs."
    exit 1
}
Write-OK "Connected to project: $($me.name) (slug: $($me.slug))"

# ─── Alert Rule 1: Unhandled Exception (New Or Regression) ───────────────────
Write-Step "Creating alert rule: Unhandled Exception — New or Regression..."

$rule1 = Invoke-SentryAPI -Method POST -Path "/projects/$SENTRY_ORG/$SENTRY_PROJECT/rules/" -Body @{
    name        = "Unhandled Exception — New or Regression"
    environment = "production"
    actionMatch = "any"
    conditions  = @(
        @{ id = "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition" },
        @{ id = "sentry.rules.conditions.regression_event.RegressionEventCondition" }
    )
    filters     = @()
    actions     = @(
        @{
            id              = "sentry.mail.actions.NotifyEmailAction"
            targetType      = "IssueOwners"
            targetIdentifier = ""
        }
    )
    frequency   = 1440   # minutes — alert at most once per 24 h per issue
}

if ($rule1) { Write-OK "Created: Unhandled Exception — New or Regression (ID: $($rule1.id))" }

# ─── Alert Rule 2: Edge Function 5xx Spike ───────────────────────────────────
# Uses Metric Alerts API (different endpoint from Issue alerts)
Write-Step "Creating metric alert: Edge Function 5xx Spike..."

$rule2 = Invoke-SentryAPI -Method POST -Path "/organizations/$SENTRY_ORG/alert-rules/" -Body @{
    name              = "Edge Function 5xx Spike"
    environment       = "production"
    dataset           = "errors"
    query             = 'level:error tags[runtime]:deno'
    aggregate         = "count()"
    timeWindow        = 5       # minutes
    thresholdType     = 0       # 0 = above threshold
    resolveThreshold  = 2
    triggers          = @(
        @{
            label             = "warning"
            thresholdType     = 0
            alertThreshold    = 5
            resolveThreshold  = 2
            actions           = @(
                @{ type = "email"; targetType = "team"; targetIdentifier = "" }
            )
        },
        @{
            label             = "critical"
            thresholdType     = 0
            alertThreshold    = 10
            resolveThreshold  = 2
            actions           = @(
                @{ type = "email"; targetType = "team"; targetIdentifier = "" }
            )
        }
    )
    projects          = @($SENTRY_PROJECT)
    owner             = $null
}

if ($rule2) { Write-OK "Created: Edge Function 5xx Spike (ID: $($rule2.id))" }

# ─── Alert Rule 3: Rate Limit Abuse Spike ────────────────────────────────────
Write-Step "Creating metric alert: Rate Limit Abuse Spike..."

$rule3 = Invoke-SentryAPI -Method POST -Path "/organizations/$SENTRY_ORG/alert-rules/" -Body @{
    name              = "Rate Limit Abuse Spike"
    environment       = "production"
    dataset           = "errors"
    query             = 'level:warning message:"Rate limit exceeded"'
    aggregate         = "count()"
    timeWindow        = 5
    thresholdType     = 0
    resolveThreshold  = 5
    triggers          = @(
        @{
            label             = "warning"
            thresholdType     = 0
            alertThreshold    = 20
            resolveThreshold  = 5
            actions           = @(
                @{ type = "email"; targetType = "team"; targetIdentifier = "" }
            )
        },
        @{
            label             = "critical"
            thresholdType     = 0
            alertThreshold    = 50
            resolveThreshold  = 10
            actions           = @(
                @{ type = "email"; targetType = "team"; targetIdentifier = "" }
            )
        }
    )
    projects          = @($SENTRY_PROJECT)
    owner             = $null
}

if ($rule3) { Write-OK "Created: Rate Limit Abuse Spike (ID: $($rule3.id))" }

# ─── Alert Rule 4: Lead Submission Failure ───────────────────────────────────
Write-Step "Creating alert rule: Lead Submission Failure — Immediate..."

$rule4 = Invoke-SentryAPI -Method POST -Path "/projects/$SENTRY_ORG/$SENTRY_PROJECT/rules/" -Body @{
    name        = "Lead Submission Failure — Immediate"
    environment = "production"
    actionMatch = "all"
    conditions  = @(
        @{ id = "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition" },
        @{ id = "sentry.rules.conditions.regression_event.RegressionEventCondition" }
    )
    filters     = @(
        @{
            id       = "sentry.rules.filters.tagged_event.TaggedEventFilter"
            match    = "co"      # "co" = contains
            key      = "edge_fn"
            value    = "submit"
        }
    )
    actions     = @(
        @{
            id              = "sentry.mail.actions.NotifyEmailAction"
            targetType      = "Team"
            targetIdentifier = ""
        }
    )
    frequency   = 60   # once per hour if ongoing
}

if ($rule4) { Write-OK "Created: Lead Submission Failure — Immediate (ID: $($rule4.id))" }

# ─── Alert Rule 5: Post-Deploy Regression ────────────────────────────────────
Write-Step "Creating metric alert: Post-Deploy Error Regression..."

$rule5 = Invoke-SentryAPI -Method POST -Path "/organizations/$SENTRY_ORG/alert-rules/" -Body @{
    name              = "Post-Deploy Error Regression"
    environment       = "production"
    dataset           = "errors"
    query             = ""
    aggregate         = "count()"
    timeWindow        = 60      # 1 hour post-deploy window
    thresholdType     = 0
    resolveThreshold  = 0
    comparisonDelta   = 1440    # compare to 24h ago (percentage change mode)
    triggers          = @(
        @{
            label             = "warning"
            thresholdType     = 0
            alertThreshold    = 20   # 20% increase triggers warning
            resolveThreshold  = 5
            actions           = @(
                @{ type = "email"; targetType = "team"; targetIdentifier = "" }
            )
        }
    )
    projects          = @($SENTRY_PROJECT)
    owner             = $null
}

if ($rule5) { Write-OK "Created: Post-Deploy Error Regression (ID: $($rule5.id))" }

# ─── Summary ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host " Sentry alert rules setup complete." -ForegroundColor Magenta
Write-Host " Review at: https://sentry.io/organizations/$SENTRY_ORG/alerts/" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════" -ForegroundColor Magenta
