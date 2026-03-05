FROM node:20-slim

# Playwright 의존성
RUN apt-get update && apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 설치
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Playwright 브라우저 설치
RUN npx playwright install chromium

COPY . .

RUN pnpm build

EXPOSE 3001

CMD ["node", "dist/index.js"]
