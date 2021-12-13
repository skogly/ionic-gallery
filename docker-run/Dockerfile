FROM node:14.15.5-slim as build

WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/

RUN npm ci

COPY . /app

RUN npm install -g @ionic/cli@6.18.1
RUN npm install -g @angular/cli@13.0.3

RUN ng build

FROM nginx:1.14.1-alpine

COPY --from=build /app/www/ /usr/share/nginx/html/

EXPOSE 80