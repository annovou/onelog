@echo off
setlocal
cd /d "%~dp0"

echo.
echo  ============================================================
echo    OneLog  -  build APK
echo  ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  [X] Node.js not found.
  echo.
  echo      Install the LTS version from https://nodejs.org
  echo      then close this window and run me again.
  echo.
  pause
  exit /b 1
)

if not defined JAVA_HOME if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"

echo  [1/5] npm install ...
call npm install
if errorlevel 1 goto fail

echo.
echo  [2/5] copy web files ...
call node sync-web.js
if errorlevel 1 goto fail

echo.
if exist "android" (
  echo  [3/5] android project already exists, skip
) else (
  echo  [3/5] create android project ...
  call npx cap add android
  if errorlevel 1 goto fail
)

if not exist "android\local.properties" if exist "%LOCALAPPDATA%\Android\Sdk" (
  echo sdk.dir=%LOCALAPPDATA:\=/%/Android/Sdk> "android\local.properties"
  echo        sdk path written
)

echo.
echo  [4/5] cap sync android ...
call npx cap sync android
if errorlevel 1 goto fail

echo.
echo  [5/5] gradle assembleDebug ... first time 5-15 minutes, do not close
pushd android
call gradlew.bat assembleDebug
if errorlevel 1 (
  popd
  goto fail
)
popd

set "APK=android\app\build\outputs\apk\debug\app-debug.apk"
if not exist "%APK%" (
  echo  [X] build finished but apk not found
  goto fail
)

echo.
echo  ============================================================
echo    BUILD OK
echo.
echo    %CD%\%APK%
echo.
echo    Copy this file to your phone and open it to install.
echo  ============================================================
echo.
pause
exit /b 0

:fail
echo.
echo  ============================================================
echo    BUILD FAILED
echo    Screenshot this window and send it back.
echo  ============================================================
echo.
pause
exit /b 1
