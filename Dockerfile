# Use uma imagem oficial do Node.js como base
FROM node:16-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos necessários para o container
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todos os arquivos do projeto para o container
COPY . .

# Compila o projeto para produção
RUN npm run build

# Usa uma imagem Nginx para servir o build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

# Exponha a porta padrão do Nginx
EXPOSE 80

# Comando para iniciar o servidor
CMD ["nginx", "-g", "daemon off;"]
