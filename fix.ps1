$path = 'src/components/AmazonListingDesignAgent.tsx'
$content = Get-Content $path
$content[1120] = '                                {/* Refinement Interface */}'
$content[1121] = '                                <div className="mt-6 border-t pt-4 md:col-span-2">'
# Also fix closing tags at the end, just in case
# Find the last few lines
# But indices might vary.
# I'll rely on the earlier broad replace for closing tags which succeeded (Step 2375).
# But just in case, let's fix the 1120-1125 block.
Set-Content -Path $path -Value $content
Write-Host "Fixed lines 1121-1122"
