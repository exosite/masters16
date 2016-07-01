---
layout: page
title: "Lab Setup Guide"
category: lab
date: 2016-06-17 12:00:00
order: 98
---

This document will walk you through installing the ExositeReady SDK's example application for the PIC32MZ Embedded Connectivity Starter Kit.

## Prerequisites

Make sure you have the following software from Microchip already installed:

* MPLAB X (tested with v3.30)
* Harmony (tested with v1.08)
* XC32 (tested with v1.40)

You will also need to have [Git SCM](https://git-scm.com/) (or any git access tool, but you're on your own if you use something else).

## Installing the Example

1. Open a terminal or cmd prompt.
2. Navigate to the "apps" directory within the version of harmony you'll be using.
3. Clone the repository to the current folder.

   ```
   git clone https://github.com/exositeready/er_vfp_microchip_harmony.git
   ```

4. Navigate into the newly created `er_vfp_microchip_harmony` folder.
5. Initialize and update all submodules recursively.

   ```
   git submodule update --init --recursive
   ```

The example application, including the ExositeReady SDK, is now fully installed and ready to use.