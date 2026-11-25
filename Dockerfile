# TestingPro is a LOCAL DEMONSTRATION API, not a production service.
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src/ ./src/
RUN chown -R node:node /app
USER node
ENV NODE_ENV=demo
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "src/server.js"]
