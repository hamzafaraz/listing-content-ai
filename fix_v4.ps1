$path = "src/components/AmazonListingDesignAgent.tsx"
$lines = Get-Content $path

# 1. Remove Duplicate Block (Lines 228-233)
# The file has a duplicate block of setGenerating... setWaitProgress(0) right after line 227.
# We need to remove lines 228 to 233 inclusive.
# But wait, looking at the file content from step 2774:
# 227:         setProgress('Initializing AI Agent...');
# 228:         setGenerating(true);
# ...
# 233:         setWaitProgress(0);
# 234: 
# 235:         try {

# We will remove lines 228-233 (0-indexed: 227-232)
$newLines = $lines[0..227] + $lines[234..($lines.Count - 1)]

# 2. Fix the PDF Logic Injection (Remove lines that were inserted in the wrong place)
# Based on the previous failed replace, we have a chunk of HTML (lines 309-359 in the view) that was inserted into the main function body 
# instead of inside downloadPDF.
# We need to find where `const downloadPDF = () => {` starts and replace the content inside it.
# AND we need to remove the stray HTML from the main function.

# Actually, the file view shows the stray HTML is around line 309.
# The `generateDesignPlan` function continues after it? No, the `timerPromise` is at 362.
# This means the HTML was inserted RIGHT IN THE MIDDLE of `generateDesignPlan`.
# We need to remove lines 308 to 360 from the CURRENT file (which corresponds to the view).
# Wait, if I use the $newLines from step 1, the indices shift.
# Let's simple read the file, find the range of the stray HTML, and remove it.

# The stray HTML starts with `// ... (inside downloadPDF function) ...` (line 308 in view)
# and ends with `            }` (line 359 in view seems to be the end of the map).
# let's look for `// ... (inside downloadPDF function) ...` and remove everything until `const timerPromise`.

$content = $newLines -join "`n"
$startMarker = "// ... (inside downloadPDF function) ..."
$endMarker = "const timerPromise = updateTimer();"

$startIndex = $content.IndexOf($startMarker)
$endIndex = $content.IndexOf($endMarker)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $content = $content.Remove($startIndex, $endIndex - $startIndex)
}

# 3. Now we need to update the ACTUAL downloadPDF function with the correct HTML.
# We need to find `const downloadPDF = () => {` and the `const reportContent = \`` inside it.
# And replace the template literal content.

$pdfStartMarker = "const downloadPDF = () => {"
$pdfContentStart = "const reportContent = ``"
# This is hard to do with regex reliably if the file is messy.

# STRATEGY CHANGE:
# The file is messed up. The safest way is to READ the file, and rewrite specific chunks using strict range replacements or just overwriting the file with a KNOWN GOOD version constructed from the parts we have.
# I will use the `replace_file_content` method but I will target the WHOLE file content regeneration to be safe, OR I will just fix the 180s and prompts first, then fix PDF.

# Actually, I can construct the file content here in PS1 and overwrite it.
# I have the view from 200-600.
# I know the structure.
# I will write a script that:
# 1. Reads the file.
# 2. Removes the duplicate lines 228-233.
# 3. Removes the stray HTML block (from `// ... (inside downloadPDF` to just before `const timerPromise`).
# 4. Replaces `setTimeRemaining(60)` with `setTimeRemaining(180)`.
# 5. Replaces `totalDuration = 60 * 1000` with `totalDuration = 180 * 1000`.
# 6. Replaces the `designPrompt` definition with the NEW one containing 2000x2000 instructions.
# 7. Finds `downloadPDF` and replaces the HTML template inside it.

# Let's do 1-5 first to get the code compiling, then do 6-7.
# 6 needs to be precise.

Set-Content -Path "src/components/AmazonListingDesignAgent.tsx" -Value $content
