# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copia apenas os arquivos necessários para instalar dependências
COPY package*.json ./

# Instala dependências com cache otimizado
RUN npm install --frozen-lockfile

# Copia o restante dos arquivos
COPY . .

# Gera o build de produção
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove arquivos desnecessários para reduzir o tamanho da imagem final
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos do build para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Adiciona configuração customizada para suportar rotas SPA e corrigir erros de diretório
RUN echo 'server {\n\n  listen 80;\n\n  location / {\n    root /usr/share/nginx/html;\n    index index.html;\n    try_files $uri $uri/ /index.html;\n  }\n\n  error_page 404 /index.html;\n\n}' > /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]