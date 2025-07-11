# ========================================
# HTML 템플릿 대량 변환 스크립트
# 기존 Bootstrap 클래스 → 새로운 컴포넌트 클래스
# ========================================

Write-Host "HTML 템플릿 대량 변환을 시작합니다..." -ForegroundColor Green

# 변환 대상 디렉토리
$templateDir = "app\templates"
$backupDir = "template_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# 백업 생성
Write-Host "백업을 생성합니다: $backupDir" -ForegroundColor Yellow
Copy-Item -Path $templateDir -Destination $backupDir -Recurse

# 변환 통계
$convertedFiles = 0
$totalReplacements = 0

# 변환 매핑 정의
$buttonMappings = @{
    'btn btn-primary' = 'btn-primary-solid'
    'btn btn-secondary' = 'btn-secondary-solid'
    'btn btn-success' = 'btn-success-solid'
    'btn btn-warning' = 'btn-warning-solid'
    'btn btn-danger' = 'btn-danger-solid'
    'btn btn-info' = 'btn-info-solid'
    'btn btn-outline-primary' = 'btn-primary-outline'
    'btn btn-outline-secondary' = 'btn-secondary-outline'
    'btn btn-outline-success' = 'btn-success-outline'
    'btn btn-outline-warning' = 'btn-warning-outline'
    'btn btn-outline-danger' = 'btn-danger-outline'
    'btn btn-sm' = 'btn-size-sm'
    'btn btn-lg' = 'btn-size-lg'
}

$formMappings = @{
    ' form-control' = ' form-input'
    '"form-control"' = '"form-input"'
    ' form-select' = ' form-select-custom'
    '"form-select"' = '"form-select-custom"'
    ' form-check-input' = ' form-checkbox'
    '"form-check-input"' = '"form-checkbox"'
}

$tableMappings = @{
    'table table-hover' = 'table-interactive'
    'table table-striped' = 'table-striped'
    'table table-bordered' = 'table-base'
    'table table-sm' = 'table-base'
    'table table-borderless' = 'table-base'
}

# HTML 파일 목록 가져오기
$htmlFiles = Get-ChildItem -Path $templateDir -Filter "*.html" -Recurse

Write-Host "총 $($htmlFiles.Count)개의 HTML 파일을 처리합니다..." -ForegroundColor Cyan

foreach ($file in $htmlFiles) {
    $filePath = $file.FullName
    $relativePath = $filePath.Replace((Get-Location).Path + "\", "")
    
    Write-Host "처리 중: $relativePath" -ForegroundColor White
    
    # 파일 내용 읽기
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    $originalContent = $content
    
    # 버튼 클래스 변환
    foreach ($mapping in $buttonMappings.GetEnumerator()) {
        $oldClass = $mapping.Key
        $newClass = $mapping.Value
        
        if ($content -match [regex]::Escape($oldClass)) {
            $content = $content -replace [regex]::Escape($oldClass), $newClass
            $totalReplacements++
            Write-Host "  → $oldClass → $newClass" -ForegroundColor Green
        }
    }
    
    # 폼 클래스 변환
    foreach ($mapping in $formMappings.GetEnumerator()) {
        $oldClass = $mapping.Key
        $newClass = $mapping.Value
        
        if ($content -match [regex]::Escape($oldClass)) {
            $content = $content -replace [regex]::Escape($oldClass), $newClass
            $totalReplacements++
            Write-Host "  → $oldClass → $newClass" -ForegroundColor Green
        }
    }
    
    # 테이블 클래스 변환
    foreach ($mapping in $tableMappings.GetEnumerator()) {
        $oldClass = $mapping.Key
        $newClass = $mapping.Value
        
        if ($content -match [regex]::Escape($oldClass)) {
            $content = $content -replace [regex]::Escape($oldClass), $newClass
            $totalReplacements++
            Write-Host "  → $oldClass → $newClass" -ForegroundColor Green
        }
    }
    
    # 변경사항이 있으면 파일 저장
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $convertedFiles++
        Write-Host "  ✓ 저장됨" -ForegroundColor Green
    } else {
        Write-Host "  - 변경사항 없음" -ForegroundColor Gray
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "변환 완료!" -ForegroundColor Green
Write-Host "처리된 파일: $convertedFiles / $($htmlFiles.Count)" -ForegroundColor Cyan
Write-Host "총 변환된 클래스: $totalReplacements" -ForegroundColor Cyan
Write-Host "백업 위치: $backupDir" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# 변환 결과 검증
Write-Host "`n변환 결과 검증 중..." -ForegroundColor Yellow

# 남은 기존 클래스 확인
$remainingOldClasses = @()
foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    if ($content -match 'btn btn-primary|btn btn-secondary|form-control|table table-hover') {
        $remainingOldClasses += $file.FullName.Replace((Get-Location).Path + "\", "")
    }
}

if ($remainingOldClasses.Count -gt 0) {
    Write-Host "`n⚠️  다음 파일에 기존 클래스가 남아있습니다:" -ForegroundColor Red
    $remainingOldClasses | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
} else {
    Write-Host "`n✅ 모든 파일에서 기존 클래스가 성공적으로 변환되었습니다!" -ForegroundColor Green
}

Write-Host "`n변환 스크립트 완료." -ForegroundColor Green 