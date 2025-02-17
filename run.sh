#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -f ./idsvr/license.json ]; then
  echo 'Please copy a license file for the Curity Identity Server into the idsvr folder'
  exit 1
fi

./teardown.sh
docker compose up -d