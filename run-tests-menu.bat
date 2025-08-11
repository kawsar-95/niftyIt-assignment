@echo off
echo ===============================================
echo   Denowatts Quote Automation - Parallel Tests
echo ===============================================
echo.

echo Current test matrix: 40 combinations
echo - 5 AC Nameplate values (0.5, 5, 12, 40, 120 MW)
echo - 4 Mounting types (Carport, GroundFixed, GroundTracker, Rooftop)
echo - 2 Module technologies (Monofacial, Bifacial)
echo - 2 Service periods (1yr, 5yr alternating)
echo.

echo Select execution mode:
echo 1. Quick test (single combination) 
echo 2. Small systems parallel (0.5MW, 5MW with 2 workers)
echo 3. Large systems parallel (40MW, 120MW with 2 workers) 
echo 4. Standard parallel (4 workers)
echo 5. Fast parallel (6 workers)
echo 6. Full parallel (8 workers)
echo 7. Debug mode (headed, single worker)
echo.

set /p choice="Enter choice (1-7): "

if "%choice%"=="1" (
    echo Running quick test...
    npm run test:quick
) else if "%choice%"=="2" (
    echo Running small systems parallel...
    npm run test:small
) else if "%choice%"=="3" (
    echo Running large systems parallel...
    npm run test:large
) else if "%choice%"=="4" (
    echo Running standard parallel (4 workers)...
    npm run test:parallel
) else if "%choice%"=="5" (
    echo Running fast parallel (6 workers)...
    npm run test:parallel-fast
) else if "%choice%"=="6" (
    echo Running full parallel (8 workers)...
    npm run test:full-parallel
) else if "%choice%"=="7" (
    echo Running debug mode...
    npm run test:debug
) else (
    echo Invalid choice. Running standard parallel...
    npm run test:parallel
)

echo.
echo ===============================================
echo Test execution completed!
echo Check playwright-report/index.html for results
echo ===============================================
pause
