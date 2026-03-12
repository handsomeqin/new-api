@echo off
setlocal

echo Creating full project package...
echo ==============================

rem Create package directory
mkdir new-api-cyberpunk 2>nul

rem Copy main files
copy *.go new-api-cyberpunk\ 2>nul
copy *.md new-api-cyberpunk\ 2>nul
copy *.yml new-api-cyberpunk\ 2>nul
copy *.env new-api-cyberpunk\ 2>nul
copy *.env.example new-api-cyberpunk\ 2>nul
copy *.service new-api-cyberpunk\ 2>nul
copy VERSION new-api-cyberpunk\ 2>nul
copy makefile new-api-cyberpunk\ 2>nul
copy Dockerfile new-api-cyberpunk\ 2>nul
copy Dockerfile.slim new-api-cyberpunk\ 2>nul
copy Dockerfile.local new-api-cyberpunk\ 2>nul

rem Copy web directory
mkdir new-api-cyberpunk\web 2>nul
copy web\*.json new-api-cyberpunk\web\ 2>nul
copy web\*.js new-api-cyberpunk\web\ 2>nul
copy web\*.html new-api-cyberpunk\web\ 2>nul
copy web\*.md new-api-cyberpunk\web\ 2>nul
copy web\*.config.js new-api-cyberpunk\web\ 2>nul

rem Copy web\src directory
mkdir new-api-cyberpunk\web\src 2>nul
xcopy web\src\* new-api-cyberpunk\web\src\ /s /i 2>nul

rem Copy web\dist directory
mkdir new-api-cyberpunk\web\dist 2>nul
xcopy web\dist\* new-api-cyberpunk\web\dist\ /s /i 2>nul

rem Copy .github directory
mkdir new-api-cyberpunk\.github 2>nul
mkdir new-api-cyberpunk\.github\workflows 2>nul
copy .github\workflows\*.yml new-api-cyberpunk\.github\workflows\ 2>nul

rem Copy other directories
mkdir new-api-cyberpunk\common 2>nul
xcopy common\* new-api-cyberpunk\common\ /s /i 2>nul

mkdir new-api-cyberpunk\constant 2>nul
xcopy constant\* new-api-cyberpunk\constant\ /s /i 2>nul

mkdir new-api-cyberpunk\controller 2>nul
xcopy controller\* new-api-cyberpunk\controller\ /s /i 2>nul

mkdir new-api-cyberpunk\dto 2>nul
xcopy dto\* new-api-cyberpunk\dto\ /s /i 2>nul

mkdir new-api-cyberpunk\i18n 2>nul
xcopy i18n\* new-api-cyberpunk\i18n\ /s /i 2>nul

mkdir new-api-cyberpunk\logger 2>nul
xcopy logger\* new-api-cyberpunk\logger\ /s /i 2>nul

mkdir new-api-cyberpunk\middleware 2>nul
xcopy middleware\* new-api-cyberpunk\middleware\ /s /i 2>nul

mkdir new-api-cyberpunk\model 2>nul
xcopy model\* new-api-cyberpunk\model\ /s /i 2>nul

mkdir new-api-cyberpunk\oauth 2>nul
xcopy oauth\* new-api-cyberpunk\oauth\ /s /i 2>nul

mkdir new-api-cyberpunk\pkg 2>nul
xcopy pkg\* new-api-cyberpunk\pkg\ /s /i 2>nul

mkdir new-api-cyberpunk\relay 2>nul
xcopy relay\* new-api-cyberpunk\relay\ /s /i 2>nul

mkdir new-api-cyberpunk\router 2>nul
xcopy router\* new-api-cyberpunk\router\ /s /i 2>nul

mkdir new-api-cyberpunk\service 2>nul
xcopy service\* new-api-cyberpunk\service\ /s /i 2>nul

mkdir new-api-cyberpunk\setting 2>nul
xcopy setting\* new-api-cyberpunk\setting\ /s /i 2>nul

mkdir new-api-cyberpunk\types 2>nul
xcopy types\* new-api-cyberpunk\types\ /s /i 2>nul

echo Creating zip package...
echo =======================
powershell -Command "Compress-Archive -Path new-api-cyberpunk -DestinationPath new-api-cyberpunk-full.zip -Force"

echo Package created successfully!
echo =============================
dir new-api-cyberpunk-full.zip

echo Cleaning up...
rd /s /q new-api-cyberpunk 2>nul

echo Done!
echo =====

endlocal