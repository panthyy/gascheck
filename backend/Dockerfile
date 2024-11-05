FROM oven/bun:1.1 AS builder

WORKDIR /app

COPY package.json ./
RUN bun install --production

COPY . .

FROM oven/bun:1.1

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["bun", "start"]
