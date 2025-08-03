---
title: "the quest to become a dockerpilled devops maxxer, as the kids say"
tags: ["devops", "tutorial"]
excerpt: "This is a test post to demonstrate the structure of a markdown file."
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
your computer having an "IP address": a set of numbers assigned to every computer when it connects to the Internet
(often by your internet provider). For example, you could try typing into your web browser `142.250.69.164`, and
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



## Check Out My New Website, http://localhost:3000

## HTTP and the Humble Webserver

## This Site is not Secure

## Why a Swarm of Nanobots Will Probably be Able to Devour the Entire Earth, not Just Forty Percent

## Put it in Reverse

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


