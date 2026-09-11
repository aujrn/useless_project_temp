@echo off
title Random Relay - Automated Setup & Launcher
cls

python setup.py
if %errorlevel% neq 0 (
    echo.
    echo Setup encountered an error or was interrupted.
    pause
)
