#!/bin/sh
set -e
set -x

test -f Gemforce-Dashboard/public/bundles/dashboard.bundle.js
test -f Gemforce-Dashboard/public/bundles/login.bundle.js
test -f Gemforce-Dashboard/public/bundles/sprites.svg
test -d Gemforce-Dashboard/public/bundles/img
