FROM nginx:alpine

# Copy static site assets to Nginx default public directory
COPY . /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
