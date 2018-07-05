#Stage 0, node build angular project
FROM node:8.9-alpine as node
MAINTAINER nick@7mbtech.com

#Linux setup
RUN apk update \
  && apk add --update alpine-sdk \
  && apk del alpine-sdk \
  && rm -rf /tmp/* /var/cache/apk/* *.tar.gz ~/.npm \
  && npm cache verify \
  && sed -i -e "s/bin\/ash/bin\/sh/" /etc/passwd

#Angular CLI
RUN npm install -g @angular/cli@1.6.3

#Create the app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

#Copy the source code
COPY . /usr/src/app

#Build the application
ARG target=production
ARG env=prod
RUN ng build --target=$target --env=$env

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:latest
COPY --from=node /usr/src/app/dist/ /usr/share/nginx/html
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf
