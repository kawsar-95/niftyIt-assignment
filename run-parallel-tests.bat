@echo off
echo ===============================================
echo   Denowatts Quote Automation - Parallel Run
echo ===============================================
echo.
echo Running 40 quote creation test combinations in parallel...
echo Test Matrix:
echo - AC Nameplate: 0.5MW, 5MW, 12MW, 40MW, 120MW
echo - Mounting: Carport, GroundFixed, GroundTracker, Rooftop  
echo - Modules: Monofacial, Bifacial
echo - Service: 1yr, 5yr (alternating)
echo.
echo Execution: 4 parallel workers with HTML report
echo.

npm run test:parallel

echo.
echo ===============================================
echo Parallel test execution completed!
echo Check playwright-report/index.html for results
echo ===============================================
pause
