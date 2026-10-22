$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $currentDir = Get-Location
    $docxPath = Join-Path $currentDir "SohamPawar_230905312_BT_Assignment2.docx"
    $pdfPath = Join-Path $currentDir "SohamPawar_230905312_BT_Assignment2.pdf"
    
    Write-Host "Opening document: $docxPath"
    $doc = $word.Documents.Open($docxPath)
    
    Write-Host "Exporting to PDF: $pdfPath"
    $doc.ExportAsFixedFormat($pdfPath.ToString(), 17) # 17 is wdExportFormatPDF
    $doc.Close(0) # 0 is wdDoNotSaveChanges
    Write-Host "SUCCESS: PDF successfully generated at $pdfPath"
}
catch {
    Write-Error $_
}
finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
