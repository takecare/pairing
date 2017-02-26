'use strict';

const fs = require('fs');
const hmacsha1 = require('hmacsha1');
const Storage = require('storage-interface');
const storage = new Storage();

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let requestBody = JSON.parse(event.body);

    let key = JSON.parse(fs.readFileSync('secrets.json', 'utf8')).webhook;
    let hash = hmacsha1(key, requestBody);

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

function extractPairerFrom(prBody) {
    let exp = /Pair[\w ]*\n+\@(\w+)/;
    let result = exp.exec(prBody);
    return result ? (result.length > 2 ? result[1] : null) : null;
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

    dynamo.putItem(record, done);
}
