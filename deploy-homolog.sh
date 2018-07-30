#!/bin/bash

if [[ ! $b4a_certs_path ]]; then echo 'Set b4a_certs_path environment variable, please!' && exit; fi

host=34.192.186.60
user=ubuntu
pem=AppContainers.pem

branch=$(git symbolic-ref --short HEAD)
git='~/bin/git-parse-dashboard'

ssh -t -i $b4a_certs_path/$pem $user@$host "sudo su back4app -c '. ~/.nvm/nvm.sh && nvm use 9 && cd ~/scm/parse-dashboard && $git reset --hard && $git remote update && $git checkout $branch && $git merge origin/$branch && npm install'"
ssh -t -i $b4a_certs_path/$pem $user@$host "sudo su back4app -c 'cd ~/scm/parse-dashboard && sed -i \"s/http:\/\/localhost:4000\/parseapi/https:\/\/dashboard-homolog.back4app.com\/parseapi/\" node_modules/parse/lib/browser/settings.js && npm run prepublish && npm run build'"

#ssh -t aws_B4ANFS_Homolog "sudo su back4app -c '. ~/.nvm/nvm.sh && nvm use 9 && cd ~/scm/back4app-site && yarn install && npm run build && pm2 reload site'"
