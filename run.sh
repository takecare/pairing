#!/bin/bash
#node-lambda run -H lambda.handler -j run/event.json -x run/context.json -f run/deploy.env
export LOCAL_MODE=true && node-lambda run -H index.handler -j run/event.json -x run/context.json -f run/deploy.env

#node-lambda run -H index.handler -j run/event.json -x run/context.json -f run/deploy.env
