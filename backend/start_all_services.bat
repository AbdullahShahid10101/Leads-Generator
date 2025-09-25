@echo off
echo Starting all Python services...

echo Starting Comprehensive Scraper (Port 8005)...
start "Comprehensive Scraper" cmd /k "cd /d %~dp0model && python api_comprehensive_scraper.py"

echo Starting Automated Scraper (Port 8003)...
start "Automated Scraper" cmd /k "cd /d %~dp0model && python api_automatedscraping.py"

echo Starting Captcha Service (Port 8002)...
start "Captcha Service" cmd /k "cd /d %~dp0model && python api_captcha.py"

echo Starting Proxy Rotation (Port 8001)...
start "Proxy Rotation" cmd /k "cd /d %~dp0model && python api_proxyrotation.py"

echo Starting Output Formats (Port 8004)...
start "Output Formats" cmd /k "cd /d %~dp0model && python api_outputformats.py"

echo All services started! Check the opened terminal windows.
echo.
echo Services running on:
echo - Comprehensive Scraper: http://localhost:8005
echo - Automated Scraper: http://localhost:8003
echo - Captcha Service: http://localhost:8002
echo - Proxy Rotation: http://localhost:8001
echo - Output Formats: http://localhost:8004
echo.
pause
