param($path, $OutputPath)
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open($path)
    $text = $doc.Content.Text
    $doc.Close()
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    $text | Out-File -FilePath $OutputPath -Encoding UTF8
}
catch {
    Write-Error "Failed to read DOCX: $($_.Exception.Message)"
    if ($word) { 
        $word.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null 
    }
    exit 1
}
