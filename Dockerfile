# Usa una imagen base con Node.js 18
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo de configuración de package.json al directorio de trabajo
COPY package.json package.json
COPY package-lock.json package-lock.json

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos al directorio de trabajo
COPY . .

# Expone el puerto 19000 para Metro Bundler
EXPOSE 19000

# Expone el puerto 19001 para la aplicación Expo
EXPOSE 19001

# Expone el puerto 19002 para el servidor de desarrollo Expo
EXPOSE 19002

# Define el comando que se ejecutará cuando el contenedor se inicie
CMD ["npm", "start"]
