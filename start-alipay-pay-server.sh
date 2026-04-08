#!/bin/sh
set -eu

cd "$(dirname "$0")"
node mini-js-games-hub-main/alipay-pay-server.mjs
