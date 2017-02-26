'use strict';

console.log('Loading function');

const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    switch (event.httpMethod) {
        case 'DELETE':
            dynamo.deleteItem(JSON.parse(event.body), done);
            break;
        case 'GET':
            //dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
            console.log('GETting...');
            dynamo.scan({ TableName: "pairing" }, done);
            break;
        case 'POST':
            console.log('POSTing...');
            dynamo.putItem(JSON.parse(event.body), done);
            
            dynamo.putItem({
                    "TableName": "pairing",
                    "Item" : {
                        "username": "usernameX",
                        "pairer": "pairerY"
                    }
                }, function(err, data) {
                    if (err) {
                        context.done('error','putting item into dynamodb failed: '+err);
                    }
                    else {
                        console.log('great success: '+JSON.stringify(data, null, '  '));
                    }
                });

            break;
        case 'PUT':
            dynamo.updateItem(JSON.parse(event.body), done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
