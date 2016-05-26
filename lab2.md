---
layout: page
title: "Lab 2 - CoAP"
category: lab
date: 2016-06-25 12:00:00
order: 2
---

# Lab 2 - CoAP

This is the CoAP lab. In this lab you will learn to understand the CoAP protocol at a high level for the purposes of debugging IoT devices during development. Most of this lab should be familiar to you; the majority of it parallels Lab 1 on HTTP.

## Part 1 - Understanding the basics of CoAP

   > Note: The format of messages used in this lab is **not** the actual format of a CoAP message. CoAP is a binary protocol that is not easily human readable. Instead this lab uses a format of my own creation that I'm using purely for its ease of understanding. It's simply a JSON object where each member is one of the components of a CoAP message encoded in an human readable manner.

### A Basic Request

1. Copy and Paste the Following into the request box on [https://play-dev.exosite.io/coap](https://play-dev.exosite.io/coap):

   ```json
   {
       "version": 1,
       "type": "CON",
       "code": "GET",
       "mid": 55,
       "token": [45,203],
       "opts": {
           "UriPath": [
               "ts"
           ]
       }
   }
   ```

2. Press the \[Send\] button.

   > What happened? Do you think it worked?
   >
   > Compare this to the HTTP requests you made in Lab 1, it may not look it at first glance, but this request was very similar to the initial request in Lab 1. In lab 1 you made a "get" request to "/timestamp", in this lab you made a "get" request to "/ts".

3. Change the word `GET` to `POST` and press \[Send\] again.

   > You'll see that the response changed. Compare the two different responses, one indicates an error and one indicates a success.
   >
   > Look at the `code` member in the JSON object, see that it changed from "Content" to "MethodNotAllowed", this should seem very similar to you after the the HTTP lab. In the HTTP lab the response reason was "OK", in CoAP "Content" has the same meaning (in addition to combining a few other HTTP reasons). When we changed to a POST we, again, got a response saying "Method Not Allowed". CoAP was designed to be very similar to HTTP so that developers already familiar with HTTP would be able to understand CoAP very quickly.

### Understanding Options

Options in CoAP are very similar to headers in HTTP, let's explore them.

1. Send the original request again, copy and paste the following into [https://play-dev.exosite.io/coap](https://play-dev.exosite.io/coap):

   ```json
   {
       "version": 1,
       "type": "CON",
       "code": "GET",
       "mid": 55,
       "token": [45,203],
       "opts": {
           "UriPath": [
               "ts"
           ]
       }
   }
   ```

2. Press the \[Send\] button.

3. Compare the response of that request to the response of the following request:

   ```json
   {
       "version": 1,
       "type": "CON",
       "code": "GET",
       "mid": 55,
       "token": [45,203],
       "opts": {
           "UriPath": [
               "ts"
           ],
           "Accept": 42
       }
   }
   ```

   > Do you notice a difference in the response?
   >
   > The `Accept` option specified here the format of the response that the requester would like to receive. There's no default value for Accept so the server is free to use any default format it wants. In the case of the second request we're setting a value of 42 which [is defined as](https://www.iana.org/assignments/core-parameters/core-parameters.xhtml#content-formats) "application/octet-stream", which just means "arbitrary binary data", and which we are using as a method to send a 32-bit timestamp in a raw format.

### Understanding Codes

Again, much like a request method, coap uses a 'code' to define what the message type is.

1. Send the original request again, copy and paste the following into [https://play-dev.exosite.io/coap](https://play-dev.exosite.io/coap):

   ```json
   {
       "version": 1,
       "type": "CON",
       "code": "GET",
       "mid": 55,
       "token": [45,203],
       "opts": {
           "UriPath": [
               "ts"
           ]
       }
   }
   ```

   > See that in this request we have a 'code' of "GET" which indicates that this is the same type of request that would be used for an HTTP request with a method of "GET".

2. Press the \[Send\] button.

3. Compare that **request** to the following request (the response is not important in this case):


   ```json
   {
       "version": 1,
       "type": "CON",
       "code": "POST",
       "mid": 56,
       "token": [45,37],
       "opts": {
           "UriPath": [
               "rpc"
           ]
       },
       "payload": "{}"
   }
   ```

   > Again, just like in HTTP we change from a "GET" to a "POST" and add a payload ("body" in HTTP terms.)
   >
   > You should get an error response to that request, that is expected. We'll use POST requests more in the RPC section.

## An Aside

You don't need to understand this part it's only used to generate a token that will be used later in this lab.

   > You may have already done this in Lab 1, but the keys that this script uses are automatically deleted periodically so your old key may no longer work.

1. Paste the following into the `script` box on [https://play-dev.exosite.io/script](https://play-dev.exosite.io/script).

   ```lua
   local exosite = require('https://lualib.webscript.io/exosite-lua-js.lua')
   local json = require("https://lualib.webscript.io/dkjson.lua")

   -- create client through CIK Fountain
   local status, cik = exosite.get_temporary_cik()
   print("USE THIS CIK: " .. cik)
   print(status, cik)

   -- create dataport
   local exo = exosite.rpc:new{cik = cik}
   local status, response = exo:create{
     "dataport",
     {
       format = "float",
       name = "Temperature",
       retention = {
         count = "infinity",
         duration = "infinity"
       }
     }
   }
   print(status, json.encode(response))
   local rid = response.result

   -- map alias to dataport
   local status, response = exo:map{"alias", rid, "temp"}
   print(status, json.encode(response))

   -- write a value to dataport
   local status, response = exo:write{ {alias="temp"}, 23.3}
   print(status, json.encode(response))

   -- read value that was just written, for debugging purposes
   local status, response = exo:read{ {alias="temp"}, {}}
   print(status, json.encode(response))

   -- get info for client, for debugging purposes
   local status, response = exo:info{ {alias=""}, {}}
   print(status, json.encode(response))
   ```

2. Press the \[Run\] button.

3. Find the CIK at the beginning of the log, it will be printed after "USE THIS CIK:". Copy it and **save this key** in a local document on your computer, this is an auth token to be used with the Exosite platform which you will be using at various times later in this lab.

   > If you're curious, this is a lua script that runs within your browser, calling the Exosite [RPC API](http://docs.exosite.com/rpc) through a lua library included in the first line. It first creates a new client using the "CIK Fountain", which is a tool to create a client that will get automatically deleted in 30 minutes, and then creates some resources within that client that you will interact with later in this lab.

## Request Patterns with HTTP

### Rest

REST, or Representational State Transfer, is one of the simplest structured patterns that you can use on top of CoAP. This example shows making a REST-like request to Exosite's device API.

1. Copy and Paste the Following into the request box on [https://play-dev.exosite.io/coap](https://play-dev.exosite.io/coap):

   ```json
   {
       "version": 1,
       "type": "CON",
       "code": "GET",
       "mid": 55,
       "token": [45,203],
       "opts": {
           "UriPath": [
               "ts"
           ]
       }
   }
   ```

   > Note:  Again, there are two blank lines after the text in the above example are important, make sure they are included after you paste into the `http terminal` page. And make sure to replace `<CIK>` with the CIK you generated earlier.

2. Press the \[Send\] button.


### RPC

RPC, or Remote Procedure Call, is another communication pattern that can be built on top of HTTP

1. Copy and Paste the Following into the request box on [https://play-dev.exosite.io/coap](https://play-dev.exosite.io/coap):

   ```json
   {
       "version": 1,
       "type": "CON",
       "code": "GET",
       "mid": 55,
       "token": [45,203],
       "opts": {
           "UriPath": [
               "ts"
           ]
       }
   }
   ```

   > Note:  Again, there are two blank lines after the text in the above example are important, make sure they are included after you paste into the `http terminal` page. And make sure to replace `<CIK>` with the CIK you generated earlier.

2. Press the \[Send\] button.


### Observe

CoAP *does* have an official method for pushing notifications from the server to the client. CoAP has a pattern that it calls "Observe". A CoAP client can request to 'observe' a resource. This tells the server to send a notification to the client any time that resource changes. CoAP is able to do this since it is a message-based protocol that does not depend on always being request-response only to match responses to requests. 

1. Copy and Paste the Following into the request box on [https://play-dev.exosite.io/coap](https://play-dev.exosite.io/coap):

   ```json
   {
       "version": 1,
       "type": "CON",
       "code": "GET",
       "mid": 55,
       "token": [45,203],
       "opts": {
           "UriPath": [
               "ts"
           ]
       }
   }
   ```

2. Press the \[Send\] button.

