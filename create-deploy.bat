@echo off
setlocal

echo Creating deploy directory...
mkdir deploy 2>nul

echo Copying new-api executable...
copy new-api deploy\ 2>nul

echo Creating web\dist directory...
mkdir deploy\web\dist 2>nul

echo Copying web\dist files...
xcopy web\dist\* deploy\web\dist\ /s /i 2>nul

echo Copying configuration files...
copy .env deploy\ 2>nul
copy docker-compose.yml deploy\ 2>nul

echo Creating start.sh script...
echo #!/bin/bash > deploy\start.sh
echo echo "Starting New API server..." >> deploy\start.sh
echo chmod +x new-api >> deploy\start.sh
echo ./new-api >> deploy\start.sh

echo Creating zip package...
echo "Compressing deploy directory..."
powershell -Command "Compress-Archive -Path deploy -DestinationPath new-api-cyberpunk-deploy.zip -Force"

echo Deployment package created successfully!
dir new-api-cyberpunk-deploy.zip

endlocal