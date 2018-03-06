#!/bin/bash

if [[ ! $b4a_certs_path ]]; then echo 'Set b4a_certs_path environment variable, please!' && exit; fi

host=52.0.232.94
user=ubuntu
pem=Back4App_Production.pem

branch=master
git='~/bin/git-parse-dashboard'
ssh -t -i $b4a_certs_path/$pem $user@$host "sudo su back4app -c '. ~/.nvm/nvm.sh && nvm use 9 && cd ~/scm/parse-dashboard && $git reset --hard && $git remote update && $git checkout $branch && $git merge origin/$branch && yarn install --production=false && npm run prepublish && npm run build'"
#ssh -t aws_B4ANFS_Homolog "sudo su back4app -c '. ~/.nvm/nvm.sh && nvm use 9 && cd ~/scm/back4app-site && yarn install && npm run build && pm2 reload site'"
