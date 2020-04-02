// const express = require('express');
// const config = require('./config.json');
const request = require('request');
const apiUrl = 'https://covid19.th-stat.com/api/open/today';
// const { data } = [];
function getCovidAPI() {
  var promised = new Promise((resolve) => {
    request(
      apiUrl,
      { json: true },
      (err, res, body) => {
        if (err) { resolve('resolve err'); }
        if (res) { console.log('getOK'); }
        resolve(body);
        ;
      });
  });
  return promised;
}

async function run() {
  try {
    var data = await getCovidAPI();
    // console.log('Data :', data);
    recData(data);
  } catch (error) {
    console.error(error);
  }
}

function recData(data) {
  const message = {
    type: 'text',
    text: data,
  };
  return message;
}
run();
console.log();
// setTimeout( console.log('Hello : ', covid), 5000)
// console.log('Hello : ', covid);
