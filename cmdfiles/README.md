
# Microsoft Office Activator :zap:

### *__Microsoft Office Activator__* is a simple command line script project to activate Microsoft Office (Standard & Professional Plus) using *__KMS server__*. It's totally free & you don't need to install any tools/software.

![office_2016](https://4.bp.blogspot.com/-o7-6Pdh_DC4/WyC8Cgb9pFI/AAAAAAAAEMc/p5JwvlIIGow9FIIh8gimYoL45Of1Wxm9QCLcBGAs/s320/2000px-Microsoft_Office_2013_logo_and_wordmark.svg.png)

#

### **Create the Activator File** :clipboard:

- Basically we will create & use our own simple batch file (__.cmd__) which can access the KMS server to activate Microsoft Office products. To get started, open your text/code editor (e.g **_Notepad_**, **_WordPad_**, **_Visual Studio Code_**, etc.), write the codes below & save it as **.cmd** file. Or you can simply download my **Activator.cmd** from this repo.

    ```cmd
    @echo off
    title Microsoft Office Activator - felixent&cls&echo.&echo ****************************************************************************&echo Microsoft Office Activator without any software!&echo Mosquito&echo felixent(c)2018 &echo.&echo.****************************************************************************&echo.&echo #This project is using KMS server.&echo.&echo #Supported products:&echo - Microsoft Office Standard 2016&echo - Microsoft Office Professional Plus 2016&echo.&(if exist "%ProgramFiles%\Microsoft Office\Office16\ospp.vbs" cd /d "%ProgramFiles%\Microsoft Office\Office16")&(if exist "%ProgramFiles(x86)%\Microsoft Office\Office16\ospp.vbs" cd /d "%ProgramFiles(x86)%\Microsoft Office\Office16")&(for /f %%x in ('dir /b ..\root\Licenses16\proplusvl_kms*.xrm-ms') do cscript ospp.vbs /inslic:"..\root\Licenses16\%%x" >nul)&(for /f %%x in ('dir /b ..\root\Licenses16\proplusvl_mak*.xrm-ms') do cscript ospp.vbs /inslic:"..\root\Licenses16\%%x" >nul)&echo.&echo ****************************************************************************&echo Activating your Microsoft Office...&echo.&cscript //nologo ospp.vbs /unpkey:WFG99 >nul&cscript //nologo ospp.vbs /unpkey:DRTFM >nul&cscript //nologo ospp.vbs /unpkey:BTDRB >nul&cscript //nologo ospp.vbs /unpkey:CPQVG >nul&cscript //nologo ospp.vbs /inpkey:XQNVK-8JYDB-WJ9W3-YJ8YR-WFG99 >nul&set i=1
    :server
    if %i%==1 set KMS_Sev=kms7.MSGuides.com
    if %i%==2 set KMS_Sev=kms8.MSGuides.com
    if %i%==3 set KMS_Sev=kms9.MSGuides.com
    if %i%==4 goto notsupported
    cscript //nologo ospp.vbs /sethst:%KMS_Sev% >nul&echo ****************************************************************************&echo.
    cscript //nologo ospp.vbs /act | find /i "successful" && (echo.&echo ****************************************************************************&echo.&echo #Facebook: https://www.facebook.com/mosquito&echo #Twitter: https://twitter.com/mosquito&echo #GitHub: https://github.com/sethuaung&echo #Youtube: https://www.youtube.com/user/felixent&echo #Contact me at sethuaung@outlook.com&echo.&echo ****************************************************************************&echo.&choice /n /c YN /m "Done. Wanna see my project on YouTube [y/n]?" & if errorlevel 2 exit) || (echo The connection to my KMS server failed! Trying to connect to another one... & echo Please wait... & echo. & echo. & set /a i+=1 & goto server)
    explorer "https://www.youtube.com/user/felixent"&goto halt
    :notsupported
    echo.&echo ***************************************************************************=&echo Sorry! Your version is not supported.&echo Please try installing the latest version!
    :halt
    pause
    ```
- Make sure your internet connection is good enough, then open the file: _right click & choose **Open as Administrator**_. Automatically it will access KMS server to activate your Microsoft Office 2016. Wait until its processing done.

- If everything goes well, now your Microsoft Office is activated. On the last line, you can type __*n*__ to exit from the terminal, or type __*y*__ Enjoy! :sunglasses:

#

#### Mosquito :love_letter: _sethuaung@outlook.com_
