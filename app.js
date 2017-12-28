'use strict';
// const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ACCESS_TOKEN = "EAAaHZCCTS0ZBwBAH9TQZAz0HfnBVhOzcKwdvDFvp5lycKeVqc7fDYgJZBvlmwj1TcUZCCthrypeLScnzKFQJfmU4iF8ewSTUjRCo7so04l5JVH5fXZAnIYlZAptLn3mnPjhytsoxZBV4QZAFH9c8TcduDP2Kj3ewZAy37lqOf9H7BhNgZDZD";
// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  https_request = require('https'),
  fetch = require('node-fetch'),
  schedule = require('node-schedule'),
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

//create listen user
let list_sender_psid = [];
let list_coin = ['bitcoin','ethereum','ripple','bitcoin cash','litecoin','iota','cardano','dash','nem','monero','eos','bitcoin gold','neo','stellar','qtum','ethereum classic','lisk','bitconnect','tron','verge','zcash','ardor','hshare','omisego','icon','bitshares','nxt','waves','stratis','populous','raiblocks','tether','bytecoin','dogecoin','komodo','binance coin','siacoin','augur','steem','ark','golem','pivx','salt','veritaseum','monacoin','decred','digibyte','status','vechain','zcoin','syscoin','maidsafecoin','tenx','electroneum','byteball bytes','reddcoin','basic attention token','factom','bytom','bitcoindark','digixdao','santiment network token','aeternity','0x','qash','civic','aion','power ledger','kyber network','dent','vertcoin','walton','gamecredits','substratum','gas','aelf','nav coin','dentacoin','skycoin','gnosis','cryptonex','funfair','gxshares','iconomi','monaco','bitbay','enigma','dragonchain','bancor','request network','raiden network token','ethos','nexus','adex','decentraland','einsteinium','edgeless','ripio credit network','chainlink','blocknet'];
let list_symbol = ['btc','eth','xrp','bch','ltc','miota','ada','dash','xem','xmr','eos','btg','neo','xlm','qtum','etc','lsk','bcc','trx','xvg','zec','ardr','hsr','omg','icx','bts','nxt','waves','strat','ppt','xrb','usdt','bcn','doge','kmd','bnb','sc','rep','steem','ark','gnt','pivx','salt','veri','mona','dcr','dgb','snt','vet','xzc','sys','maid','pay','etn','gbyte','rdd','bat','fct','btm','btcd','dgd','san','ae','zrx','qash','cvc','aion','powr','knc','dent','vtc','wtc','game','sub','gas','elf','nav','dcn','sky','gno','cnx','fun','gxs','icn','mco','bay','eng','drgn','bnt','req','rdn','ethos','nxs','adx','mana','emc2','edg','rcn','link','block'];

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

function handleAutoMessage() {
  console.log(list_sender_psid);
  let response;
  let data;
  let url_request = "https://api.coinmarketcap.com/v1/ticker/bitconnect/";
  let body = "";

  try {
    https_request.get(url_request, res => {
      res.setEncoding('utf8');
      res.on("data", data => {
        body += data;
      });
      if (typeof body !== "undefined" || body !== null) {
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
            for (let i = 0; i < list_sender_psid.length; i++) {
              callSendAPI(list_sender_psid[i], response);
            }
          } else {
            response = {
              "text": `Something went wrong!!!`
            }
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
  }

  setTimeout(handleAutoMessage, 330 * 1000);
}



function handleMessage(sender_psid, received_message) {
  let response;
  let data;
  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    if (list_coin.indexOf(lowerString(received_message.text)) >= 0) {
      let url_request = "https://api.coinmarketcap.com/v1/ticker/" + lowerString(received_message.text.replace(" ","-")) + "/";
      let body = "";
      https_request.get(url_request, res => {
        res.setEncoding('utf8');
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          if (body !== null || typeof body !== "undefined") {
            body = JSON.parse(body);
            let text2send = createMessageViaBody(body);
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
    } else if (lowerString(received_message.text) == 'subcribe') {
      response = {
        "text": "Subcribed bitconnect exchange!"
      };
      callSendAPI(sender_psid, response);
      //add to auto send list
      addUser(sender_psid);
      handleAutoMessage();
    } else if (lowerString(received_message.text) == 'unsubcribe') {
      response = {
        "text": "Unsubcribed!!!"
      };
      removeUser(sender_psid);
      callSendAPI(sender_psid, response);
    } else if (!isNaN(received_message.text)) {
      let url_request = "https://api.coinmarketcap.com/v1/ticker/?start=" + (received_message.text - 1) + "&limit=1";
      let body = "";
      https_request.get(url_request, res => {
        res.setEncoding('utf8');
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          if (body !== null || typeof body !== "undefined") {
            body = JSON.parse(body);
            let text2send = createMessageViaBody(body);
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
    } else if (checktop(lowerString(received_message.text)) === 0) {
      var input = received_message.text;
      let numofinput = input.split(" ")[1];
      let url_request = "https://api.coinmarketcap.com/v1/ticker/?limit=" + numofinput;
      let body = "";
      https_request.get(url_request, res => {
        res.setEncoding('utf8');
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          if (body !== null || typeof body !== "undefined") {
            body = JSON.parse(body);
            let text2send = "";
            for (let i = 0; i < body.length; i++) {
              let cryptName = body[i].name;
              let symbol = body[i].symbol;
              let cryptPrice = body[i].price_usd;
              let percent_change_1h = body[i].percent_change_1h;
              let rank = body[i].rank;
              let text2cur = `${cryptName} - ${symbol}\nPrice: ${cryptPrice}$\nChange: ${percent_change_1h}%\nRank: ${rank}`;
              text2send += text2cur + "\n======\n";
            }
            text2send += "Last updated: " + convertUnixTime(body[0].last_updated);
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
    } else if (lowerString(received_message.text) == "name") {
      let url_request = "https://api.coinmarketcap.com/v1/ticker/"
      let body = "";
      https_request.get(url_request, res => {
        res.setEncoding('utf8');
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          if (body !== null || typeof body !== "undefined") {
            body = JSON.parse(body);
            let text2send = "";
            for (let i = 0; i < body.length; i++) {
              let cryptName = body[i].name;
              let symbol = body[i].symbol;
              let rank = body[i].rank;
              let text2cur = `Rank ${rank}: ${cryptName}`;
              text2send += text2cur + "\n";
            }
            text2send += "Last updated: " + convertUnixTime(body[0].last_updated);
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
        "text": `Welcome to Bit fuel\n - Type \"subcribe\" to get BitConnect exchange every 5 minutes and \"unsubcribe\" to stop\n Type \"name\" to get name of top 100 coin\nOr try some command below:\n  + [number] - Eg: 1\n  + top [number] - Eg: top 5, top 10\n  + [name] - Eg: bitcoin, ethereum, ripple, bitconnect,...`
      }
      callSendAPI(sender_psid, response);
    }
  }
  // Send the response message

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

function addUser(userId) {
  var pos = list_sender_psid.indexOf(userId);
  if (pos < 0) {
    list_sender_psid.push(userId);
  }
}

function removeUser(userId) {
  var pos = list_sender_psid.indexOf(userId);
  if (pos >= 0) {
    list_sender_psid.splice(pos, 1);
  }
}

function checktop(input) {
  var pattern = /(top)[/\s][/\d]/g;
  var result = input.search(pattern);
  return result;
}

function lowerString(input) {
  return input.toLowerCase();
}

function convertUnixTime(input) {
  var a = new Date(input * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hours = a.getHours();
  var minutes = a.getMinutes();
  var seconds = a.getSeconds();
  var time = date + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
  return (time);
}

function createMessageViaBody(body) {
  let cryptName = body[0].name;
  let symbol = body[0].symbol;
  let cryptPrice = body[0].price_usd;
  let percent_change_1h = body[0].percent_change_1h;
  let percent_change_24h = body[0].percent_change_24h;
  let percent_change_7d = body[0].percent_change_7d;
  let rank = body[0].rank;
  let last_updated = convertUnixTime(body[0].last_updated);
  let text2send = `${cryptName} - ${symbol}\nPrice: ${cryptPrice}$\nChange 1h: ${percent_change_1h}%\nChange 24h: ${percent_change_24h}%\nRank: ${rank}\nLast updated: ${last_updated}`;
  return text2send;
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
  };
  console.log("sending");

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