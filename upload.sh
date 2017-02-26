#!/bin/bash
zip -r lambda.zip . -x ".*" -x "*/.*" -x "*.sample" -x "upload.sh" -x "run.sh" -x "run/*"
aws lambda update-function-code --function-name github-webhooks-playground --zip-file fileb://lambda.zip
