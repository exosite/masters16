---
layout: page
title: "Lab 2 - Exploring the Source"
category: lab
date: 2016-06-28 12:00:00
order: 2
---

# Lab 2 - Exploring the Source

You've now had some experience using the ExositeReady SDK on the Embedded Connectivity Starter Kit and have gotten it to connect to the Exosite platform. Next, in this lab, you'll explore the code more and make some subtle tweaks to how the example reports data to the platform. This is intended to increase your familiarity with where the key pieces of functionality are handled in the application.

## Requirements

* PIC32MZ Embedded Connectivity Starter Kit
* An Internet Connection
* A Computer with MPLAB IDE, including:
  * MPLABX IDE v 3.30
  * Harmony v1.08
  * XC32 v1.40b
* The ExositeReady SDK, plus
  * The PIC32MZECSK port & example application

> The requirements here are the same as the first lab. If you have not completed that lab yet, it's **highly** recommend you do so before starting this lab.

# Exploring the Code

We'll start of in the source for the main application code which you can find in `Source File -> app -> app.c`. In this file you'll find the main `APP_TASKS` function that should be familiar to you if you've ever written firmware using Microchip's Harmony libraries before.

If you're not familiar with this application structure, you'll see that the application is structured as a state machine where the APP_TASKS function returns when it is done with it's current task, keeping track of the application's state in the appData global variable structure. The main body of the function takes the form of a single switch statement with each case being an individual state of the state machine.

> Try to follow the state through the application and understand the basic progression of the state machine.

In this application the app will spend most of it's time in the `APP_APPLICATION` state. This is where all the interaction with the Exosite platform is controlled.

Here you can see that we're writing some data based on the state of the buttons; this state is being written to a dataport with the alias "btn", it's simply a numeric value that indicates which button is pressed.

> Take note that the numeric value of the button press is converted to ASCII text. All requests that are sent to the API this demo uses require the messages to be UTF-8 encoded (of which ASCII is a subset, if you didn't know) so this library requires you to format all your requests before handing them off. It's done this way to simplify the communication protocols, using only standard web protocols and formats.

You will also see some code for reading the state for displaying on the LEDs from the 'leds' dataport, this is again a numeric value that encoded the state of each LED. It uses a simplistic encoding, see if you can figure out what it is.

> This way of encoding multiple independent inputs and outputs is done to reduce the resources required to communicate the data to the platform. You could split each LED and button into their own dataport, but that would require writing to multiple dataports and, more importantly, opening several connections to the platform to wait on changes to each dataport. This is largely a limitation of the API used by this library, Exosite has new device-side APIs that will get rid of this limitation.

# Making some Tweaks

The 'Product' model that is being used for these demos has a few more dataports we didn't use in the first lab. We want to read the `party_leds` dataport and use that value to set the state of the LEDs. We'll also want to make the buttons change the value in the `party_on_off` dataport.

The `party_leds` dataport uses the same format as the `leds` dataport. The `party_on_off` dataport takes either a "1" or a "0".

Before continuing to read the lab, try to see if you can make the changes to use these dataports instead of the ones included in the original example. If you're having trouble the following section will walk you through the steps needed.

## The Walkthrough

> tbc.

## Bonus Points

There's a limit to how large of a number you can write to numeric value dataports, see if you can figure out what it is.

