# Dockerfile optimizado para Railway
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (necesarias para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar aplicación
RUN npm run build

# ========================================
# Imagen de producción
# ========================================
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Railway asigna el puerto dinámicamente
ENV PORT=3000

EXPOSE ${PORT}

# Iniciar aplicación
CMD ["node", "dist/main"]
