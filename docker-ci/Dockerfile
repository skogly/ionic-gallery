FROM node:14

ARG CHROME_VERSION="google-chrome-stable"
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qqy \
  && apt-get -qqy install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb \
  && apt-get -qqy install \
    ${CHROME_VERSION:-google-chrome-stable} \
  && wget https://chromedriver.storage.googleapis.com/95.0.4638.10/chromedriver_linux64.zip \
  && unzip chromedriver_linux64.zip \
  && mv chromedriver /usr/local/bin/chromedriver \
  && rm /etc/apt/sources.list.d/google-chrome.list \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*
RUN npm cache verify
RUN npm install -g @ionic/cli

RUN chmod +x /usr/local/bin/chromedriver

ENV CHROME_BIN /usr/bin/google-chrome
ENV DISPLAY :99