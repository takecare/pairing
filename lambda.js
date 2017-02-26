'use strict';

const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // TODO transform from webhook into event
    let prBody = event.pull_request.body;
    let author = 
    let pairer = extractPairedWithFrom(prBody);

    //if 

    handleEvent(event);    
};

function extractPairedWithFrom(prBody) {
    let exp = /Pair[\w ]*\n+\@(\w+)/;
    let result = exp.exec(prBody);
    return result.length > 2 ? result[1] : null;
}

function done(err, res, callback) {
    callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function handleEvent(event) {
    switch (event.httpMethod) {
        case 'DELETE':
            dynamo.deleteItem(JSON.parse(event.body), done);
            break;
        case 'GET':
            dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
            break;
        case 'POST':
            dynamo.putItem(JSON.parse(event.body), done);
            break;
        case 'PUT':
            dynamo.updateItem(JSON.parse(event.body), done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
}
