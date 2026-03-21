FROM oven/bun:latest AS builder

WORKDIR /build
# 只复制 package.json，安装依赖
COPY web/package.json .
RUN bun install
# 复制其他前端文件
COPY ./web .
COPY ./VERSION .
RUN NODE_OPTIONS="--max-old-space-size=4096" DISABLE_ESLINT_PLUGIN='true' BROWSERSLIST_IGNORE_OLD_DATA=true VITE_REACT_APP_VERSION=$(cat VERSION) bun run build

FROM golang:alpine AS builder2
ENV GO111MODULE=on CGO_ENABLED=0

ARG TARGETOS
ARG TARGETARCH
ENV GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64}
ENV GOEXPERIMENT=greenteagc

WORKDIR /build

ADD go.mod go.sum ./
RUN go mod download

COPY . .
# 确保VERSION文件被正确复制
COPY VERSION .
COPY --from=builder /build/dist ./web/dist
# 添加调试信息
RUN ls -la && cat VERSION
# 显示Go版本和环境信息
RUN go version && go env
# 构建应用
RUN go build -v -ldflags "-s -w -X \"github.com/QuantumNous/new-api/common.Version=1.0.0\"" -o new-api

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata libasan8 wget \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

COPY --from=builder2 /build/new-api /
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/new-api"]
