---
title: "the quest to become a dockerpilled devops maxxer"
tags: ["devops", "tutorial"]
excerpt: "or just to manage deploying all of projects, I don't know what kids say these days"
author:
  name: "Eric Zhan"
  id: "ezhan"
date: 2025-08-02
status: "draft"
---

Over the last few days, I've been knee-deep in the infrastructure fires,
setting up deployment pipelines and taking care of a backlog of configuration debt.
So now is probably a good time to explain what's actually going on from the
ground up. 

This post will consist of three parts: first, an explanation of all the components
of getting a single web application running. Second, we'll look at the architecture
required to handle our current CI/CD server, responsible for automatically deploying
many projects at the same time. Finally, I'll provide some explanation and examples
for the actual services we use.

# Part 1: Computer Networking and Running a Single App

## TCP and IP

How does a computer *actually* communicate with another computer? 

It's not the easiest engineering problem. You have to send bits over the network, and we'll even suppose
the details of the hardware and encoding are handled for you. But you need to know where the other computer
is, for some definition of "where". You will need to make sure all of the data gets through - the network
is unreliable, after all. Data could also be duplicated during transmission. If your server needs to connect to
a lot of different computers, the data could all be mixed with one another, and the congestion could get pretty bad.

The notion of "where" a computer lives was implemented using the **Internet Protocol (IP)**. Most likely, you've heard of
your computer having an "IP address": a 32-bit number assigned to every computer when it connects to the Internet
(often by your internet provider). We typically represent this number as four 8-bit numbers, from `0.0.0.0` to `255.255.255.255`.
For example, you could try typing into your web browser `142.250.69.164`, and
if you're feeling lucky, let it connect you to a server somewhere on the internet! 

How the internet actually *finds* this computer is quite complicated, and not super relevant. But the
fundamental idea is a hierarchical structure; imagine a large company, for example. Your computer sends a request,
and if you're using Wi-Fi, this usually goes to a Local Area Network (LAN, a fancy way of saying Wi-Fi doesn't extend 
very far) first. This router will then check its own routing table, and if there's a match, send your request to another
computer in the same LAN. Otherwise, it will forward your request to *its* router (I use the term "router" very loosely here),
all the way until the top levels. Then, once your request is found, it follows the chain of routers all the way back down to a computer.

<img width="576" height="344" 
  alt="A diagram of the router hierarchy. Source: https://web.stanford.edu/class/msande91si/www-spr04/readings/week1/InternetWhitepaper.htm" 
  src="https://github.com/user-attachments/assets/2c55b839-b444-490c-a0fb-4fe6ada84b6f" />

(of course, it's kind of a stretch to call them all "routers", but it gets the point across.)

To address the question of actually sending data, some very smart people developed the **Transport Control Protocol (TCP)** in the 1970s. 
It "sits on top of" the IP layer, in the sense that TCP specifies *nothing* about how the individual bits get sent, only that the data
arrives reliabily. It does so by splitting the data stream (for example, a large file) into manageable chunks, called **packets**, 
and attaching a bunch of metadata to each one. The full protocol is extremely complex and not relevant at all, but very interesting to
explore if you're interested. 

Additionally, there's the **User Datagram Protocol (UDP)**, which is faster but also less reliable.

Anyways, the point: modern computer networking consists of *layers*. We've seen two of these: the *Internet* layer (IP) and the
*Transport* layer (TCP). Below the Internet layer exists Link, responsible for the specific transmission of bits. This covers hardware
implementations like Wi-Fi and Ethernet, but also software interfaces like Virtual Private Networks (VPNs) and network tunnels. Above 
the Transport layer lies Application, covering protocols like HTTP, HTTPS, WebSocket, and others. But the key idea is that none of them
rely on each other; for example, IP doesn't care less if its TCP or UDP that gets sent over it, because from IP's perspective, all of the extra
TCP header data is just IP payload data. Similarly, TCP never sees the data that IP or the Link layer attaches to its payload.
This encapsulation allows us to write software without ever worrying about what goes on under the hood.

<img width="525" height="329" 
  alt="A diagram showing the four Internet Protocol layers and the encapsulation of data at each step. Source: https://en.wikipedia.org/wiki/File:UDP_encapsulation.svg" 
  src="https://github.com/user-attachments/assets/25ded164-9271-4137-aeac-f80e6e13cc94" />

We will spend the most of the rest of our time living in the Application layer, but we will still reference both IP and TCP.

## The Humble Google Search

If you're following along and entered `142.250.69.164` earlier, you'd know it leads you to `www.google.com`. 
And if you didn't, sorry for the spoiler.

Of course, we don't usually access Google this way. We identify Google by its **domain name**, `www.google.com`. 
Somewhere between the user clicking "Enter" and a request being sent to the correct IP address, we need to translate
`www.google.com` to `142.250.69.164`.

This is done by a system known as **Domain Name System (DNS) resolution**. First, the client connects to a **DNS Resolver**. 
The DNS Resolver takes the following steps:

1. It will find a hardcoded DNS root nameserver. There are finitely many of these, hardcoded and defined by the
Internet Assigned Numbers Authority.
2. It will look at the *top level domain* for the domain `www.google.com`, which in this case is `.com`. It makes a request
to the root nameserver, which returns
an IP address corresponding to the associated top level domain (TLD) server for `.com`. That is, this TLD server
will store records for all domains that end with `.com`.
3. It will connect to the TLD server and looks at the *domain name*, which here is `google.com`. The TLD server
returns the IP address of the nameserver for the domain name `google.com`, which covers `google.com`, `www.google.com`, `maps.google.com`, etc.
4. It will connect to the Google nameserver, which finally returns `142.250.69.164`.

There's no magic at any step in this process - each nameserver literally keeps a large lookup table for all of its associated subdomains. 
But while maintaining a live-updating list of every possible website on the entirety of the Internet is a nearly impossible feat, we can significantly
reduce the amount of *total* data stored across all servers by using this distributed model. For example, if `google.com` had `x.google.com`, `y.google.com`, and `z.google.com`,
storing all three of these on one server takes 30 characters of information. But storing `google.com` on one computer and `x`, `y`, `z` on another takes just twelve.
You may notice similarity to how IP transmission is done - in the end, everything in computer science is just a tree!

It turns out that you can actually do this in your terminal with the `dig` command:

```
> dig www.google.com

; <<>> DiG 9.18.30-0ubuntu0.22.04.2-Ubuntu <<>> www.google.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 54784
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.google.com.                        IN      A

;; ANSWER SECTION:
www.google.com.         210     IN      A       142.250.69.164

;; Query time: 31 msec
;; SERVER: 10.255.255.254#53(10.255.255.254) (UDP)
;; WHEN: Sat Aug 02 20:21:05 PDT 2025
;; MSG SIZE  rcvd: 59
```

Note that depending on when and where you run this, your results may vary. `www.google.com` is actually bound
to a bunch of different IP addresses, because you could imagine that one server handling every single request made to Google
might be a bit much.

For our purposes, we need to buy a domain name (hosting a DNS server ain't cheap, after all) so users can conveniently access our app.
AppDev's preferred way of doing this is using [Cloudflare](https://www.cloudflare.com/), which offers other really nice features such as free
TLS certificates (covered below) and DDoS protection. Once we purchase `mitappdev.com`, Cloudflare will:

1. Ask the TLD server for `.com` to add `mitappdev.com` to its registry, and point any DNS queries made to `mitappdev.com` to the Cloudflare nameserver
2. Add our IP address (say `111.222.33.44`) to Cloudflare's nameservers
3. Add any other IP address for subdomains we specify such as `ci.mitappdev.com`, `proxy.mitappdev.com`, or others to Cloudflare's nameservers.

Once this is done, congratulations! Now, any DNS resolver following the steps earlier will find `mitappdev.com` on the Internet! 

<img width="1273" height="450" 
  alt="An example Cloudflare DNS configuration" 
  src="https://github.com/user-attachments/assets/82605c9f-68f8-42a5-8fed-a918d2216016" />

Note that in the example, the IP address of our backend server has been manually censored out.

### Who owns the domains, and who gets to sell them?

If you've been paying attention, you might notice something about this doesn't really feel right. 
What does it mean that we "buy" a domain name from Cloudflare? Does Cloudflare have exclusive access to the domain name,
so it's just sitting around, just waiting to be used? 

Actually, no. If you have set your eye on a particular domain name, other services such as Namecheap, GoDaddy, or
a hundred other far sketchier ones will also be happy to sell to you. Turns out the answer is depressingly simple:
nobody actually "owns" a domain name; not you, not Cloudflare, not Namecheap, etc. Instead, everything is managed by
the **Internet Corporation for Assigned Names and Numbers (ICANN)**, and these companies have entered agreements with them. 
Coincidentally, this is why nobody actually owns domains forever; ICANN sets limits for ten years, but in practice people
will just renew their domains whenever they need to. And at this point, it's a little bit late to try and start your
own version of the Internet that competes with ICANN, so there's not much you can do.

### A, AAAA, and CNAME

The first column of the above screenshot, `Type`, is a bit mysterious. There's a few "types" of DNS records,
and they refer to different things:

- **A** records are the most simple: they map a domain (e.g. `mitappdev.com`) to an IP address (`76.76.21.21`).
- **AAAA** records are similar to A records, but they go to IPv6 addresses instead of IPv4. We haven't covered IPv6 versus IPv4 yet,
but the gist is that the IP addresses we've seen (a.b.c.d) are IPv4, whereas a newer system has emerged called IPv6 that has more addresses.
- **CNAME** records are basically pointers: they map an alias (e.g. `appdevatmit.com`) to another *canonical name* (`mitappdev.com`).

There's also a few other interesting types:

- **NS** records map domains (e.g. `mitappdev.com`) to the associated DNS server (`ridge.ns.cloudflare.com`).
- **MX** records map domains to servers, but specifically for email.

## Check Out My New Website, http://localhost:3000

<img width="640" height="388" 
  alt="A screenshot on Twitter with content 'Hosting a vibe coding hackathon. Created a portal for anyone who wants to join: http://localhost:3000/register'" 
  src="https://github.com/user-attachments/assets/b04b4658-95da-4af5-9d0f-e6ab0a27f213" />

Well, someone clearly didn't read the above two sections.

Nevertheless, the above screenshot raises some interesting questions. We know that a domain name consists of several parts
(e.g. `www.mitappdev.com`) but `localhost` is just one word. How does DNS deal with that? What is that 3000? Isn't the concept of
a "vibe coding hackathon" oxymoronic, because it strips all technical ability out of the equation and reduces the event to
little more than a business pitch competition plus a bunch of half functional ChatGPT wrappers?

We can't really answer the last question, but we'll tackle the first two. 

### Ports

Recall that the TCP protocol describes how data is transmitted between servers. TCP relies on IP to figure out where to send its data,
but an individual computer or server is still far too broad of a target. On your computer, you probably have a web browser open,
maybe an email app, a messaging app, plus maybe you're running development servers for that next big startup idea you're working on.
That's already several different *processes* that need to compete to communicate between each other and the world. When your web browser 
uses TCP to send data to a server running several different processes, somehow the data must get routed to the correct process. 
Additionally, oftentimes processes on the same computer need to communicate with each other as well. It is clear that having just one channel
per computer isn't sufficient. Thus, TCP actually extends the IP address with a **port**: a 16-bit number from 0 to 65535 that both parties
must agree on in advance. The sender needs to know which port to send to, and the receiver needs to know which port to listen on. 

As an analogy, if IP gives you the address of Simmons Hall, the TCP port tells you the room number. But everyone living in Simmons Hall
still has to enter and exit through the front door. (Unless, of course, the fire alarm goes off at 2 in the morning). Likewise,
no matter how we split the internet traffic using ports, it still goes to one server and processed by the same hardware. It's not like ports
magically fix congestion issues, or fundamentally send packets to different places.

The port doesn't have any intrinsic significance, as it is just a number. But over the years, some very strong conventions have emerged:

- Ports from 0 to 1023 are known as **well-known ports** or **system ports**. On a typical Linux system, you cannot connect to them without
elevated privileges (the equivalent of "admin", known as `sudo`). All other ports are fair game.
- HTTP runs on port **80**.
- HTTPS runs on port **443**.
- File transfer (FTP) runs on ports **20** and **21**.
- SSH and port forwarding runs on port **22**.
- Email (SMTP) runs on port **25**.
- DNS runs on port **53**.

Generally, you wouldn't want to mess with those. On the other hand, you may notice that by default, some web frameworks like to run on
ports 3000, 5173, 8000, or 8080. You can see all of the ports that your computer is listening on using the **s**ocket **s**tatistics (`ss`) command:

```
> sudo ss -tlnp
Netid      State       Recv-Q      Send-Q                  Local Address:Port              Peer Address:Port      Process
tcp        LISTEN      0           4096                          0.0.0.0:1240                   0.0.0.0:*          users:(("docker-proxy",pid=193189,fd=7))
tcp        LISTEN      0           4096                    127.0.0.53%lo:53                     0.0.0.0:*          users:(("systemd-resolve",pid=343,fd=15))
tcp        LISTEN      0           4096                       127.0.0.54:53                     0.0.0.0:*          users:(("systemd-resolve",pid=343,fd=17))
tcp        LISTEN      0           511                           0.0.0.0:60002                  0.0.0.0:*          users:(("nginx",pid=132166,fd=7),("nginx",pid=132165,fd=7),("nginx",pid=128799,fd=7))
tcp        LISTEN      0           4096                             [::]:1240                      [::]:*          users:(("docker-proxy",pid=193198,fd=7))
tcp        LISTEN      0           4096                                *:80                           *:*          users:(("traefik",pid=177404,fd=9))
tcp        LISTEN      0           4096                                *:22                           *:*          users:(("sshd",pid=1263,fd=3),("systemd",pid=1,fd=149))
tcp        LISTEN      0           4096                                *:443                          *:*          users:(("traefik",pid=177404,fd=10))
tcp        LISTEN      0           4096                                *:2377                         *:*          users:(("dockerd",pid=800,fd=25))
tcp        LISTEN      0           4096                                *:60001                        *:*          users:(("traefik",pid=177404,fd=8))
tcp        LISTEN      0           50                                  *:60000                        *:*          users:(("java",pid=3292,fd=9))
tcp        LISTEN      0           511                              [::]:60002                     [::]:*          users:(("nginx",pid=132166,fd=16),("nginx",pid=132165,fd=16),("nginx",pid=128799,fd=16))
tcp        LISTEN      0           4096                                *:7946                         *:*          users:(("dockerd",pid=800,fd=30))
```

The `-t` flag shows you TCP connections (`-u` would also show UDP), `-l` shows listening ports, `-n` gives you the raw port numbers (otherwise `:80` would be `:http`), and `-p` shows you the associated process.
Note that if you don't run the command with `sudo`, you won't be able to see the processes associated with system ports.

The choice of TCP to use a 16-bit number means that your computer is effectively limited to 65536 channels of communication. (There's ways around this, as we will see shortly, but that's still merging
some channels into others; TCP only allows this many). Indeed, if TCP didn't use ports, your computer would only get one! This also means that if you try to connect to a port already in use,
say with the **n**et**c**at (`nc`) command,

```
> sudo nc -lp 80
nc: Address already in use
```

your computer won't allow you to. Of course, **port sharding** exists, which allows multiple processes from the same user to listen to a port, but it's complex and not really relevant. 

### Loopback and Localhost

Not only did I omit important details about TCP earlier, but I also left out information about DNS! How scandalous!

In [RFC 6761, Special-Use Domain Names]([url](https://datatracker.ietf.org/doc/html/rfc6761)), section 6.3 states

```
The domain "localhost." and any names falling within ".localhost."
   are special in the following ways:

   1.  Users are free to use localhost names as they would any other
       domain names.  Users may assume that IPv4 and IPv6 address
       queries for localhost names will always resolve to the respective
       IP loopback address.

   2.  ...

   3.  Name resolution APIs and libraries SHOULD recognize localhost
       names as special and SHOULD always return the IP loopback address
       for address queries and negative responses for all other query
       types.  Name resolution APIs SHOULD NOT send queries for
       localhost names to their configured caching DNS server(s).

   4. ...
```

That's right, `localhost` is essentially hard-coded as a special case in the DNS specification.

Okay, what does this mean? A `loopback` address simply is an IP address that *points back* to the original computer
that made the request. In other words, I can refer to another port running on my system with `localhost:<port>`. 
This allows processes on my system to communicate between each other, without wasting a DNS lookup or even an internet connection.

IPv4 allocates eight loopback addresses: `127.0.0.<1-8>`, although `127.0.0.1` is the most common.
Meanwhile, IPv6 has just one: `[::1]`. 
As a sidenote, you should generally use `localhost` in your code instead of explictily specifying one address or another. 

There are other hardcoded subnets in the IP system, such as `192.168.0.0/16` reserved for private addresses or `169.254.0.0/16` 
for link-local addresses, but we won't usually deal with them. (The `/16` here denotes a **subnet mask**, which refers to a group of IP addresses
that all share the same first 16 bits, such as `192.168`).

## HTTP and the Humble Webserver

We are finally ready to move onto the application layer.

HTTP stands for **HyperText Transfer Protocol**, originally a protocol intended only for serving "hypertext". Nowadays, 
it's the backbone of the modern web, and for something so widespread, it's actually quite simple. 

HTTP/1.1 (which is like all of the internet, despite HTTP/2 and HTTP/3 being around for a while) consists of two parts:

- the **Request**, which is sent from a client (e.g. your browser) to a webserver
- the **Response**, which the webserver sends back to the client

HTTP is encoded in plain text and (for HTTP/1.1, at least) sent over TCP. This means that the raw data is actually
human-readable, and fairly simple:

<img width="820" height="303" 
  alt="A diagram of the structure of an HTTP request and response." 
  src="https://github.com/user-attachments/assets/d7d1dfbd-04fc-414b-855a-be98d0c7b2d5" />

So, in order to serve our web application, we need to have a process listen on port 80 (recall HTTP is primarily served through that port), 
and whenever it receives a valid HTTP request, run our code. Of course, the process doesn't *have* to run on port 80; 
your development servers handling HTTP run on other ports such as 3000, 5173, etc. 

We *could* reconfigure our development servers
to listen on port 80, but this is a poor choice. Oftentimes, development servers are bulky and slow, and intentionally so:
they provide features such as hot reloading and debugging. But in production, we don't want this, and so many frameworks
allow you to either run in "production mode" for performance optimization or bundle the code to static HTML, javascript, and css files.
When we need to serve *static* files, we need to introduce a **webserver** that does nothing but open a file stored on disk 
upon a HTTP request and send it over. This use case is so common that there are many webserver implementations, such as Nginx,
Apache, Lighty, and others. For the purposes of this post, we will mostly be looking at Nginx, but keep in mind that much of the
functionality and configuration can be directly translated into the other webservers.

## This Site is not Secure

You've probably seen this warning at some point in your life:

<img width="1599" height="695" 
  alt="An example of Chrome's 'Your connection is not private' warning" 
  src="https://github.com/user-attachments/assets/1ba1af55-01f0-42e2-8eee-628f1d5ca420" />

This shows up whenever you access a site using HTTP (e.g. `http://example.com`). Instead, Chrome expects that all sites 
use HTTP Secure (HTTPS), so you would connect using `https://example.com`. (The stuff before the `://` merely denotes 
the application level protocol. If I wanted to connect via websockets, I would use `ws://example.com`).

HTTP Secure was first introduced in the 1990s, but only seriously caught traction in the mid 2010s as the Internet got more popular,
sites begun getting hacked, and the government eventually mandated a migration to HTTPS for `.gov` sites. Nowadays, it is the standard,
and for good reason. Since HTTP is so conveniently human-readable, nothing stops a malicious attacker from sitting in the middle 
of you and the server (remember that IP works not by directly connecting you, but making many stops along the way) and reading all
of that data, including passwords and other secrets. It also allows an attacker to pretend to be the webserver, blocking 
the request, and sending back its own (malicious) response. 

Hence, HTTPS was introduced, which handles both of these issues:

- It encrypts all of its communication using **Transport Layer Security (TLS)**, building upon the much older and now deprecated
**Secure Sockets Layer (SSL)** protocol. This way, attackers won't be able to read what you send to you and the server.
- It requires webservers to identify themselves using a **certificate**, a long string of random numbers. This certificate
must be issued by a third-party **Certificate Authority (CA)** that maintains a database of valid certificates and their associated IPs.
Browsers like Chrome or Firefox individually maintain a list of CAs to trust, so it's not really feasible for a random attacker to make up
their own certificate and expect it to be acknowledged (this is known as *self signing*, like a kid scribbling "$1" on a piece of paper and handing it off as money). This
prevents attackers from posing as webservers.

You should *always* use HTTPS for your application, and every modern webserver supports it. But you also should support HTTP, since 
users may attempt to connect there. A typical server configuration will have the server listen on port 80, but redirect to the HTTPS
version of the domain. You can find an example of this for nginx in part 3.

Similar to domain names, there are a variety of widely accepted CAs, but AppDev strongly encourages all members to use Cloudflare.
Cloudflare provides free certificates for all first level subdomains (e.g. it covers `ci.mitappdev.com` but not `mapit.ci.mitappdev.com`),
which is more than enough for most purposes. 

<img width="1045" height="307" 
  alt="Cloudflare SSL/TLS Origin Server Dashboard" 
  src="https://github.com/user-attachments/assets/b9513e99-95e4-4ef5-bb67-9ef4d1e8e57a" />

You would then download the certificate Cloudflare provides you, and configure your webserver to show the certificate when requested. 
Congratulations, you've taken the first but extremely necessary step to securing your app!

## Why a Swarm of Nanobots Will Probably be Able to Devour the Entire Earth, not Just Forty Percent

<img width="740" height="251" 
  alt="XKCD comic, two people in a satellite watch as nanobots consuming the earth stop halfway because they run out of IPv6 addresses" 
  src="https://github.com/user-attachments/assets/9b557ac5-50e4-4bf9-afff-05aa195a56fc" />

Before we move on with our app, we need to acknowledge that the Internet has a problem, and it's that *we're running out of IP addresses*. 

Recall that when IPv4 was first introduced, IP addresses were 32-bit numbers. If one gets assigned to every computer, phone, or smart thermometer in the world,
we'd run out of the roughly 4 billion possible addresses pretty fast. To solve this, we introduced IPv6, which uses 128 bits (340 trillion trillion trillion possible addresses).
Humans couldn't possibly exhaust all of these addresses unless a bunch of nanobots begin devouring Earth and add themselves to the internet, a frequent scenario that we can 
all relate to, which is what the above xkcd references.

Oh, and what happened to IPv5? ...we don't talk about IPv5.

Yet, 22 billion devices were connected to the interent as of 2019 (and the number is certainly much larger now). Somehow, IPv4 is still relevant, holding up,
and chugging along. This is due in part to the concept of **public vs private** IP addresses - the `192.168.0.0/16` subnet is reserved exclusively for distinguishing between
devices on the same private network and hence aren't unique between devices on a global scale. Institutions also use a technique known as **proxying**, where 
a client's request is first sent to a proxy server, which makes a request "on behalf" of the client. Hence, the entire network maintains one public IP address, and devices
on that network are distinguished by the proxy server using a private address.

Let's break this down in different terms. Say I'm ordering food for a group of people (e.g. a club event) from several different places. Each person could go to their restaurant 
and order their own food. This is like assigning each person a public IP address. On the other hand, I could collect everybody's orders in advance, and go out to the restaurants
and pick up food for them, then bring it back and hand it out to each person. I identify each person with their private IP address, and the restaurants have no idea who is *actually*
behind the order, as I am ordering "on their behalf". In other words, the situation looks completely identical to as if I was ordering for myself. 

This approach has several advantages. Suppose that the UN gets together and imposes a crazy rule that only 100 million people can walk outside at any given time. If everybody
goes out to order themselves, we'd hit that quota pretty quick; but if they all wait inside and I run errands, we're only using one allotted slot. In addition, if somebody wants
to order $500 of durians, I could say "no". This parallels how institutions (such as schools or companies) often use proxies to block certain content. If multiple people order from the
same restuarant, I can lump all of their orders together and save time (similar to how proxies can cache results). Finally, proxies are
often used for anonymity: if somebody really wants to eat Chipotle but knows their ex works there, I could order for them without any of the awkwardness.

<img width="880" height="440" 
  alt="Forward Proxy Flow" 
  src="https://github.com/user-attachments/assets/c56109c8-bc4b-4216-9366-11c5d9bc4208" />

At the end of the day, the nanobots can probably pretty easily figure out what to do: just divide the bots into subnets and use proxying to circumvent the IPv6 issue.
Although, we probably shouldn't tell them that if we want to keep living on Earth...

## Now, Put it in Reverse

Well that's cool, but what does this have to do with my web application?

Consider the following extremely common architecture problem: I'm using a web framework that *doesn't* build to static. The frontend is server-side rendered, meaning that
the HTML files sent to the client are generated on the fly. Let's say the frontend runs on `localhost:3000`. Simultaneously, my API endpoints are
written in a different framework, and run on `localhost:8000`. I want requests to `mitappdev.com` to go to the frontend, while requests to `mitappdev.com/api/`
should go to the backend. 

Naively, one might suggest a solution using DNS. Expose the `3000` and `8000` ports on your server. Simply route `mitappdev.com` to the former and `mitappdev.com/api/` to the latter.

Alas, this won't work for multiple reasons. First, DNS does not care about the actual resource path `/api/`, only the domain `mitappdev.com`. And even if you move `api` to a subdomain,
allowing it to be rerouted, DNS doesn't route to ports anyways. You'd need to tell the browser, once they've received the IP address, to access it on port 3000 or 8000, which isn't
possible with the Internet's current architecture. (Remember that TCP runs on top of and is separate from IP, and ports are part of TCP). Splitting our tiny to-do app to two separate servers
is unreasonably expensive, and we are looking for a workaround.

If we want only one server, it seems we're at a bit of a bind. All of our requests will come from port 443. While we could force one of these two servers to sit at port 443,
this would lose access to the other. To make matters worse, we probably already have an nginx instance listening at port 443 and serving static files such as images anyways.

Let's come back to the food ordering analogy, but this time we're at the Super Bowl. To prep for such an occasion, the basement floor of the stadium actually contains many different kitchens
that focus on different things: cold dishes, desserts, fried chicken, etc. Meanwhile, where the sports fans are, there are a bunch of vendors selling food. These vendors don't have the space
or capacity to make the food upstairs; it's just not possible. There's some videos online about the logistics of the Super Bowl, and they're quite fun to watch. 

When me and my friends order an ice cream and hot dogs from Joe's Snack Stand, the vendor will give us our food. But they also need to keep replenishing their inventory,
and so they will make a request to the kitchen for some more ice cream and more hot dogs, effectively on our behalf. (This is the forward proxy mentioned earlier). But the kitchen, as we know, is not just "the"
singular kitchen, but split apart to different rooms. When the person in charge of delivery gets this request, they need to make a decision: where to find ice cream and where to find hot dogs?

This is the job of the **reverse proxy**. While a forward proxy sits in front of clients and *requests* on the client's behalf, a reverse proxy sits in front of servers and *responds* on the server's behalf.
I would direct my DNS to the reverse proxy server, and the reverse proxy is responsible for forwarding that request to the appropriate server. Then, when the server responds, the reverse proxy is responsible
for sending that response back to the client. Similar to the forward proxy, the client *never knows the reverse proxy is there*. Likewise, when the vendor orders food from "the kitchen", they don't even
have to know or care that the kitchen is split into so many different parts; to them, it's just "the kitchen". 

<img width="5667" height="2834" 
  alt="Reverse Proxy Flow" 
  src="https://github.com/user-attachments/assets/77bbb4a9-53c4-4e45-90e1-4bd39e95e0cd" />

Nginx (and every other respected webserver) has a reverse proxy feature built in. Hence, our solution would be to configure nginx to *proxy* requests made to `mitappdev.com` 
and redirect them to `localhost:3000`, essentially copying the request and sending it somewhere new. (It's a little bit more complicated, as nginx has to rewrite some HTTP headers
to make this possible, but the data remains intact). Then, we would also have nginx proxy requests made to `mitappdev.com/api/` to `localhost:8000`. 
Clean, beautiful, and simple. Only one process ever listens to port 443, and it sorts all the web traffic to the place they belong.

As a sidenote, Cloudflare actually functions as a proxy (this is why we censored the exact IPs in the DNS configuration screenshot above). 
So DNS doesn't actually resolve to where we host our application server, but one of Cloudflare's reverse proxy servers; this allows Cloudflare to add
DDoS protection and other nice features. Revealing the true server IP would defeat the point of this protection, as any attacker can now just
send requests to the IP directly without ever going through Cloudflare. Note that the IP would never be exposed otherwise, because a reverse proxy forwarding a response
is indistinguishable from a regular web server actually sending that response. 

As a sidenote on the sidenote, Cloudflare provides SSL/TLS security by default on the proxy server. So the url you enter into the browser has
`https://` and Chrome thinks everything is fine. But because Cloudflare proxies requests, there is a second phase of the transmission where the
request is sent to *your* web server, and that by default is run over HTTP. Do not get fooled and assume your site is secured! 
You must change the "Encryption Mode" configuration to `Full` and request a certificate from Cloudflare to use on your origin server, as Cloudflare calls it.

<img width="854" height="339" 
  alt="A diagram showing Encryption Mode Full" 
  src="https://github.com/user-attachments/assets/bee964a4-23bc-4fba-a687-6314878a70e8" />

On the otherhand, your nginx reverse proxy running on your server can connect to `localhost` via HTTP, no encryption necessary, since it's all running locally. 

# Part 2: Containerizing and Running Many Applications

## What is CI/CD?

## The Design Problem

## Welcome to `chroot` Jail 

## Docker? I Hardly Know Her

## Docker Compose 

## So You Think You Know DNS

## One Reverse Proxy, Two Reverse Proxy...

# Part 3: Code and Configuration Snippets

## Docker

## Docker compose

## Jenkins

### Some Example Build Scripts

## Nginx

## Traefik


