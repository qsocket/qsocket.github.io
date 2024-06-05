---
title: 'Deploy'
weight: 1
---

#### For **ALL** \*nix systems with bash | <i class="fa-brands fa-linux"></i> <i class="fa-brands fa-apple"></i> <i class="fa-brands fa-ubuntu"></i> <i class="fa-brands fa-debian"></i> <i class="fa-brands fa-fedora"></i> <i class="fa-brands fa-centos"></i> <i class="fa-brands fa-redhat"></i> <i class="fa-brands fa-suse"></i> <i class="fa-brands fa-freebsd"></i> ... <a style="float:right" href="javascript:toggle_payloads()" id="toggle_switch">WGET</a>

```bash
curl -fsSL qsocket.io/0 | bash
```
#### For Windows |  <i class="fa-brands fa-windows"></i>
```powershell
irm qsocket.io/1 | iex
```
#### For Android | <i class="fa-brands fa-android"></i>
1. Enable USB debugging on the android devive.
2. Attach the android device to a linux host with adb installed.
3. Run the following command on the linux host... 
```bash
bash -c "$(curl -fsSL qsocket.io/2)"
```
---

QSocket toolkit supports **12 platforms on 11 architecture** and can be deployed on nearly any device with internet access. Check [here](https://www.qsocket.io/examples/#deploy-examples) for more deploy options.

<script src="https://kit.fontawesome.com/f1a1e1311b.js" crossorigin="anonymous"></script>
<script>
    var index = 0
    var payloads = ["curl -fsSL", "wget -q -O-"]
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
