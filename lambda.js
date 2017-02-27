'use strict';

const fs = require('fs');
const crypto = require('crypto');
const Storage = require('storage-interface');
const storage = new Storage();

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    if (isEventInsecure(event)) {
        callback(null, {
            statusCode: 403,
            body: JSON.stringify({ error: 'keys do not match' }),
            headers: { 'Content-Type': 'application/json' }
        });
        context.fail();
    }

    let requestBody = JSON.parse(event.body);
    let prBody = requestBody.pull_request.body;
    let author = requestBody.pull_request.user.login;
    let pairer = extractPairerFrom(prBody);

    if (pairer) {
        console.log('> inserting...');
        insert(author, pairer, requestBody, callback);
    } else {
        console.log('> no pairer found!');
        callback(null, { 
            statusCode: 205, 
            body: JSON.stringify({ message: 'no pairer found' }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

};

function isEventInsecure(event) {
    let key = JSON.parse(fs.readFileSync('secrets.json', 'utf8')).webhook;
    var hmac = crypto.createHmac('sha1', key.toString('hex'));
    let computedHash = hmac.update(event.body).digest('hex');
    let receivedHash = event.headers['X-Hub-Signature'].replace('sha1=','');
    return computedHash !== receivedHash;
}

function extractPairerFrom(prBody) {
    let exp = /Pair[\w\v\s\\r\\n]*\@(\w+)/;
    let result = exp.exec(prBody);
    return result ? (result.length > 1 ? result[1] : null) : null;
}

function insert(author, pairer, event, callback) {

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    let record = {
        TableName: 'pairs',
        Item: {
            number: event.pull_request.number,
            author: author,
            pairer: pairer,
            event: JSON.stringify(event)
        }
    };

    storage.putItem(record, done);
}
