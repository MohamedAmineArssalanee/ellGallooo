# ------------------------------------------------------------------
# eLL gAllo - tiny local dev server (no dependencies)
# Usage:  powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 8000]
# ------------------------------------------------------------------
param(
  [int]$Port = 8000
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$prefix = "http://localhost:$Port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".htm"  = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".webp" = "image/webp"
  ".ico"  = "image/x-icon"
  ".pdf"  = "application/pdf"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
} catch {
  Write-Host "Could not bind $prefix ($($_.Exception.Message)). Try another port: -Port 8080"
  exit 1
}

Write-Host ""  Write-Host "  eLL gAllo - dev server"   -ForegroundColor DarkGray
Write-Host "  Serving : $root"
Write-Host "  URL     : $prefix"          -ForegroundColor Green
Write-Host "  Stop    : Ctrl+C"
Write-Host ""

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    try {
      $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      if ($path -eq "/") { $path = "/index.html" }

      $file = Join-Path $root ($path.TrimStart("/") -replace "/", [IO.Path]::DirectorySeparatorChar)
      $full = [IO.Path]::GetFullPath($file)

      # keep requests inside the site folder
      if (Test-Path $full -PathType Container) { $full = Join-Path $full "index.html" }
      if (-not $full.StartsWith((Get-Item $root).FullName, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $full -PathType Leaf)) {
        $res.StatusCode = 404
        $msg = [Text.Encoding]::UTF8.GetBytes("404 not found: $path")
        $res.ContentType = "text/plain; charset=utf-8"
        $res.ContentLength64 = $msg.Length
        $res.OutputStream.Write($msg, 0, $msg.Length)
      } else {
        $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
        if (-not $mime.ContainsKey($ext)) { $mime[$ext] = "application/octet-stream" }
        $bytes = [IO.File]::ReadAllBytes($full)
        $res.StatusCode = 200
        $res.ContentType = $mime[$ext]
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } catch {
      try { $res.StatusCode = 500 } catch {}
    } finally {
      try { $res.OutputStream.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
