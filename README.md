# **Image Gallery with Ionic Angular and Swiper**

## Introduction

This is a simple image gallery application that is able to show, upload and download images from a shared local server. When the missus comes home from a trip, she can upload the images through the app and everyone with the app on the local network is able to see the images instantaneously on their phone. The images in the application are handled and stored using this [ASP.NET project](https://github.com/skogly/image-server). The application is written with the [Ionic Framework](https://ionicframework.com/what-is-ionic) and can be built and run as a native mobile application.

![video](https://user-images.githubusercontent.com/32673617/145739007-06bcc4d6-a460-4aa7-bfab-4930352bc1d3.gif)

## Prerequisites

This project uses [Angular](https://angular.io/guide/setup-local) 13, together with [Node](https://www.npmjs.com/get-npm) 14.17.6, [npm](https://www.npmjs.com/get-npm) 6.14.15 and [Ionic CLI](https://ionicframework.com/docs/cli) 6.17.1. To get exact version of Node on linux, you can use [nvm](https://github.com/nvm-sh/nvm). If you want to use Docker features, install [Docker](https://docs.docker.com/engine/install/) and [Docker-Compose](https://docs.docker.com/compose/install/) as well.

## Installation

If you want the easiest way possible to serve this application, then be sure to have Docker installed. Clone this repo and specify the server url in src/environments/environment.ts. Then, perfom these commands from the project root folder:  
`docker build -f docker-run/Dockerfile -t test .`  
and afterwards  
`docker run -p 80:80 --rm test`  
You should now be able to see the application in the browser on the url http://localhost. This will of course only work if you have a running instance of [the backend](https://github.com/skogly/image-server) as well.

The next solution is to install the project as a whole. You will need to have the correct versions of Node and npm installed on your system. We can use [nvm](https://github.com/nvm-sh/nvm) for that and install Node v14.17.6 by typing  
`nvm install 14.17.6`  
You should now have nodejs v14.17.6 installed alongside npm v6.14.15.  
Clone this repo, navigate to the downloaded folder and install ionic cli with the command  
`npm install -g @ionic/cli@6.17.1`  
Then type `npm install`. Follow the instructions and prompts. When finished, you can type `ionic serve`. A browser window should open up and show you the running application on http://localhost:8100. Use `ionic serve --host IPADDRESS` to make the application reachable from other devices on the same local network.

- The code itself needs a running backend, specified in src/environments/environment.ts.

If you know how to create and sign apk for Android, there is a Dockerfile and the script 'create-apk' in package.json to help you get started.

## Gotcha's

The image service does logic to create an image and folder structure in the app. To make life easier, there is a variable in src/environments/environment.(prod).ts named 'slash', which specifies whether backward or forward slash is used in the image file names. This is determined by the OS of the [backend](https://github.com/skogly/image-server). Change accordingly.

## Features

This project implements Ionic framework, written with Angular, to create a native Android application. It uses [Swiper](https://swiperjs.com/) for swipe gestures and [SignalR](https://docs.microsoft.com/en-us/aspnet/signalr/overview/getting-started/introduction-to-signalr) for real-time notifications. [Cypress](https://www.cypress.io/) is used for end-to-end testing.
