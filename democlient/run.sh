#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

############################################################################
# Simulate a client outside the cluster that only sends a traceparent header
############################################################################

export OAUTH_BASE_URL=http://login.example.com
export API_URL=http://api.example.com

#
# When developing the API, set this to true to send requests to the local API
#
LOCAL_API='false'
RESPONSE_FILE='response.txt'

#
# Generate a traceparent header
#
function createTraceParent() {
  VERSION="00"
  TRACE_ID=$(openssl rand -hex 16)
  SPAN_ID=$(openssl rand -hex 8)
  TRACE_FLAG="01"
  echo "$VERSION-$TRACE_ID-$SPAN_ID-$TRACE_FLAG"
}

#
# Authenticate at the authorization server and get an opaque access token
#
TRACEPARENT=$(createTraceParent)
echo "Authenticating client with a traceparent header of $TRACEPARENT"
HTTP_STATUS=$(curl -s -X POST "$OAUTH_BASE_URL/oauth/v2/oauth-token" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H "traceparent: $TRACEPARENT" \
  -d 'grant_type=client_credentials' \
  -d 'client_id=demo-client' \
  -d "client_secret=Password1" \
  -d "scope=demo" \
  -o "$RESPONSE_FILE" \
  -w '%{http_code}')
if [ "$HTTP_STATUS" != '200' ]; then
  echo "Problem encountered authenticating at the authorization server : $HTTP_STATUS"
  exit 1
fi
JSON=$(tail -n 1 "$RESPONSE_FILE") 
ACCESS_TOKEN=$(jq -r .access_token <<< "$JSON")

#
# If running against a local API in development mode, introspect the opaque access token
#
if [ "$LOCAL_API" == 'true' ]; then

  TRACEPARENT=$(createTraceParent)
  echo "Introspecting access token with a traceparent header of $TRACEPARENT"

  HTTP_STATUS=$(curl -s -X POST "$OAUTH_BASE_URL/oauth/v2/oauth-introspect" \
    -u "api-gateway-client:Password1" \
    -H "Accept: application/jwt" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "traceparent: $TRACEPARENT" \
    -d "token=$ACCESS_TOKEN" \
    -o "$RESPONSE_FILE" \
    -w '%{http_code}')
  if [ "$HTTP_STATUS" != '200' ]; then
    echo "Problem encountered introspecting the opaque access token : $HTTP_STATUS"
    exit 1
  fi
  ACCESS_TOKEN=$(cat "$RESPONSE_FILE")
  API_URL="$API_URL:3000"
fi

#
# Call the API multiple times with the access token
#
for API_REQUEST in $(seq 1 10)
do
  TRACEPARENT=$(createTraceParent)
  echo "Calling API with a traceparent header of $TRACEPARENT"
  HTTP_STATUS=$(curl -s -X POST $API_URL \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "traceparent: $TRACEPARENT" \
    -o "$RESPONSE_FILE" \
    -w '%{http_code}')
  cat "$RESPONSE_FILE"
  echo
done
