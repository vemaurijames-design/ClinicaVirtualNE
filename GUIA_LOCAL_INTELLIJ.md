# 🏥 Consultorio Holístico — Guía Completa de Instalación Local

> **Dr. Nikolas Escobar · Cuídate Salud Plena**
> Frontend React + Backend Spring Boot + PostgreSQL

---

## 📋 ÍNDICE

1. [Requisitos previos](#1-requisitos-previos)
2. [Clonar el proyecto](#2-clonar-el-proyecto)
3. [Configurar el Frontend (React)](#3-frontend-react)
4. [Obtener la API Key de Gemini IA](#4-api-key-gemini-ia)
5. [Instalar PostgreSQL](#5-instalar-postgresql)
6. [Crear la base de datos](#6-crear-la-base-de-datos)
7. [Configurar el Backend en IntelliJ](#7-backend-en-intellij-idea)
8. [Correr todo junto](#8-correr-todo-junto)
9. [Ver datos en la base de datos](#9-ver-datos-en-la-base-de-datos)
10. [Endpoints de la API](#10-endpoints-de-la-api)

---

## 1. REQUISITOS PREVIOS

Instala estas herramientas antes de empezar:

| Herramienta | Versión | Descarga |
|-------------|---------|----------|
| **Node.js** | 20 o superior | https://nodejs.org |
| **pnpm** | 8 o superior | `npm install -g pnpm` |
| **Java JDK** | 21 | https://adoptium.net |
| **Maven** | 3.9+ | Viene incluido en IntelliJ |
| **IntelliJ IDEA** | Community o Ultimate | https://www.jetbrains.com/idea |
| **PostgreSQL** | 15 o 16 | https://www.postgresql.org/download |
| **pgAdmin 4** | Cualquiera | Viene con PostgreSQL |

---

## 2. CLONAR EL PROYECTO

### Opción A — Desde GitHub (recomendado)
```bash
# En tu terminal
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
```

### Opción B — Descarga directa
1. En Figma Make → botón **"Export"** o **"Download"**
2. Descomprime el ZIP en una carpeta, por ejemplo: `C:\proyectos\clinica-holistica`

---

## 3. FRONTEND (REACT)

```bash
# Entrar a la carpeta del proyecto
cd clinica-holistica    # o como se llame tu carpeta

# Instalar dependencias
pnpm install

# Crear archivo de variables de entorno
cp .env.example .env
```

### Editar el archivo `.env`:
Abre `.env` con cualquier editor y completa:
```
VITE_GEMINI_API_KEY=AIzaSy_TU_CLAVE_AQUI    ← Ver sección 4
VITE_API_URL=http://localhost:8080
```

### Correr el frontend:
```bash
pnpm dev
```
Abre el navegador en: **http://localhost:5173**

---

## 4. API KEY GEMINI IA (DIAGNÓSTICO)

La IA que genera el diagnóstico clínico es **gratuita**.

### Pasos para obtenerla:

1. Ve a: **https://aistudio.google.com/app/apikey**
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Create API key"**
4. Copia la clave (empieza con `AIzaSy...`)
5. Pégala en el archivo `.env`:
   ```
   VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

> ⚡ **Plan gratuito:** 60 requests/minuto, más que suficiente para uso clínico.
> Sin tarjeta de crédito requerida.

### ¿Cómo funciona en la app?
1. El paciente completa la **Historia Clínica** (chatbot)
2. Al terminar, va a la página de **Diagnóstico**
3. La app envía las respuestas a Gemini AI
4. Gemini analiza y devuelve: diagnósticos DSM-5, nivel de riesgo, plan de tratamiento, programa recomendado, mensaje al paciente
5. Si tienes el **backend Java** corriendo, la API key queda segura en el servidor (recomendado para producción)

---

## 5. INSTALAR POSTGRESQL

### Windows:
1. Descarga el instalador: https://www.postgresql.org/download/windows
2. Ejecuta el instalador
3. Durante la instalación:
   - **Puerto:** 5432 (dejar por defecto)
   - **Usuario:** postgres
   - **Contraseña:** Elige una que recuerdes (ej: `clinica2024`)
4. Instala también **pgAdmin 4** (viene incluido en el instalador)

### Mac:
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Linux (Ubuntu/Debian):
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 6. CREAR LA BASE DE DATOS

### Usando pgAdmin 4 (interfaz gráfica):

1. Abre **pgAdmin 4** (busca en el menú de inicio)
2. Conéctate al servidor con tu contraseña
3. Clic derecho en **"Databases"** → **"Create"** → **"Database"**
4. Nombre: `clinica_holistica`
5. Clic en **"Save"**

### Usando la terminal:
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE clinica_holistica;

# Verificar que se creó
\l

# Salir
\q
```

### Las tablas se crean automáticamente:
Cuando corras el backend por primera vez, Spring Boot crea automáticamente las tablas:
- `usuarios` — Login, registro, contraseñas encriptadas
- `historias_clinicas` — Toda la historia clínica del paciente
- `contactos` — Solicitudes del formulario de contacto

---

## 7. BACKEND EN INTELLIJ IDEA

### Paso 1 — Abrir el proyecto backend

1. Abre IntelliJ IDEA
2. **File → Open**
3. Navega a la carpeta: `TU_PROYECTO/backend`
4. Selecciona el archivo `pom.xml`
5. Clic en **"Open as Project"**
6. Espera a que Maven descargue las dependencias (puede tardar 2-3 minutos la primera vez)

### Paso 2 — Configurar Java 21

1. **File → Project Structure → Project**
2. En **"SDK"** selecciona Java 21
3. Si no aparece: clic en **"Add SDK"** → **"Download JDK"** → versión 21 (Temurin)

### Paso 3 — Configurar variables de entorno

1. En la barra superior, clic en **"Edit Configurations"** (junto al botón de play ▶)
2. Selecciona la configuración de `ClinicaApplication`
3. En **"Environment variables"** haz clic en el ícono de carpeta 📁
4. Agrega estas variables:

```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
DB_USERNAME=postgres
DB_PASSWORD=clinica2024
```

### Paso 4 — Elegir base de datos

#### Opción A: H2 (más fácil, sin instalar nada)
No necesitas hacer nada. El backend usa H2 por defecto.
Los datos se guardan en el archivo `backend/data/clinicadb.mv.db`

#### Opción B: PostgreSQL (recomendado para producción)
En **"Edit Configurations"** agrega a las variables de entorno:
```
SPRING_PROFILES_ACTIVE=postgres
DB_USERNAME=postgres
DB_PASSWORD=clinica2024
```

### Paso 5 — Correr el backend

1. Abre el archivo: `src/main/java/com/clinica/holistica/ClinicaApplication.java`
2. Haz clic en el ícono ▶ verde junto a `public class ClinicaApplication`
3. O usa el botón ▶ de la barra superior
4. En la consola verás: `Started ClinicaApplication on port 8080`

---

## 8. CORRER TODO JUNTO

Abre **dos terminales** o usa la terminal de IntelliJ:

### Terminal 1 — Frontend:
```bash
cd clinica-holistica
pnpm dev
# ✅ http://localhost:5173
```

### Terminal 2 — Backend (alternativa a IntelliJ):
```bash
cd clinica-holistica/backend

# Con H2 (sin PostgreSQL)
mvn spring-boot:run

# Con PostgreSQL
mvn spring-boot:run -Dspring-boot.run.profiles=postgres \
  -Dspring-boot.run.jvmArguments="-DGEMINI_API_KEY=AIzaSy... -DDB_PASSWORD=clinica2024"
```

### Verificar que funciona:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080/api/admin/resumen
- Consola H2: http://localhost:8080/h2-console

---

## 9. VER DATOS EN LA BASE DE DATOS

### Con H2 (consola web integrada):

1. Con el backend corriendo, abre: **http://localhost:8080/h2-console**
2. Configura la conexión:
   - **JDBC URL:** `jdbc:h2:file:./data/clinicadb`
   - **User:** `sa`
   - **Password:** (vacío)
3. Clic en **"Connect"**

Consultas útiles para ver datos:
```sql
-- Ver todos los usuarios registrados
SELECT id, nombre, email, rol, activo, creado_en, ultimo_acceso FROM usuarios;

-- Ver historias clínicas con nombre del paciente
SELECT id, nombre, edad, motivo_consulta, nivel_riesgo, programa_recomendado, creado_en
FROM historias_clinicas;

-- Ver el diagnóstico completo de IA de un paciente
SELECT nombre, diagnostico_ia FROM historias_clinicas WHERE id = 1;

-- Ver solicitudes de contacto
SELECT id, nombre, telefono, tipo, estado, creado_en FROM contactos;

-- Estadísticas rápidas
SELECT
  (SELECT COUNT(*) FROM usuarios) as total_usuarios,
  (SELECT COUNT(*) FROM historias_clinicas) as total_historias,
  (SELECT COUNT(*) FROM contactos) as total_contactos;
```

### Con pgAdmin 4 (PostgreSQL):

1. Abre pgAdmin 4
2. Conéctate al servidor → `clinica_holistica`
3. Expande: **Schemas → public → Tables**
4. Clic derecho en una tabla → **"View/Edit Data"** → **"All Rows"**

---

## 10. ENDPOINTS DE LA API

Base URL: `http://localhost:8080`

### 🔐 Autenticación
```
POST /api/auth/registrar
Body: { "nombre": "Juan", "email": "juan@email.com", "password": "123456" }

POST /api/auth/login
Body: { "email": "juan@email.com", "password": "123456" }

POST /api/auth/forgot-password
Body: { "email": "juan@email.com" }

POST /api/auth/reset-password
Body: { "token": "uuid-aqui", "nuevaPassword": "nueva123" }
```

### 📋 Historia Clínica
```
POST /api/historia
Body: { "respuestas": { "nombre": "...", "edad": "..." }, "consentimientoAceptado": true }

GET /api/historia/mis-historias    ← Requiere token JWT

GET /api/historia/todas            ← Solo admin
```

### 🤖 Diagnóstico IA (Gemini)
```
POST /api/diagnostico/ia
Body: {
  "respuestas": { "nombre": "Juan", "edad": "25-36", ... },
  "historiaId": 1
}
```

### 📬 Contacto
```
POST /api/contacto
Body: { "nombre": "Juan", "telefono": "3001234567", "tipo": "Consulta", "mensaje": "..." }

GET /api/contacto    ← Ver todas las solicitudes
```

### 👨‍💼 Panel Admin (requiere rol ADMIN)
```
GET /api/admin/resumen
GET /api/admin/usuarios
GET /api/admin/usuarios/{id}
GET /api/admin/historias
GET /api/admin/historias/{id}
GET /api/admin/contactos
```

### Usar autenticación con JWT:
Para rutas protegidas, agrega el header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### Error: "Port 8080 already in use"
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <numero> /F

# Mac/Linux
lsof -ti:8080 | xargs kill
```

### Error: "Cannot connect to PostgreSQL"
- Verifica que PostgreSQL esté corriendo
- Comprueba usuario y contraseña en las variables de entorno
- Asegúrate de haber creado la base de datos `clinica_holistica`

### Error: "Gemini API key invalid"
- Verifica que la clave en `.env` empiece con `AIzaSy`
- Asegúrate de guardar el archivo `.env` después de editarlo
- Reinicia el servidor de desarrollo (`pnpm dev`)

### Las tablas no se crean:
- En `application.properties` verifica: `spring.jpa.hibernate.ddl-auto=update`
- Revisa la consola de IntelliJ para ver errores de conexión a BD

---

## 📱 ESTRUCTURA DEL PROYECTO

```
clinica-holistica/
├── src/                        ← Frontend React
│   ├── app/
│   │   ├── App.tsx             ← Componente principal (toda la app)
│   │   └── components/
│   ├── imports/                ← Imágenes (logo, fotos)
│   │   ├── image-1.png         ← Foto Dr. Escobar (escritorio)
│   │   ├── image-2.png         ← Logo circular Cuídate
│   │   ├── image-3.png         ← Foto hero (profesional)
│   │   └── descarga.png        ← Fondo hero teal
│   └── styles/
│       ├── theme.css           ← Colores y tokens
│       └── fonts.css           ← Plus Jakarta Sans
├── backend/                    ← Backend Java Spring Boot
│   ├── pom.xml                 ← Dependencias Maven
│   ├── src/main/java/com/clinica/holistica/
│   │   ├── ClinicaApplication.java
│   │   ├── entity/             ← Tablas de BD (Usuario, Historia, Contacto)
│   │   ├── repository/         ← Consultas a BD
│   │   ├── service/            ← Lógica de negocio + Gemini
│   │   ├── controller/         ← Endpoints REST
│   │   ├── security/           ← JWT
│   │   └── config/             ← CORS, Security, Errores
│   └── src/main/resources/
│       ├── application.properties          ← Configuración H2
│       └── application-postgres.properties ← Configuración PostgreSQL
├── .env.example                ← Plantilla de variables
└── GUIA_LOCAL_INTELLIJ.md      ← Este archivo
```

---

## 🚀 PRÓXIMOS PASOS (PRODUCCIÓN)

1. **Subir a Railway o Render** (backend gratuito):
   - Conecta tu repositorio GitHub
   - Agrega las variables de entorno
   - Railway detecta automáticamente Spring Boot

2. **Base de datos en la nube**:
   - Railway incluye PostgreSQL gratuito
   - Agrega `DATABASE_URL` como variable de entorno

3. **Frontend en Vercel o Netlify** (gratis):
   ```bash
   pnpm build    # Genera carpeta dist/
   ```
   - Sube la carpeta `dist/` o conecta el repositorio

---

*Consultorio Holístico Cuídate Salud Plena · Dr. Nikolas Escobar*
*Para soporte técnico: @cuidatemedellin*
