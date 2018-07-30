#!/bin/bash

if [[ ! $b4a_certs_path ]]; then echo 'Set b4a_certs_path environment variable, please!' && exit; fi

host=52.0.232.94
user=ubuntu
pem=Back4App_Production.pem
now=`date '+%Y%m%d%H%M%S'`

branch=master
git='~/bin/git-parse-dashboard'

ssh -t -i $b4a_certs_path/$pem $user@$host "sudo su back4app -c 'cp -r ~/scm/parse-dashboard ~/scm/parse-dashboard-$now && . ~/.nvm/nvm.sh && nvm use 9 && cd ~/scm/parse-dashboard && $git reset --hard && $git remote update && $git checkout $branch && $git merge origin/$branch && yarn install --production=false '"
ssh -t -i $b4a_certs_path/$pem $user@$host "sudo su back4app -c 'cd ~/scm/parse-dashboard-$now && sed -i \"s/http:\/\/localhost:4000\/parseapi/https:\/\/dashboard.back4app.com\/parseapi/\" node_modules/parse/lib/browser/settings.js && npm run prepublish && npm run build'"

curl -X DELETE "https://api.cloudflare.com/client/v4/zones/69ace06909c83213745231d2c6d0fd27/purge_cache" -H "X-Auth-Email: $CF_EMAIL" -H "X-Auth-Key: $CF_KEY" -H "Content-Type: application/json" --data '{"files":[
  "https://parse-dashboard.back4app.com/bundles/dashboard.bundle.js",
  "https://parse-dashboard.back4app.com/bundles/PIG.bundle.js",
  "https://parse-dashboard.back4app.com/bundles/login.bundle.js",
  "https://parse-dashboard.back4app.com/bundles/quickstart.bundle.js",
  "https://parse-dashboard.back4app.com/bundles/sprites.svg"
  ]}'
#ssh -t aws_B4ANFS_Homolog "sudo su back4app -c '. ~/.nvm/nvm.sh && nvm use 9 && cd ~/scm/back4app-site && yarn install && npm run build && pm2 reload site'"
