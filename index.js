"use strict"
const request = require('request');
const crypto = require('crypto');

const requestTokenRequestUrl = 'https://api.twitter.com/oauth/request_token';
const callbackUrl = '';
const consumer_key = YOUR_APP_CONSUMER_KEY;
const consumer_secret = YOUR_APP_CONSUMER_SECRET;
const keyOfSign = encodeURIComponent(consumer_secret) + "&";

let params = {
    oauth_callback: callbackUrl,
    oauth_consumer_key: consumer_key,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: (() => {
        const date = new Date();
        return Math.floor(date.getTime() / 1000);
    })(),
    oauth_nonce: (() => {
        const date = new Date();
        return date.getTime();
    })(),
    oauth_version: '1.0'
};

Object.keys(params).forEach(item => {
    params[item] = encodeURIComponent(params[item]);
});

let requestParams = Object.keys(params).map(item => {
    return item + '=' + params[item];
});

requestParams.sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
});

requestParams = encodeURIComponent(requestParams.join('&'));

const dataOfSign = (() => {
    return encodeURIComponent('POST') + '&' + encodeURIComponent(requestTokenRequestUrl) + '&' + requestParams;
})();

const signature = (() => {
    return crypto.createHmac('sha1', keyOfSign).update(dataOfSign).digest('base64');
})();

params['oauth_signature'] = encodeURIComponent(signature);

let headerParams = Object.keys(params).map(item => {
    return item + '=' + params[item];
});

headerParams = headerParams.join(',');

const headers = {
    'Authorization': 'OAuth ' + headerParams
};

const options = {
    url: requestTokenRequestUrl,
    headers: headers
};

exports.handler = (event, context, callback) => {
    request.post(options, function(error, response, body) {
        if (error) {
            context.fail(error);
        } else {
            var token = body.match(/[0-9a-zA-Z¥_]+&/)[0].replace(/&/g, "");
            var url = "https://api.twitter.com/oauth/authenticate?oauth_token=" + token;
            context.succeed(url);
        }
    });
};
