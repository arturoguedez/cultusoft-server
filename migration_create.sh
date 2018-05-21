#!/bin/bash

if [ -z $1 ]; then
    echo pass in a name
    exit 1;
fi
./node_modules/.bin/typeorm migration:create -n $1
