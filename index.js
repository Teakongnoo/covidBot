'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');
const request = require('request');
// const bodyParser = require('body-parser');
const apiUrl = 'https://covid19.th-stat.com/api/open/today';
// create LINE SDK client
const client = new line.Client(config);

const app = express();
// app.use(bodyParser.json());
// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(req.body.events.map(event => {
    console.log('event', event);
    // check verify webhook event
    if (event.replyToken === '00000000000000000000000000000000' ||
      event.replyToken === 'ffffffffffffffffffffffffffffffff') {
      return;
    }
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
const replyText = (token, texts) => {
  var dataCovid = [];
  texts = Array.isArray(texts) ? texts : [texts];
  if (texts[0] === 'COVID-19 TO DAY') {
    // run().then(console.log('444'));
    // console.log();
    (async () => {
      dataCovid = await getCovidAPI();
      try { JSON.stringify(dataCovid);} catch (error) {console.log('Is Json');}
      var today = JSON.stringify(dataCovid);
      var JsonToday = JSON.parse(today)
      console.log(JsonToday['Confirmed']);
      var covidReport = {
        type: 'text',
        text: 'จำนวนผู้ป่วยปัจจุบัน : ' + JsonToday['Confirmed'] + '\nเพิ่มขึ้น : ' + JsonToday['NewConfirmed'] + '\nรักษาตัวในโรงพยาบาล : ' + JsonToday['Hospitalized'] + '\nเสียชีวิต : ' + JsonToday['Deaths'] + '\nข้อมูล ณ เวลา : ' + JsonToday['UpdateDate'],
      }
      client.replyMessage(
        token,covidReport
        // { type: 'text', text: today }
        // texts.map((text) => ({ type: 'text', text }))
      );
    })();
  }
  // return client.replyMessage(
  //  token,
  //  { type: 'text', text: 'dd' }
    // texts.map((text) => ({ type: 'text', text }))
 //  );
};

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }
    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken) {
  return replyText(replyToken, message.text);
}

const port = config.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

function getCovidAPI() {
  var promised = new Promise((resolve) => {
    request(
      apiUrl,
      { json: true },
      (err, res, body) => {
        if (err) { resolve('resolve err'); }
        if (res) { console.log('getOK'); }
        if (body) resolve(body);
        ;
      });
  });
  return promised;
}
async function run() {
  try {
    var data = await getCovidAPI();
  } catch (error) {
    console.error(error);
  }
  return data;
}

function recData(data, token) {
  const message = {
    type: 'text',
    text: data,
  };
  return client.replyMessage(
    token,
    message
  );
}
