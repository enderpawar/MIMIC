FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 워크스페이스 루트 파일 복사 (의존성 해석용)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./

# @flowcap/shared + runner 복사
COPY packages/shared packages/shared
COPY packages/runner packages/runner

# 의존성 설치 (workspace 전체)
RUN pnpm install --frozen-lockfile

# shared 먼저 빌드
RUN pnpm --filter @flowcap/shared build

# runner 빌드
RUN pnpm --filter @flowcap/runner build

EXPOSE 3001

CMD ["node", "packages/runner/dist/index.js"]
