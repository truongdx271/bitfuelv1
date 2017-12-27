'use strict';
// const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ACCESS_TOKEN = "EAAaHZCCTS0ZBwBAIF67rv2Pq4rZBWDTeI6RajrjZCuLND3tKyiNvXrApbuDOiiDP4WZAM8tqfP54JrjjRl7EXjFHDo56kZBHzpB1XBrFMW6QxjgLn8zzbYcaU3me44pXhBSWzyi13utQUZCAZAgLdw0nQdyK2cqHZCSYvr4DtVN5mwgZDZD";
// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  https_request = require('https'),
  fetch = require('node-fetch'),
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    body.entry.forEach(function (entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {

        handlePostback(sender_psid, webhook_event.postback);
      }

    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

//test here

app.get('/', (req, res) => {
  let coin = "bitcoin";
  // let testdata = {};
  // let testdata = getMarketDataAPI(coin);
  // console.log(testdata)
  // let testdata = fetchDataAPI(coin);
  // console.log(testdata);
  res.json({
    message: 'Welcome to the api'
  });
})

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "abc@123";

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {

    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

function handleMessage(sender_psid, received_message) {
  let response;
  let data;
  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    if (received_message.text == "bitconnect" || received_message.text == "bitcoin" || received_message.text == "ethereum" || received_message.text == "ripple" || received_message.text == "bitcoin-cash") {

      let url_request = "https://api.coinmarketcap.com/v1/ticker/" + received_message.text + "/";
      let body = "";
      https_request.get(url_request, res => {
        res.setEncoding('utf8');
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          body = JSON.parse(body);
          if (body !== null || typeof body !== "undefined") {
            let cryptName = body[0].name;
            let cryptPrice = body[0].price_usd;
            let percent_change_1h = body[0].percent_change_1h;
            let text2send = `${cryptName}\nPrice: ${cryptPrice}\nChange: ${percent_change_1h}%`;
            response = {
              "text": text2send
            }
            console.log(response);
            callSendAPI(sender_psid, response);
          } else {
            response = {
              "text": `Something went wrong!!!`
            }
          }
        });
      });
    } else {
      response = {
        "text": `Try some valid name!`
      }
    }
  }
  // Send the response message
  callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
  let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = {
      "text": "Thanks!"
    }
  } else if (payload === 'no') {
    response = {
      "text": "Oops, try sending another image."
    }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}
/*
function getMarketDataAPI(cName) {
  let url_request = "https://api.coinmarketcap.com/v1/ticker/"
  if (cName !== null || cName !== "undefined") {
    url_request += cName
  }
  request(url_request, (error, response, body) => {
    // console.log('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    // console.log('body:', body);
    if (error) {
      console.log('error:', error);
    } else {
      if (response.statusCode === 200) {
        let json = JSON.parse(body);
        return json;
      }
    }
  })

}*/
// function getMarketDataAPI(cName) {
//   let url_request = "https://api.coinmarketcap.com/v1/ticker/";
//   let body = "";
//   if (cName !== null || cName !== "undefined") {
//     url_request += cName;
//     url_request += "/";
//   }
//   https_request.get(url_request, res => {
//     res.setEncoding('utf8');
//     res.on("data", data => {
//       body += data;
//     });
//     res.on("end", () => {
//       body = JSON.parse(body);
//     });
//   });
//   return body;
// }

function fetchDataAPI(cName) {
  let url_request = "https://api.coinmarketcap.com/v1/ticker/";
  if (cName !== null || cName !== "undefined") {
    url_request += cName;
    url_request += "/";
  }
  fetch(url_request).then(function (response) {
    if (response.ok) {
      return response;
    }
    throw Error(response.statusText);
  }).then(function (response) {
    return response.json();
  }).then(function (json) {
    console.log('Success');
    return json;
  }).catch(function (error) {
    console.log('Request failed:', error.message);
  });
}


function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": {
      "access_token": PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}