FROM node:14.15.5-slim AS IonicBuild
RUN node --version
WORKDIR /app
COPY ./ /app/
RUN rm -rf node_modules
RUN rm package-lock.json
RUN npm install

FROM openjdk:8-alpine3.9 AS Build
ENV ANDROID_SDK_ROOT /usr/lib/android-sdk
RUN apk add --no-cache wget unzip; \
    rm -rf /var/cache/apk/*
RUN wget --quiet https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip -O /tmp/tools.zip \
    mkdir -p ${ANDROID_SDK_ROOT}; \
    unzip -q /tmp/tools.zip -d ${ANDROID_SDK_ROOT}; \
    rm -v /tmp/tools.zip; \
    mkdir -p /root/.android/; \
    touch /root/.android/repositories.cfg; \
    yes | ${ANDROID_SDK_ROOT}/tools/bin/sdkmanager "cmdline-tools;latest" >/dev/null

FROM openjdk:8-slim AS build_android
ARG android_api=30
ARG android_build_tools=30.0.3
ENV ANDROID_SDK_ROOT /usr/lib/android-sdk
ENV PATH $PATH:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin
RUN apt-get update; \
	apt-get install -y --no-install-recommends \
		git \
		git-lfs \
		openssl
COPY --from=BUILD ${ANDROID_SDK_ROOT} ${ANDROID_SDK_ROOT}
RUN yes | sdkmanager --licenses >/dev/null; \
    sdkmanager \
        "build-tools;${android_build_tools}" \
        "platforms;android-${android_api}"; \
    sdkmanager --list | sed -e '/^$/q'; \
    java -version

WORKDIR /app

RUN apt-get install -y \
    npm 

RUN npm install -g @ionic/cli@6.18.1
COPY --from=IonicBuild /app /app
RUN ionic capacitor build android --prod --release
RUN ionic capacitor copy android && cd android && ./gradlew assembleDebug && cd ..
RUN mv ./android/app/build/outputs/apk/debug/app-debug.apk gallery.apk
#Specify path to apksigner to sign app
#RUN /usr/lib/android-sdk/build-tools/30.0.2/apksigner sign --ks {name}.keystore gallery.apk

FROM scratch AS export-stage
COPY --from=build_android /app/gallery.apk /
