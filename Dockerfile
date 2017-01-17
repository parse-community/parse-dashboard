FROM node:4.4.2
RUN npm install -g parse-dashboard
ENTRYPOINT ["parse-dashboard"]
