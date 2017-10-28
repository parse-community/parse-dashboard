#!/bin/sh
test -f Parse-Dashboard/public/bundles/dashboard.bundle.js || exit 1
test -f Parse-Dashboard/public/bundles/login.bundle.js || exit 1
test -f Parse-Dashboard/public/bundles/sprites.svg || exit 1
test -d Parse-Dashboard/public/bundles/img || exit 1
