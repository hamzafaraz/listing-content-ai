$path = 'src/components/AmazonListingDesignAgent.tsx'
$lines = Get-Content $path
# Line 1119 is index 1118 (0-based)
Write-Host "Original Line 1119: $($lines[1118])"
$lines[1118] = '' # Remove the premature closing tag
Set-Content -Path $path -Value $lines
Write-Host "Removed line 1119"
