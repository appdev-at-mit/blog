---
title: "Reading 1: Introduction to the Command Line"
tags: ["reading"]
excerpt: "in which we learn that most hacking scenes in movies are very bad"
author:
  name: "Eric Zhan"
  id: "ezhan"
date: 2025-09-15
---

### Objectives

This is the first of a series of readings AppDev exec will publish to members to help them
develop skills. Each readings is intended to be a short concrete expansion on the content
covered in slides. The talk is intended to come first; the readings will reference content
on slides.

This reading presents:

- a concrete tutorial on how to use the command line
- how to navigate the filesystem
- how to install packages
- how to manage access control
- links to more resources to learn about the command line

## The single most important command in Linux

There's a famous saying: give a man a fish, and he eats for a day. 
Teach a man how to fish, and he eats for a lifetime. 

The `man` command in Linux is how you fish. It is short for **man**ual, and its usage is

```
man <name-of-command>
```

For example, `man curl` tells me everything I want to know about `curl`.
It documents its usage, option flags, behavior, etc.
These are known as the *man pages*. 

If you're learning a new language and encounter unfamiliar words, you consult a dictionary.
**You should always consult the man pages**. 

**Practice**: run `man man` to learn more about the `man` command

## Structure of a command

Recall that a command is just an executable file. But what you actually type into the terminal 
to run this file takes a very specific structure:

```
<arg-0> <arg-1> <arg-2> <arg-3> <...>
```

The shell reads your command as a series of **space-separated arguments** (essentially words). 
The first one, labelled `arg-0` above, is used to look up an executable file to run.
*The remaining arguments are passed into the program to work with*. For example, this is how `man` knows
which command you want man pages for.

There are some very strong conventions for what constitutes an argument. Depending on the command,
99% of the time it will fall into one of three categories: a file path, a string, or an option flag.
The option flag always begins with a `-` and usually consists of a single letter, e.g. `-a` or `-v`. 
Most commands also accept combinations, so `-av` would be equivalent to `-a -v`. Sometimes,
there's long versions of flags that start with `--`: one example could be `-v` having the alias `--verbose`.

## Navigating the filesystem

Let's look at the first few lines of the man pages for `ls`:

```
NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List information about the FILEs (the current directory by default).  Sort entries alphabetically if none of -cftuvSUX nor --sort is specified.
```

The first part, NAME, tells us that `ls` **l**i**s**ts the files in a directory. SYNOPSIS tells us how to use the command.
Finally, DESCRIPTION gives us some more information about what `ls` actually does. Most man pages may not follow the same format,
but the important information will almost always be given right at the top. If it isn't, the developer is pretty bad at their job.

**Check**: try running `ls`. Can you get the command to show hidden files as well? Can you get a more detailed description
of each file (in the format shown on the slides)? Can you make the file sizes human readable (e.g. 234M)?

There are a few other relevant commands:
- `cd`: **c**hanges **d**irectory (i.e. navigates somewhere else). Usage: `cd <path>`
- `rm`: **r**e**m**oves a file
- `mv`: **m**o**v**es a file
- `cp`: **c**o**p**ies a file
- `mkdir`: **m**a**k**es a **dir**ectory
- `rmdir`: **r**e**m**oves a **dir**ectory

## pwn.college

We won't waste any more time rehashing linux fundamentals that others have created excellent resources for.
One excellent resource we strongly recommend is https://pwn.college/linux-luminarium/. This platform is primarily a cybersecurity
teaching platform; you will find a lot of content about various types of security and hacking. But as part of one of its intro
modules, they go over the basics of linux in a very "from scratch" approach. (We'll also come back here when we inevitably
talk about web security).

The structure of pwn.college is **capture the flag**: lessons are divided into challenges. Each challenge contains a
*secret file* at the `/flag` path, and the goal is to read this file and paste it into the prompt box. (In a cybersecurity setting,
accessing `/flag` usually means that you've compromised the server pretty heavily. Of course, in these fundamental exercises,
many examples are contrived to give you a flag as a reward.) This approach carries two major advantages: 

1. It's really really fun.
2. You get to work on an *actual Linux machine* while doing the challenges. Most other platforms have you type the command
in a small subset / simulator, or expect to test things on your own machine.

`pwn.college` allows you to access its virtual machines in a variety of ways, but we encourage you to *not* use the `GUI` or `Code` interfaces.
You should use either `terminal` or `SSH`. 

**Practice**: create an account on pwn.college, and complete the following modules in the Linux Luminarium:

- Hello Hackers
- Pondering Paths
- Comprehending Commands
- Shell Variables
- Untangling Users
- Perceiving Permissions

As an aside, when I was initially drafting this reading, I planned a whole tutorial on creating an ssh key and 
connecting to their machines. Then, when revisiting the site to check the accuracy of my steps, I realized that
a built in web terminal was now available, with a much better UI than the previous options had! I still recommend
you to use SSH if you're comfortable, though. If you're not familiar, don't stress about it.

## Understanding `.bashrc`

There is *one* more part to the content I want to cover that doesn't seem to show up anywhere in pwn.college. 
Part of the power of Linux is the ability to customize your own setup and make your life more convenient in the future.
We do this with **rc (run command) files**, the most notable of which is your `.bashrc`. 

The `.bashrc` file lives in your home directory. First, answer the first two questions you're confident you know what that means:

**Check**: Which of the following paths should lead to your `.bashrc` file, if you are the user `linus` and your
current working directory is `/home/linus`? Options: 
`.bashrc`, 
`./bashrc`, 
`/.bashrc`, 
`./.bashrc`, 
`/./.bashrc`, 
`././.bashrc`, 
`../.bashrc`, 
`~bashrc`,
`~.bashrc`, 
`~/.bashrc`, 
`./~bashrc`,
`./~/.bashrc`, 
`/home/.bashrc`,
`/linus/.bashrc`,
`/home/linus/.bashrc`,
`/home/eric/.bashrc`,
`/usr/linus/.bashrc`.

**Check**: Repeat the same question, but now your home directory is `/home/linus/homework`.

Okay, now we're sure we know where it goes. As for the contents of the file, it's a series of commands
in bash (the language that your shell runs in). Essentially, you can think of it as
plugging each line in the file and running it as a command, in order. For example,
you could consider copy and pasting

```
alias l='ls -la'
```

**Check**: *Before you run it*, what does this command do? Note that `alias` unfortunately does not have a man page.
You should consult the internet.

The idea with `.bashrc` is that it runs **upon startup**. That is, without having to lift a finger,
in future terminal sessions, you will get the convenience of using `l`. 

To use it in *this* terminal session, look into the `source` command.


