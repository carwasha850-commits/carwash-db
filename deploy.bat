@echo off
echo ========================================
echo   Car Wash Backend - GitHub Deployment
echo ========================================
echo.

cd /d "%~dp0"

echo [1/6] Initializing Git repository...
git init

echo.
echo [2/6] Configuring Git user...
git config user.name "carwasha850-commits"
git config user.email "carwasha850@gmail.com"

echo.
echo [3/6] Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/carwasha850-commits/carwash-db.git

echo.
echo [4/6] Adding all files...
git add .

echo.
echo [5/6] Committing changes...
git commit -m "Update backend with admin panel features - Add service CRUD, users management, and enhanced bookings with total_amount field"

echo.
echo [6/6] Pushing to GitHub...
echo NOTE: You may be prompted for GitHub credentials
echo.
git push -u origin main

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Render dashboard (https://dashboard.render.com)
echo 2. Connect your GitHub repository (carwash-db)
echo 3. Render will auto-deploy the backend
echo 4. Wait 2-3 minutes for deployment
echo 5. Test your admin panel features!
echo.
pause
