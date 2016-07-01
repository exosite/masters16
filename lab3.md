---
layout: page
title: "Lab 3 - Adding a Real Sensor"
category: lab
date: 2016-06-28 12:00:00
order: 3
---

# Lab 3 - Adding a Real Sensor

Now that you've gotten familiar with where some of the pieces of applications built on the ExositeReady SDK are found, we're going to go through adding some new hardware to show you how to integrate other sensors or devices into an ExositeReady SDK application.

## Requirements

* PIC32MZ Embedded Connectivity Starter Kit
* Weather Click Board
* OLED Click Board
* Adapter Board
* An Internet Connection
* A Computer with MPLAB IDE, including:
  * MPLABX IDE v 3.30
  * Harmony v1.08
  * XC32 v1.40b
* The ExositeReady SDK, plus
  * The PIC32MZECSK port & example application

> The software requirements for this lab are the same as the first lab. If you have not completed that lab yet, it's **highly** recommend you do so before starting this lab.

## The Plan

You've been provided with a couple of mikrobus click boards, one containing a 'weather' (temperature, pressure, and humidity) and one containing an OLED display. In this lab we're going to add support for reading the temperature sensor and reporting the values from it in real time out to the Exosite platform for display in your web browser.

To change this we'll need to remove all the code that handles the LEDs and buttons and replace it with code that handles talking I2C to the [BME280](https://www.bosch-sensortec.com/bst/products/all_products/bme280) temperature/pressure/humidity sensor and SPI to the controller for the OLED display.

> Note: If you get stuck at any point during this tutorial, you can run `git diff origin/click_demo {filename}` to compare your current file to what we're going for. For example to compare your app.c file to my end result, run `git diff origin/click_shield_demo firmware/src/app.c` from the `er_vfp_microchip_harmony` folder.

## Let's Go

TBC

## Bonus Points

### Data Use Efficiency

Make the device use data more efficiently, you should implement an algorithm to only update the value written to the platform if there is a not-insignificant change in the value of the temperature.

> Note: in the real world you should make your algorithm report at some minimal interval just to make sure you have a way to determine if any of your devices have died or lost their connection. It's up to you if you'd like to do that here.
