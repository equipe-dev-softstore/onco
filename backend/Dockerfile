FROM node:22-alpine

WORKDIR /app

# Instala dependências necessárias para compilação de pacotes nativos se necessário
RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm install

COPY . .

# Gera o cliente do Prisma
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
