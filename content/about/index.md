---
title: "About"
toc: false
---

[release]: https://github.com/qsocket/qsocket/releases
[release-img]: https://img.shields.io/github/v/release/qsocket/qsocket
[downloads]: https://github.com/qsocket/qsocket/releases
[downloads-img]: https://img.shields.io/github/downloads/qsocket/qsocket/total?logo=github
[issues]: https://github.com/qsocket/qsocket/issues
[issues-img]: https://img.shields.io/github/issues/qsocket/qsocket?color=red
[docker-pulls]: https://img.shields.io/docker/pulls/qsocket/qsocket?logo=docker&label=docker%20pulls
[license]: https://raw.githubusercontent.com/qsocket/qsocket/master/LICENSE
[license-img]: https://img.shields.io/github/license/qsocket/qsocket.svg
[workflow-img]: https://github.com/qsocket/qsocket/actions/workflows/main.yml/badge.svg
[workflow]: https://github.com/qsocket/qsocket/actions/workflows/main.yml
[qsrn]: https://github.com/qsocket/qsrn

The Quantum Socket Toolkit allows two system behind NAT/Firewall to establish a TCP/TLS connection with each other. 

The qsocket library locally derives a universally unique identifier (UUID) and connects two devices through the Quantum Socket Relay Network [(QSRN)][qsrn] regardless and independent of the network layers, local IP Address or geographical location. The entire qsocket project is ported from the original **[gsocket](https://github.com/hackerschoice/gsocket) toolkit of THC**. 

## But Why?
So why did you reinvent the wheel? Simply because we wanted our own wheel :) Due to several design choices of THC and the nature of the project we were not comfortable using the GSRN for our own business. So we decided to create our own version to our own liking. We also wanted to modernize the project by porting it to Go/Rust, add new features, more platform support, and scalability.

<div align="center">
  <img src="../gorust.jpg">
</div>


The Quantum Socket Toolkit comes with a set of tools:
* [**qs-netcat**](https://github.com/qsocket/qs-netcat) - Netcat on steroids. Turn netcat into an TLS encrypted reverse backdoor via TOR (optional) with a true PTY/interactive command shell (```qs-netcat -s MySecret -i```), integrated file-transfer, redirect traffic or give somebody temporary shell access.
* [**qs-mic**](https://github.com/qsocket/qs-mic) - Access (record audio) the microphone devices of a remote system. (```qs-mic -s MySecret -d 10```)
* [**qs-proxy**](https://github.com/qsocket/qs-proxy) - Redirects the traffic of an existing program (binary) over the QSRN. It does so by hooking fundamental socket libraries inside libc using LD_PRELOAD method. (Experimental)
* [**qs-lite**](https://github.com/qsocket/qs-netcat) - Lightweight version of qs-netcat utility written in pure Rust (no external dependency).
* ...many more examples and tools.

---

### Supported Platforms
QSocket toolkit supports 12 platforms on 11 architecture, check **Supported Platforms** below for detailed table.

<details>
<summary>Supported Platforms</summary>

|     Tool      | **Linux** | **Windows** | **Darwin** | **FreeBSD** | **OpenBSD** | **NetBSD** | **Android** | **IOS** | **Solaris** | **Illumos** | **Dragonfly** | **AIX** |
| :-----------: | :-------: | :---------: | ---------- | ----------- | ----------- | ---------- | ----------- | ------- | ----------- | ----------- | ------------- | ------- |
|  **qsocket**  |     ✅     |      ❌      | ✅          | ✅           | ✅           | ✅          | ❌           | ❌       | ❌           | ❌           | ❌             | ❌       |
| **qs-netcat** |     ✅     |      ✅      | ✅          | ✅           | ✅           | ✅          | ✅           | ✅       | ✅           | ✅           | ✅             | ✅       |
|  **qs-lite**  |     ✅     |      ✅      | ✅          | ✅           | ✅           | ✅          | ✅           | ✅       | ✅           | ✅           | ✅             | ✅       |
|  **qs-mic**   |     ✅     |      ✅      | ✅          | ✅           | ✅           | ✅          | ❌           | ❌       | ❌           | ❌           | ❌             | ❌       |
| ~**qs-cam**~  |     🚧     |      🚧      | 🚧          | 🚧           | 🚧           | 🚧          | 🚧           | 🚧       | 🚧           | 🚧           | 🚧             | 🚧       |

</details>

---

**Crypto / Security Mumble Jumble**
- The connections are end-2-end encrypted. This means from User-2-User (and not just to the Relay Network). The Relay Network relays only (encrypted) data to and from the Users.
- The QSocket uses [SRP](https://en.wikipedia.org/wiki/Secure_Remote_Password_protocol) for ensuring [perfect forward secrecy](https://en.wikipedia.org/wiki/Forward_secrecy). This means that the session keys are always different, and recorded session traffic cannot be decrypted by the third parties even if the user secret is known.
- The session key is 256 bit and ephemeral. It is freshly generated for every session and generated randomly (and is not based on the password).
- A brute force attack against weak secrets requires a new TCP connection for every guess. But QSRN contains a strong load balancer which is limiting the consecutive connection attempts.
- Do not use stupid passwords like 'password123'. Malice might pick the same (stupid) password by chance and connect. If in doubt use *qs-netcat -g* to generate a strong one. Alice's and Bob's password should at least be strong enough so that Malice can not guess it by chance while Alice is waiting for Bob to connect.
- If Alice shares the same password with Bob and Charlie and either one of them connects then Alice can not tell if it is Bob or Charlie who connected.
- Assume Alice shares the same password with Bob and Malice. When Alice stops listening for a connection then Malice could start to listen for the connection instead. Bob (when opening a new connection) can not tell if he is connecting to Alice or to Malice.
- We did not invent SRP. It's a well-known protocol, and it is well-analyzed and trusted by the community. 

---

If gs-netcat is a germanic battle axe... than qs-netcat is a turkish döner knife ᕕ(⌐■_■)ᕗ ♪♬ 
