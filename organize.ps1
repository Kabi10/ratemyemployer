# Create RME_admin directory structure
$dirs = @(
    "RME_admin",
    "RME_admin/docs",
    "RME_admin/config",
    "RME_admin/build",
    "RME_admin/scripts",
    "RME_admin/database/migrations",
    "RME_admin/archive",
    "RME_admin/colab"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
}

# Move documentation (except README.md and CONTRIBUTING.md)
Get-ChildItem -Path "docs/*" -Exclude "README.md","CONTRIBUTING.md" | 
    Move-Item -Destination "RME_admin/docs/" -Force

# Move non-essential configuration files
$configFiles = @(
    "jest.config.js",
    "jest.setup.js",
    "playwright.config.ts"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "RME_admin/config/" -Force
    }
}

# Move build files
$buildFiles = @(
    "metrics-history.json",
    "node_install.log",
    "nodejs_installer.msi"
)

foreach ($file in $buildFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "RME_admin/build/" -Force
    }
}

# Move scripts (except essential build scripts)
Get-ChildItem -Path "scripts/*" -Exclude "build.js","setup.js" |
    Move-Item -Destination "RME_admin/scripts/" -Force

# Move database files
if (Test-Path "migrations/changelog.md") {
    Move-Item -Path "migrations/changelog.md" -Destination "RME_admin/database/migrations/" -Force
}
Get-ChildItem -Path "schema_dump*.sql" | 
    Move-Item -Destination "RME_admin/database/" -Force
if (Test-Path "setup_company_news.sql") {
    Move-Item -Path "setup_company_news.sql" -Destination "RME_admin/database/" -Force
}

# Move archive and temporary files
if (Test-Path "errors_archive") {
    Move-Item -Path "errors_archive" -Destination "RME_admin/archive/" -Force
}
if (Test-Path "temp_changes.txt") {
    Move-Item -Path "temp_changes.txt" -Destination "RME_admin/archive/" -Force
}
if (Test-Path ".colab") {
    Move-Item -Path ".colab" -Destination "RME_admin/colab/" -Force
}

Write-Host "Files have been safely organized into RME_admin directory"
Write-Host "Note: Critical configuration files and .github directory remain in root"