const server = require('http');
const url = require('url');
const fs = require('fs');
const fetch = require('cross-fetch');

let cryptocurrenciesList = '';
getFetch('//api.coincap.io/v2/rates').then(data => {
  data.data.forEach(element => {
    cryptocurrenciesList += `<a class="link" href="/rates?currency=${element.id}">${element.id}   </a>`;
  });
});

server
  .createServer(function (req, res) {
    if (req.url === '/') {
      fs.readFile('index.html', 'utf8', function (err, data) {
        if (err) new Error();
        data = data.replace('{message}', cryptocurrenciesList);
        res.end(data);
      });
    } else if (getPathName(req) && getParameter(req)) {
      getFetch(
        `//api.coincap.io/v2/rates/${url.parse(req.url, true).query.currency}`
      ).then(rate => {
        fs.readFile('result.html', 'utf8', function (err, data) {
          if (err) new Error();
          try {
            data = data.replace(
              '{result}',
              JSON.stringify({usd: rate.data.rateUsd})
            );
            res.end(data);
          } catch (error) {
            getErrorPage(res, '400', 'Bad request');
          }
        });
      });
    } else {
      getErrorPage(res, '404', 'Page not found');
    }
  })
  .listen(3000, 'localhost');

function getPathName (request) {
  return url.parse(request.url, true).pathname === '/rates';
}

function getParameter (request) {
  let value = [];
  for (let key in url.parse(request.url, true).query) {
    value.push(key);
  }
  return value.length === 1 && value[0] === 'currency';
}

function getErrorPage (response, statusCode, statusText) {
  fs.readFile('error.html', 'utf8', function (err, data) {
    if (err) new Error();
    data = data.replace('{code}', statusCode).replace('{text}', statusText);
    response.end(data);
  });
}

function getFetch (url) {
  return fetch(url).then(response => {
    return response.json();
  });
}
