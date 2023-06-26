---
title: 'Deploy'
weight: 1
---

#### For Unix-like systems `(all boxes with bash)`  <a href="javascript:toggle_payloads()" id="toggle_switch">WGET</a>
```bash
curl -fsSL qsocket.io/0 | bash
```
#### For Windows
```powershell
irm qsocket.io/1 | iex
```
#### For Android
1. Enable USB debugging on the android devive.
2. Attach the android device to a linux host with adb installed.
3. Run the following command on the linux host... 
```bash
bash -c "$(curl -fsSL qsocket.io/2)"
```


<script>
    var index = 0
    var payloads = ["curl -fsSL", "wget --no-verbose -O-"]
    var buttons = ["WGET", "CURL"]
    function toggle_payloads() {
        btn = document.getElementById("toggle_switch");
        btn.text = buttons[((index+1) % 2)]
        codes = document.getElementsByClassName("language-bash");
        for (var i = 0; i < codes.length; i++) {
            codes[i].textContent = codes[i].textContent.replace(payloads[index], payloads[((index+1) % 2)])
        }
        index = ((index+1) % 2);
    }
</script>