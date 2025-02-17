#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

npm install
if [ $? -ne 0 ]; then
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  exit 1
fi

docker build -t demoapi:latest .
if [ $? -ne 0 ]; then
  exit 1
fi