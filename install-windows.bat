
@echo off
setlocal enabledelayedexpansion
color 0A
title Audience Response System - Windows Installer

echo.
echo ================================================================
echo    AUDIENCE RESPONSE SYSTEM - WINDOWS INSTALLER
echo ================================================================
echo.
echo This installer will set up the Audience Response System on your
echo Windows computer. Please ensure you have administrator privileges.
echo.
echo Press any key to continue or Ctrl+C to exit...
pause >nul

echo.
echo [1/8] Checking system requirements...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer requires administrator privileges.
    echo Please right-click on this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Create installation directory
set "INSTALL_DIR=%USERPROFILE%\AudienceResponseSystem"
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
)

cd /d "%INSTALL_DIR%"

echo [2/8] Checking for Node.js...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Node.js not found. Downloading and installing Node.js...
    echo.
    
    REM Download Node.js installer
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi' -OutFile 'nodejs-installer.msi'}"
    
    if exist "nodejs-installer.msi" (
        echo Installing Node.js... This may take a few minutes.
        msiexec /i nodejs-installer.msi /quiet /norestart
        
        REM Wait for installation to complete
        timeout /t 30 /nobreak >nul
        
        REM Refresh environment variables
        call refreshenv.cmd >nul 2>&1
        
        del "nodejs-installer.msi"
        echo Node.js installation completed.
    ) else (
        echo ERROR: Failed to download Node.js installer.
        echo Please manually install Node.js from https://nodejs.org
        pause
        exit /b 1
    )
) else (
    echo Node.js found: 
    node --version
)

echo.
echo [3/8] Checking for Git...
git --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Git not found. Downloading and installing Git...
    echo.
    
    REM Download Git installer
    powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.41.0.windows.3/Git-2.41.0.3-64-bit.exe' -OutFile 'git-installer.exe'}"
    
    if exist "git-installer.exe" (
        echo Installing Git... This may take a few minutes.
        git-installer.exe /VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS="icons,ext\reg\shellhere,assoc,assoc_sh"
        
        REM Wait for installation to complete
        timeout /t 60 /nobreak >nul
        
        REM Add Git to PATH
        setx PATH "%PATH%;C:\Program Files\Git\bin" /M >nul 2>&1
        set "PATH=%PATH%;C:\Program Files\Git\bin"
        
        del "git-installer.exe"
        echo Git installation completed.
    ) else (
        echo ERROR: Failed to download Git installer.
        echo Please manually install Git from https://git-scm.com
        pause
        exit /b 1
    )
) else (
    echo Git found:
    git --version
)

echo.
echo [4/8] Setting up PostgreSQL...
echo.

REM Check if PostgreSQL is installed
pg_isready >nul 2>&1
if %errorLevel% neq 0 (
    echo PostgreSQL not found. Installing PostgreSQL...
    echo.
    
    REM Download PostgreSQL installer
    powershell -Command "& {Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-14.9-1-windows-x64.exe' -OutFile 'postgresql-installer.exe'}"
    
    if exist "postgresql-installer.exe" (
        echo Installing PostgreSQL... Please follow the installer prompts.
        echo IMPORTANT: Remember the password you set for the 'postgres' user!
        echo.
        pause
        
        postgresql-installer.exe --mode unattended --unattendedmodeui minimal --superpassword "postgres123" --servicename "postgresql" --servicepassword "postgres123" --serverport 5432
        
        REM Wait for installation
        timeout /t 120 /nobreak >nul
        
        REM Add PostgreSQL to PATH
        setx PATH "%PATH%;C:\Program Files\PostgreSQL\14\bin" /M >nul 2>&1
        set "PATH=%PATH%;C:\Program Files\PostgreSQL\14\bin"
        
        del "postgresql-installer.exe"
        echo PostgreSQL installation completed.
        echo Default password set to: postgres123
    ) else (
        echo ERROR: Failed to download PostgreSQL installer.
        echo Please manually install PostgreSQL from https://postgresql.org
        pause
        exit /b 1
    )
) else (
    echo PostgreSQL found and running.
)

echo.
echo [5/8] Downloading Audience Response System...
echo.

REM Clone or download the repository
if exist "ARS-BZ" (
    echo Updating existing installation...
    cd ARS-BZ
    git pull origin main
) else (
    echo Downloading from GitHub...
    git clone https://github.com/benny2744/ARS-BZ.git
    if !errorLevel! neq 0 (
        echo ERROR: Failed to clone repository.
        echo Trying to download as ZIP...
        powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/benny2744/ARS-BZ/archive/main.zip' -OutFile 'ars-main.zip'}"
        powershell -Command "& {Expand-Archive -Path 'ars-main.zip' -DestinationPath '.' -Force}"
        rename "ARS-BZ-main" "ARS-BZ"
        del "ars-main.zip"
    )
    cd ARS-BZ
)

echo.
echo [6/8] Installing application dependencies...
echo.

cd app
call npm install -g yarn
if !errorLevel! neq 0 (
    echo ERROR: Failed to install Yarn.
    pause
    exit /b 1
)

call yarn install
if !errorLevel! neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo [7/8] Setting up database and configuration...
echo.

REM Create database
echo Creating database...
createdb -U postgres -h localhost -p 5432 ars_database 2>nul

REM Create .env file
echo Creating configuration file...
(
echo # Database Configuration
echo DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ars_database"
echo.
echo # NextAuth Configuration
echo NEXTAUTH_URL="http://localhost:3000"
echo NEXTAUTH_SECRET="your-generated-secret-key-here-change-this-in-production"
echo.
echo # Environment
echo NODE_ENV="production"
echo.
echo # File Upload Settings
echo MAX_FILE_SIZE=10485760
echo ALLOWED_FILE_TYPES=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
) > .env

REM Initialize database
echo Initializing database...
call npx prisma migrate deploy
call npx prisma db seed

echo.
echo [8/8] Building application...
echo.

call yarn build
if !errorLevel! neq 0 (
    echo ERROR: Failed to build application.
    pause
    exit /b 1
)

REM Create startup script
echo Creating startup script...
cd "%INSTALL_DIR%"
(
echo @echo off
echo title Audience Response System
echo echo Starting Audience Response System...
echo echo.
echo cd /d "%INSTALL_DIR%\ARS-BZ\app"
echo call yarn start
echo echo.
echo echo Application is running at: http://localhost:3000
echo echo Press Ctrl+C to stop the server
echo pause
) > "Start ARS.bat"

REM Create desktop shortcut
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Audience Response System.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\Start ARS.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\Start ARS.bat,0'; $Shortcut.Save()"

echo.
echo ================================================================
echo                    INSTALLATION COMPLETED!
echo ================================================================
echo.
echo The Audience Response System has been successfully installed!
echo.
echo Installation location: %INSTALL_DIR%
echo.
echo HOW TO START:
echo 1. Double-click "Audience Response System" on your desktop, OR
echo 2. Double-click "Start ARS.bat" in the installation folder
echo.
echo The application will be available at: http://localhost:3000
echo.
echo IMPORTANT NOTES:
echo - Default database password: postgres123
echo - Change the NEXTAUTH_SECRET in .env file for production use
echo - Make sure Windows Firewall allows the application
echo.
echo For network access from other devices:
echo - Use your computer's IP address instead of localhost
echo - Example: http://192.168.1.100:3000
echo.
echo Need help? Check the README.md file or visit:
echo https://github.com/benny2744/ARS-BZ
echo.
echo Press any key to start the application now...
pause >nul

start "" "%INSTALL_DIR%\Start ARS.bat"

echo.
echo Installation script completed!
pause
