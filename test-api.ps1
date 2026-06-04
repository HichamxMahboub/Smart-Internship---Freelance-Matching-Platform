# API Testing Script for Interlance Backoffice
Write-Host "=== Interlance API Diagnostic Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if containers are running
Write-Host "1. Checking Docker Containers..." -ForegroundColor Yellow
docker ps --filter "name=smart-match-platform" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""

# Test 2: Test Backend Health
Write-Host "2. Testing Backend API (expecting 401 - means auth is working)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "Response: $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "✓ Backend API is responding (401 Unauthorized - Auth required)" -ForegroundColor Green
    } else {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Check MongoDB
Write-Host "3. Testing MongoDB Connection..." -ForegroundColor Yellow
try {
    $mongoTest = docker exec smart-match-platform-mongodb mongosh --quiet --eval "db.adminCommand('ping')" 2>&1
    if ($mongoTest -match "ok.*1") {
        Write-Host "✓ MongoDB is responding" -ForegroundColor Green
    } else {
        Write-Host "✗ MongoDB connection issue" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error checking MongoDB: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Check Backoffice
Write-Host "4. Testing Backoffice (Nginx)..." -ForegroundColor Yellow
try {
    $backoffice = Invoke-WebRequest -Uri "http://localhost:4200" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Backoffice is accessible (Status: $($backoffice.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Error accessing backoffice: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Check Firebase Service Account
Write-Host "5. Checking Firebase Configuration..." -ForegroundColor Yellow
$firebasePath = "d:\Smart-Internship---Freelance-Matching-Platform\smart-match-backend\firebase-service-account.json"
if (Test-Path $firebasePath) {
    Write-Host "✓ Firebase service account file exists" -ForegroundColor Green
    $firebaseContent = Get-Content $firebasePath -Raw | ConvertFrom-Json
    Write-Host "  Project ID: $($firebaseContent.project_id)" -ForegroundColor Gray
} else {
    Write-Host "✗ Firebase service account file NOT found!" -ForegroundColor Red
    Write-Host "  Expected location: $firebasePath" -ForegroundColor Red
}
Write-Host ""

# Test 6: Check Recent Backend Logs for Errors
Write-Host "6. Checking Backend Logs for Errors..." -ForegroundColor Yellow
$backendLogs = docker logs smart-match-platform-backend --tail 50 2>&1
$errors = $backendLogs | Select-String -Pattern "ERROR|Exception|Failed" | Select-Object -First 5
if ($errors) {
    Write-Host "⚠ Found errors in backend logs:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
} else {
    Write-Host "✓ No errors found in recent backend logs" -ForegroundColor Green
}
Write-Host ""

# Test 7: Check Database Collections
Write-Host "7. Checking Database Collections..." -ForegroundColor Yellow
try {
    $collections = docker exec smart-match-platform-mongodb mongosh smart_match --quiet --eval "db.getCollectionNames()" 2>&1
    Write-Host "Collections: $collections" -ForegroundColor Gray
    
    # Count documents
    $userCount = docker exec smart-match-platform-mongodb mongosh smart_match --quiet --eval "db.users.countDocuments()" 2>&1
    $companyCount = docker exec smart-match-platform-mongodb mongosh smart_match --quiet --eval "db.companies.countDocuments()" 2>&1
    $offerCount = docker exec smart-match-platform-mongodb mongosh smart_match --quiet --eval "db.offers.countDocuments()" 2>&1
    
    Write-Host "  Users: $userCount" -ForegroundColor Gray
    Write-Host "  Companies: $companyCount" -ForegroundColor Gray
    Write-Host "  Offers: $offerCount" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error checking database: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8080/api"
Write-Host "Backoffice UI: http://localhost:4200"
Write-Host "Mongo Express: http://localhost:8081"
Write-Host ""
Write-Host "If all tests passed, the system should be working!" -ForegroundColor Green
Write-Host "If login fails, check Firebase configuration and user credentials." -ForegroundColor Yellow
Write-Host ""
