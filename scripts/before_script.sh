#!/bin/sh
set -e
set -x

test -f Parse-Dashboard/public/bundles/dashboard.bundle.js
test -f Parse-Dashboard/public/bundles/login.bundle.js
test -f Parse-Dashboard/public/bundles/sprites.svgs
test -d Parse-Dashboard/public/bundles/img
