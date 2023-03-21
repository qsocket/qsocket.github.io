---
title: 'Deploy'
weight: 1
---

#### For Unix-like systems `(almost any OS with a bash)`
```bash
bash -c "$(curl -fsSL qsocket.io/0)"
```

#### For Windows
```powershell
IEX(New-Object Net.WebClient).downloadString('https://qsocket.io/1')
```

#### For Android
1. Enable USB debugging on the android devive.
2. Attach the android device to a linux host with adb installed.
3. Run the following command on the linux host... 
```bash
bash -c "$(curl -fsSL qsocket.io/2)"
```