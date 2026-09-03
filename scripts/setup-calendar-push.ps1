param(
  [string]$ProjectRef = "kcfigtledkhdmbdyvygh",
  [string]$VapidSubject = "mailto:hello@queeratlas.app"
)

$ErrorActionPreference = "Stop"

function Resolve-Cli([string]$Name, [string]$CachedFileName) {
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  $npxRoot = Join-Path $env:LOCALAPPDATA "npm-cache\_npx"
  $cached = Get-ChildItem $npxRoot -Recurse -File -Filter $CachedFileName -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if ($cached) { return $cached.FullName }
  throw "$Name is not available. Run npx $Name login once, or install it globally."
}

function Add-VercelEnvironmentValue([string]$Name, [string]$Value) {
  $Value | & $script:VercelCli env add $Name production --force --yes | Out-Null
  $Value | & $script:VercelCli env add $Name preview --force --yes | Out-Null
}

$script:VercelCli = Resolve-Cli "vercel" "vercel.cmd"
$script:SupabaseCli = Resolve-Cli "supabase" "supabase.exe"

$nodeScript = @'
const crypto = require("node:crypto");
const pair = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const jwk = pair.privateKey.export({ format: "jwk" });
const decode = (value) => Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
const publicKey = Buffer.concat([Buffer.from([4]), decode(jwk.x), decode(jwk.y)]).toString("base64url");
console.log(JSON.stringify({ publicKey, privateKey: jwk.d, cronSecret: crypto.randomBytes(32).toString("base64url") }));
'@
$generatorPath = Join-Path $env:TEMP ("qa-calendar-vapid-" + [Guid]::NewGuid().ToString("N") + ".cjs")
try {
  [System.IO.File]::WriteAllText($generatorPath, $nodeScript, [System.Text.UTF8Encoding]::new($false))
  $generated = & node $generatorPath | ConvertFrom-Json
} finally {
  if (Test-Path -LiteralPath $generatorPath) {
    Remove-Item -LiteralPath $generatorPath -Force
  }
}
if (-not $generated.publicKey -or -not $generated.privateKey -or -not $generated.cronSecret) {
  throw "Node.js could not generate complete VAPID credentials."
}
$vapidPublic = [string]$generated.publicKey
$vapidPrivate = [string]$generated.privateKey
$cronSecret = [string]$generated.cronSecret

Write-Host "Configuring Vercel environment variables..."
Add-VercelEnvironmentValue "NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY" $vapidPublic
Add-VercelEnvironmentValue "CALENDAR_REMINDER_CRON_SECRET" $cronSecret

Write-Host "Configuring Supabase Edge Function secrets..."
& $script:SupabaseCli secrets set --project-ref $ProjectRef `
  "WEB_PUSH_VAPID_PUBLIC_KEY=$vapidPublic" `
  "WEB_PUSH_VAPID_PRIVATE_KEY=$vapidPrivate" `
  "WEB_PUSH_VAPID_SUBJECT=$VapidSubject" `
  "CALENDAR_REMINDER_CRON_SECRET=$cronSecret" | Out-Null

Write-Host "Deploying send-calendar-reminders..."
& $script:SupabaseCli functions deploy send-calendar-reminders --project-ref $ProjectRef --no-verify-jwt

Write-Host "Deploying QueerAtlas so the public VAPID key and cron route become active..."
& $script:VercelCli deploy --prod --yes

Write-Host "Calendar push setup complete. No private keys were written to disk."
