# 🎵 Musical Hendrix - E-commerce de Instrumentos Musicales

<div align="center">

![Java](https://img.shields.io/badge/Java-17-red?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.0-green?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8-orange?style=for-the-badge&logo=mysql)
![MercadoPago](https://img.shields.io/badge/MercadoPago-API-lightblue?style=for-the-badge)

**Aplicación completa de e-commerce para una tienda de instrumentos musicales**

[Demo](#demo) • [Características](#características) • [Instalación](#instalación) • [API](#api) • [Contribuir](#contribuir)

</div>

---

## 📖 Descripción

Musical Hendrix es una aplicación web completa de e-commerce desarrollada para una tienda de instrumentos musicales en Mendoza, Argentina. La aplicación permite a los usuarios navegar por un catálogo de instrumentos, realizar compras con carrito de compras, procesar pagos a través de MercadoPago, y gestionar usuarios con diferentes roles.

## ✨ Características Principales

### 🛒 **E-commerce Completo**
- Catálogo de productos con filtros por categoría
- Carrito de compras persistente
- Sistema de stock en tiempo real
- Historial de precios de instrumentos

### 💳 **Integración de Pagos**
- Pagos seguros con **MercadoPago**
- Soporte para modo sandbox y producción
- Webhooks para actualización automática de estados
- Redirección automática post-pago

### 🔐 **Sistema de Autenticación**
- Registro y login de usuarios
- Recuperación de contraseña por email
- Sistema de roles (Admin, Operador, Visor)
- Autenticación basada en headers personalizados

### 👥 **Gestión de Usuarios**
- **Admin**: Control total del sistema
- **Operador**: Gestión de inventario
- **Visor**: Solo visualización y compras

### 📧 **Sistema de Emails**
- Emails de recuperación de contraseña
- Emails de bienvenida
- Templates HTML profesionales
- Integración con Gmail SMTP

### 📦 **Gestión de Inventario**
- CRUD completo de instrumentos
- Control automático de stock
- Actualización de precios con historial
- Categorización de productos

## 🏗️ Arquitectura

### **Backend (Spring Boot)**
```
src/
├── main/java/com/example/instrumentos/
│   ├── config/          # Configuraciones (CORS, Security, MercadoPago)
│   ├── controller/      # Controladores REST
│   ├── dto/            # DTOs para request/response
│   ├── exception/      # Manejo global de excepciones
│   ├── mapper/         # Mappers entre entidades y DTOs
│   ├── model/          # Entidades JPA
│   ├── repository/     # Repositorios Spring Data
│   ├── service/        # Lógica de negocio
│   └── util/           # Utilidades y constantes
└── resources/
    ├── data/           # Datos iniciales (JSON)
    └── *.properties    # Configuraciones
```

### **Frontend (React + TypeScript)**
```
src/
├── components/         # Componentes reutilizables
│   ├── carrito/       # Carrito de compras
│   ├── common/        # Componentes comunes
│   ├── instrumentos/  # Gestión de productos
│   └── pagos/         # Integración MercadoPago
├── context/           # Context API (Auth, Carrito)
├── hooks/             # Custom hooks
├── pages/             # Páginas principales
├── service/           # Servicios API
├── types/             # Definiciones TypeScript
└── App.tsx           # Componente principal
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Java 17+
- Node.js 16+
- MySQL 8+
- Maven 3.6+

### **1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/musical-hendrix.git
cd musical-hendrix
```

### **2. Configurar variables de entorno**
```bash
# Copiar el template de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

### **3. Configurar la base de datos**
```sql
-- Crear base de datos MySQL
CREATE DATABASE dbinstrumentosMIO;
```

### **4. Configurar Gmail (para emails)**
1. Habilitar verificación en 2 pasos en Gmail
2. Generar App Password en: https://myaccount.google.com/apppasswords
3. Agregar credenciales en `.env`

### **5. Configurar MercadoPago**
1. Crear cuenta en: https://www.mercadopago.com.ar/developers
2. Obtener credenciales de test
3. Agregar access token en `.env`

### **6. Ejecutar Backend**
```bash
# Instalar dependencias
mvn clean install

# Ejecutar aplicación
mvn spring-boot:run
```

### **7. Ejecutar Frontend**
```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### **8. Acceder a la aplicación**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html

## 📚 API Endpoints

### **Autenticación**
```
POST /api/usuarios/login          # Iniciar sesión
POST /api/usuarios/registro       # Registrar usuario
POST /api/auth/forgot-password    # Solicitar recuperación
POST /api/auth/reset-password     # Resetear contraseña
```

### **Instrumentos**
```
GET    /api/instrumentos          # Listar instrumentos
GET    /api/instrumentos/{id}     # Obtener instrumento
POST   /api/instrumentos          # Crear instrumento (Admin)
PUT    /api/instrumentos/{id}     # Actualizar instrumento (Admin/Operador)
DELETE /api/instrumentos/{id}     # Eliminar instrumento (Admin)
PATCH  /api/instrumentos/{id}/precio  # Actualizar precio
PATCH  /api/instrumentos/{id}/stock   # Reponer stock
```

### **Pedidos**
```
GET  /api/pedidos                 # Listar pedidos (Admin)
GET  /api/pedidos/usuario/{id}    # Pedidos por usuario
POST /api/pedidos                 # Crear pedido
PATCH /api/pedidos/{id}/estado    # Actualizar estado
```

### **Pagos**
```
POST /api/pagos/crear/{pedidoId}  # Crear preferencia MercadoPago
POST /api/pagos/webhook           # Webhook MercadoPago
GET  /api/pagos/pedido/{id}       # Pagos por pedido
```

## 🔧 Configuración de Producción

### **Variables de Entorno Requeridas**
```bash
# Base de datos
DB_HOST=tu-servidor-mysql
DB_NAME=tu-base-datos
DB_USERNAME=tu-usuario
DB_PASSWORD=tu-password

# Email
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu-token-produccion
MERCADOPAGO_SANDBOX_MODE=true

# URLs
APP_BASE_URL=https://tu-dominio.com
BACKEND_BASE_URL=https://api.tu-dominio.com
```

### **Build de Producción**
```bash
# Backend
mvn clean package -Pprod

# Frontend
npm run build
```

## 👥 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@instrumentos.com | admin123 | Admin |

## 🧪 Testing

### **Flujo de Compra Completo**
1. Registrar nuevo usuario
2. Navegar catálogo de productos
3. Agregar productos al carrito
4. Realizar pedido
5. Procesar pago con MercadoPago (sandbox)
6. Verificar actualización de stock

### **Credenciales de Prueba MercadoPago**
- **Tarjeta de crédito**: 4509 9535 6623 3704
- **CVV**: 123
- **Vencimiento**: Cualquier fecha futura
- **Titular**: APRO (aprobado) / CONT (rechazado)

---

<div align="center">

**⭐ Si te gustó este proyecto, ¡dale una estrella! ⭐**

Made with ❤️ in Mendoza, Argentina 🇦🇷

</div>
