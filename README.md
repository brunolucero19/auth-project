# Sistema de Autenticación Completo

Este proyecto es un sistema de autenticación robusto y moderno construido con **Next.js** (Frontend) y **Express/Node.js** (Backend), utilizando **Prisma** y **PostgreSQL**.

## Características

-   **Autenticación**:
    -   Login y Registro con Email/Contraseña.
    -   **OAuth** con Google y GitHub.
    -   Recuperación de Contraseña (Email).
    -   Sesiones seguras con Refresh Tokens (HttpOnly Cookies).
-   **Dashboard**:
    -   Panel de control protegido.
    -   Gestión de **Perfil de Usuario** (Actualizar nombre, email, contraseña, avatar).
    -   Soporte para **Avatares** (Imagen de perfil).
    -   Panel de Administración (Roles).
-   **UI/UX**:
    -   Diseño moderno y minimalista con **Shadcn/UI** y **Tailwind CSS**.
    -   Modo Oscuro/Claro (Dark Mode).
    -   Feedback visual con Toasts (Sonner).

## Tecnologías

-   **Frontend**: Next.js 14+, React, Tailwind CSS, Shadcn/UI, Axios, React Hook Form, Zod.
-   **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Passport.js, Nodemailer, JSON Web Tokens (JWT).

## Configuración e Instalación

### 1. Requisitos Previos
-   Node.js (v18+)
-   PostgreSQL (Base de datos local o Docker)

### 2. Variables de Entorno

Crea un archivo `.env` en `backend/` y `frontend/` basándote en los ejemplos.

**Backend (`backend/.env`):**
```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db?schema=public"
JWT_ACCESS_SECRET="tu_secreto_acceso_super_seguro"
JWT_REFRESH_SECRET="tu_secreto_refresh_super_seguro"
FRONTEND_URL="http://localhost:3000"

# Email (Gmail Example)
# Generar contraseña de aplicación en: https://myaccount.google.com/apppasswords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
EMAIL_FROM=tu_email@gmail.com

# OAuth (Google & GitHub)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

**Frontend (`frontend/.env`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 3. Base de Datos (Docker)
Si tienes Docker instalado, asegúrate de que **Docker Desktop esté ejecutándose**. Luego, levanta la base de datos:

```bash
docker-compose up -d
```
Esto iniciará un contenedor de PostgreSQL mapeado en el puerto **5433** (para no chocar con instalaciones locales).

> **Nota**: Si usas este método, asegúrate de actualizar tu `DATABASE_URL` en el `.env` para usar el puerto `5433` en lugar de `5432`.

### 4. Instalación y Ejecución

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push  # Sincronizar base de datos
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Estructura del Proyecto

-   `/backend`: API RESTful, lógica de auth, modelos de BD.
-   `/frontend`: Aplicación Next.js, interfaces de usuario.

## Comandos Útiles

-   `npm run lint`: Verificar errores de código.
-   `npx prisma studio`: Interfaz visual para la base de datos.
