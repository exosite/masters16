---
layout: page
title: "Lab 1 - HTTP"
category: lab
date: 2016-06-25 12:00:00
order: 1
---

# Lab 1 - HTTP

This is the HTTP lab. In this lab you will learn to understand the basics of HTTP, the Hypertext Transport Protocol, at a high level for the purposes of debugging IoT devices during development.

## Part 1 - Understanding the basics of HTTP

### A Basic Request

1. Copy and Paste the Following into the request box on [https://play-dev.exosite.io/http](https://play-dev.exosite.io/http):

   ```http
   GET /timestamp HTTP/1.1
   Host: m2.exosite.com

   ​
   ```

    > Note: There are two blank lines after the text in the above example are important, make sure they are included after you paste into the `http terminal` page.

2. Press the \[Send\] button.

    > What happened? Do you think it worked?

3. Change the word `GET` to `POST` and press \[Send\] again.

    > You'll see that the response changed. Compare the two different responses, one indicates an error and one indicates a success. Can you tell which is which?
    >
    > Look at the first line in the response, this is the status line, the number after `HTTP/1.1` is the status code (either an error code or some form of success code), which is then followed by the reason phrase. You'll see that the success response has a status code of "200" and a reason phrase of "OK". These two tell you the same information in *most* cases, but both are still required.

### Understanding Headers

1. Send the original request again, copy and paste the following into [https://play-dev.exosite.io/http](https://play-dev.exosite.io/http) :

   ```http
   GET /timestamp HTTP/1.1
   Host: m2.exosite.com

   ​
   ```

2. Press the \[Send\] button.

3. Compare the response of that request to the response of the following request:

   ```http
   GET /timestamp HTTP/1.1
   Host: m2.exosite.com
   Not-A-Real-Header: kill-all-humans

   ​
   ```

   > Do you notice a difference?
   >
   > There should be no difference (other than the timestamp itself and the date shown in line 2). The difference between the first and second requests was the addition of a new header, the "Not-A-Real-Header" header. There was no change in how the server responded because the server doesn't know of any header called "Not-A-Real-Header" so it is allowed to ignore it.

### Understanding Methods

1. Send the original request again, copy and paste the Following into [https://play-dev.exosite.io/http](https://play-dev.exosite.io/http) :

   ```http
   GET /timestamp HTTP/1.1
   Host: m2.exosite.com

   ​
   ```

2. Press the \[Send\] button.

3. Compare the response of that request to the response of the following request:

   ```http
   POST /timestamp HTTP/1.1
   Host: m2.exosite.com

   ​
   ```

   > Do you notice a difference?
   >
   > The second request causes an error to be returned. In this case it's a `406 Method Not Allowed` because we changed the method from `GET` to `POST` and the timestamp url does not support having data `POST`ed to it. The method, sometimes also called the "verb", states what kind of request is being sent. The most common are `GET` and `POST`, but there's also `PUT`, `DELETE`, `OPTIONS`, `HEAD`, and more. Some of these will be further explained later in the lab.

### Understanding Message Bodies

1. Send the original request again, copy and paste the Following into [https://play-dev.exosite.io/http](https://play-dev.exosite.io/http) :

   ```http
   GET /timestamp HTTP/1.1
   Host: m2.exosite.com

   ​
   ```

2. Press the \[Send\] button.

3. Compare that **request** to the following request (the response is not interesting in this case):

   ```http
   POST /api:v1/rpc/process HTTP/1.1
   Host: m2.exosite.com
   Content-Length: 2

   {}
   ```

   > What differences do you see?
   >
   > Until now you've had to make sure that all your requests end with two blank lines, however this request ends with no blank lines. Ending with two blank lines is a special case of an HTTP message where the message contains no body, the two blank lines actually indicate the division between the end of the headers and the beginning of the body. Because HTTP runs over TPC, a stream protocol, it's important to know where one request ends and another begin. This is the purpose of the `Content-Length` header, it tells the receiver of the message how many octets (8-bit btyes) of body it should expect to receive.

## An Aside

You don't need to fully understand what is happening in this section it's only used to generate a token that you will use later in this lab.

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

   > Note: This will lock-up your browser tab for a few seconds while it does it's work.

3. Find the CIK at the beginning of the log, it will be printed after "USE THIS CIK:". Copy it and **save this key** in a document on your computer, this is an auth token to be used with the Exosite platform which you will be using at various times later in this lab.

   > If you're curious, this is a lua script that runs within your browser, calling the Exosite [RPC API](http://docs.exosite.com/rpc) through a lua library included in the first line. It first creates a new client using the "CIK Fountain", which is a tool to create a client that will get automatically deleted in 30 minutes, and then creates some resources within that client that you will interact with later in this lab.

## Request Patterns with HTTP

### REST

REST, Representational State Transfer, is the most common form of communication pattern that is being built on top of HTTP currently. The following performs a rest-like request to the Exosite platform.

1. Copy and Paste the Following into the request box on [https://play-dev.exosite.io/http](https://play-dev.exosite.io/http):

   ```http
   GET /onep:v1/stack/alias?temp HTTP/1.1
   Host: m2.exosite.com
   X-Exosite-CIK: <CIK>
   Accept: application/x-www-form-urlencoded; charset=utf-8

   ​
   ```

   > Note:  Again, there are two blank lines after the text in the above example are important, make sure they are included after you paste into the `http terminal` page. Also, you'll need to replace the text `<CIK>` with the CIK (auth token) you generate in the previous section.

2. Press the \[Send\] button.

   > You should have received a response that indicated that the 'temp' dataport had a value of '23.3'.

3. TAKE IT FURTHER: The request you just made was a 'read' request the the Exosite device API, you can find the documentation for that call here, [http://docs.exosite.com/http/#read](http://docs.exosite.com/http/#read). Now, try and take what you've learned to make a write request, see the documentation for that call here, [http://docs.exosite.com/http/#write](http://docs.exosite.com/http/#write)


### RPC

RPC, or Remote Procedure Call, is another communication pattern that can be built on top of HTTP. The following 

1. Copy and Paste the Following into the request box on [https://play-dev.exosite.io/http](https://play-dev.exosite.io/http):

   ```http
   POST /api:v1/rpc/process HTTP/1.1
   Host: m2.exosite.com
   Content-Length: 2

   {}
   ```

2. Press the \[Send\] button.

3. Compare the response of that request to the response of the following request:

   ```http
   POST /api:v1/rpc/process HTTP/1.1
   Host: m2.exosite.com
   Content-Length: 128

   {
      "auth": "<CIK>",
      "calls": [{
          "method": "not-a-real-method",
          "arguments": {}
          "id": 56
      }]
   }
    ```

    > You'll see that even though we tried to use a method that does not exist, `not-a-real-method`, we got an HTTP response code of 200 indicating success. This is because RPC does not use the HTTP status code to indicate the success or failure of the calls themselvce, but only if indicate if the server was able to process the format of the request. Errors within each call are returned via the 'status' and 'error' members of the call response.

5. RPC has the benefit of being able to carry more than one 'call' in a single request. For example we can fetch the full info about a dataport in the same call the we read from it:

   ```http
   POST /api:v1/rpc/process HTTP/1.1
   Host: m2.exosite.com
   Content-Length: 2

   {
     "auth": "<CIK>",
     "calls": [{
         "method": "read",
         "arguments": {
             {"alias": "temp"},
             {}
         },
         "id": 56
     },{
         "method": "info",
         "arguments": {
             {"alias": "temp"},
             {}
         },
         "id": "something-else"
     }]

   }
   ```

### Long-Polling

HTTP doesn't allow for sending push notifications directly from a server to clients, HTTP long-polling is a method to effectively emulate the behavior of modern push notification systems, but it does so in a manner that is not as obvious or efficient as the systems that were designed for the purpose.

1. Copy and Paste the Following into the request box on [https://play-dev.exosite.io/http](https://play-dev.exosite.io/http):

   ```http
   GET /onep:v1/stack/alias?temp HTTP/1.1
   Host: m2.exosite.com
   X-Exosite-CIK: <CIK>
   Accept: application/x-www-form-urlencoded; charset=utf-8
   Request-Timeout: 10000

   ​
   ```

   > Note:  Again, there are two blank lines after the text in the above example are important, make sure they are included after you paste into the `http terminal` page.

2. Press the \[Send\] button.

   > The request should have taken about 10 seconds to return, at which point you should have gotten an HTTP 304 Not Modified. This response means that the server understood your request but the resource you were requesting didn't change during the 'Request-Timeout' period, in this case 10 seconds.
   >
   > Long polling is not an official part of the HTTP protocol, but is instead something of a hack that was devised after the fact. It doesn't violate any part of the HTTP specification, but there is the possibility that you'll run into problems using HTTP libraries that weren't designed with its use in mind, especially in regards to enforced timeouts or blocking of threads.

3. TAKE IT FURTHER: Using only what this lab has taught you about long polling will cause fairly severe problems in any real-world application. Before reading on, try to figure out what the one fundamental problem this request pattern creates.

4. The problem comes from the fact that you don't constantly have an open request to the server open and reestablishing the long-polling request takes a non-zero amount of time. This means that if the resource changes during the time that your device does not have an active long-poling request you will miss that datapoint. The device API handles this with the addition of another header, read the documentation for long-polling requests and see if you can figure out how to work around this. You 