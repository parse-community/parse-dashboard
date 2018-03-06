#!/bin/bash

if [[ ! $b4a_certs_path ]]; then echo 'Set b4a_certs_path environment variable, please!' && exit; fi

host=52.0.232.94
user=ubuntu
pem=Back4App_Production.pem

branch=master
git='~/bin/git-parse-dashboard'
ssh -t -i $b4a_certs_path/$pem $user@$host "sudo su back4app -c '. ~/.nvm/nvm.sh && nvm use 9 && cd ~/scm/parse-dashboard && $git reset --hard && $git remote update && $git checkout $branch && $git merge origin/$branch && yarn install --production=false && npm run prepublish && npm run build'"
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/69ace06909c83213745231d2c6d0fd27/purge_cache" -H "X-Auth-Email: admin@back4app.com" -H "X-Auth-Key: aa41038d78651ae07e2f49507fee32eac1e4c" -H "Content-Type: application/json" --data '{"files":[
  "https://parse-dashboard.back4app.com/bundles/dashboard.bundle.js",
  "https://parse-dashboard.back4app.com/bundles/PIG.bundle.js",
  "https://parse-dashboard.back4app.com/bundles/login.bundle.js",
  "https://parse-dashboard.back4app.com/bundles/quickstart.bundle.js",
  "https://parse-dashboard.back4app.com/bundles/sprites.svg"
  ]}'
#ssh -t aws_B4ANFS_Homolog "sudo su back4app -c '. ~/.nvm/nvm.sh && nvm use 9 && cd ~/scm/back4app-site && yarn install && npm run build && pm2 reload site'"
