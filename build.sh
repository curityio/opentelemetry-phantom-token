#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Build the API gateway Docker image
#
cd apigateway
docker build -t custom_kong:3.9-ubuntu .
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the Kong docker image'
  exit 1
fi
cd ..

#
# Build the API and its Docker image
#
./demoapi/build.sh
if [ $? -ne 0 ]; then
  echo 'Problem encountered building the API'
  exit 1
fi
