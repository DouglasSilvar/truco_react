# Etapa de build
FROM node:lts-alpine AS build

# Desativar notificações do NPM para otimizar o processo
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

# Configurar o diretório de trabalho
WORKDIR /app

# Copiar arquivos do package.json e instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar o restante dos arquivos da aplicação
COPY . ./

# Gerar o build da aplicação e listar o conteúdo para validação
RUN npm run build && ls -la /app/build

# Etapa de produção
FROM caddy:latest

# Configurar o diretório de trabalho no contêiner
WORKDIR /app

# Copiar o Caddyfile para o contêiner
COPY Caddyfile ./Caddyfile

# Copiar os arquivos do build gerado na etapa anterior
COPY --from=build /app/build ./dist

# Comando para executar o Caddy
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
