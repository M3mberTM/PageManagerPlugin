@echo off
cls
echo.

echo(          888888b    a888888c   a8888888c 88888888
echo(          888   "8b d88"  "88b a88"   "8P 88P    "
echo(          888   d8P 888    888 888        88b
echo(          888888"   8888888888 888  8888b 88888888
echo(          888       888"  "888 888    "88 88P
echo(          888       888    888 "88b   d8P 88b    i
echo(          888       888    888  "888888P  88888888

echo.
echo 8b     d8  a888888c  8b    d88  a888888c   a8888888c 88888888 888888b
echo 88b   d88 d88"  "88b 88b   888 d88"  "88b a88"   "8P 88P    " 888   "8b
echo 888b d888 888    888 888b  888 888    888 888        88b      888   d8P
echo 888888888 8888888888 888"b 888 8888888888 888  8888b 88888888 888888"
echo 888 " 888 888"  "888 888 "b888 888"  "888 888    "88 88P      888"88b
echo 888   888 888    888 888  "888 888    888 "88b   d8P 88b    i 888 "88b
echo 888   888 888    888 888   888 888    888  "888888P  88888888 888  "88b

echo.
echo(+---------------------------------------------------------------------+)
echo(^|                             INSTALLER                               ^|)
echo(+---------------------------------------------------------------------+)
echo.
echo =====WARNING: This plugin only works for adobe photoshop 2021 and higher=====
echo.
echo PLUGIN CREATOR: m3mber
echo If anything goes wrong with installation, you can write a DM to m3mber on Discord.
echo If you find bugs, write to m3mber on discord or create a new issue on Github.
echo.
echo Close Adobe Photoshop if it is open...
echo.

set /p shouldContinue=Do you want to proceed with installation? type "y" if yes:

if not "%shouldContinue%" == "y" (
    echo Cancelling installation...
    exit /b
)

echo Continuing with installation...

REM gets the basePath
set "roamingPath=%APPDATA%"
set "basePath=%roamingPath%\Adobe\UXP"
set "pluginPath=%basePath%\Plugins"
set "externalPath=%pluginPath%\External"

if not exist "%pluginPath%" (
    echo Creating Plugins folder...
    mkdir "%pluginPath%"
)

if not exist "%externalPath%" (
    echo Creating External folder...
    mkdir "%externalPath%"
)

set "pluginDir=%~dp0PageManagerPlugin_PS"

xcopy "%pluginDir%" "%externalPath%\PageManagerPlugin" /E /I /H /Y
echo.
echo =====INSTALLATION COMPLETE=====
echo.
echo Open Photoshop and in the upper menu click the following: [Plugins] -> [PageManager]
echo Guide for the plugin is on the Github page...
pause
exit