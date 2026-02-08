# Estágio 1: Build da Aplicação React
FROM node:18-alpine as build

WORKDIR /app

# Copia dependências primeiro para aproveitar cache
COPY package*.json ./
RUN npm install

# Copia o código fonte
COPY . .

# Argumento de build para a URL da API (Injetado pelo Easypanel)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Gera a pasta 'dist' otimizada
RUN npm run build

# Estágio 2: Servidor Nginx para servir os estáticos
FROM nginx:alpine

# Copia os arquivos gerados no estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx para SPA (Single Page Application)
# Isso evita erro 404 ao dar refresh na página
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]