FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=https://api.zunixe.com/api
ARG VITE_STOREFRONT_URL=https://www.zunixe.com
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_FACEBOOK_APP_ID=
ENV VITE_API_URL=$VITE_API_URL VITE_STOREFRONT_URL=$VITE_STOREFRONT_URL VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID VITE_FACEBOOK_APP_ID=$VITE_FACEBOOK_APP_ID
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
