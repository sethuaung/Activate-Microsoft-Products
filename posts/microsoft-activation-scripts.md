---
title: "Microsoft  Activation  Scripts (MAS)"
date: "2024-09-19"
tags: "configuration, setup, config"
excerpt: "A Windows and Office activator using HWID / Ohook / KMS38 / Online KMS activation methods, with a focus on open-source code and fewer antivirus detections."
---


<p align="center"><img src="https://massgrave.dev/img/logo_small.png" alt="MAS Logo"></p>

<h1 align="center">Microsoft  Activation  Scripts (MAS)</h1>

<p align="center">A Windows and Office activator using HWID / Ohook / KMS38 / Online KMS activation methods, with a focus on open-source code and fewer antivirus detections.</p>

<hr>
  
## Download / How to use it?

### Method 1 - PowerShell (Recommended)

-   Right-click on the Windows start menu and select PowerShell or Terminal (Not CMD).
-   Copy and paste the code below and press enter  
```
irm https://get.activated.win | iex
```
or (deprecated, will be retired on Aug 31 2024, use above instead)  
```
irm https://massgrave.dev/get | iex
```
-   You will see the activation options. Follow the on-screen instructions.
-   That's all.

---

- On older Windows builds you may need to run the below command before,  
`[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12`  
- The Powershell method does not work on Windows 7. Use the Method 2 - Traditional instead.  
- The URL get.activated.win may be blocked by some DNS services because it is a new domain.

### Method 2 - Traditional

-   Download the file under the code button from [GitHub](https://github.com/massgravel/Microsoft-Activation-Scripts) or [Bitbucket](https://bitbucket.org/WindowsAddict/microsoft-activation-scripts)
-   Right-click on the downloaded zip file and extract
-   In the extracted folder, find the folder named `All-In-One-Version`
-   Run the file named `MAS_AIO-CRC32_XXXXXXXX.cmd`
-   You will see the activation options, follow the on-screen instructions.
-   That's all.

To run the scripts in unattended mode, check [here](https://massgrave.dev/command_line_switches)

</br>

```
Latest Version: 2.6
Release date: 20-Apr-2024
```

### [Troubleshooting / Help](https://massgrave.dev/troubleshoot)
### [Download Original Windows & Office](https://massgrave.dev/genuine-installation-media)
### Homepage - [https://massgrave.dev/](https://massgrave.dev/)

---

<p align="center">Credit to @massgravel</p>
