# Consultorio Holístico — Cuídate Salud Plena

Plataforma digital para clínica IPS especializada en tratamiento de adicciones y salud mental integrativa. Dr. Nikolas Escobar.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Spring Boot 3.2.5 + Java 21 + Maven |
| Base de datos | PostgreSQL 15+ |
| Auth | JWT (jjwt 0.11.5) + BCrypt |
| IA | Google Gemini 1.5 Flash |
| Pagos | Wompi (Colombia) / Stripe (Internacional) |
| Despliegue | Railway (backend) + Vercel (frontend) |

## Módulos

- **Login / Registro / Recuperación de contraseña** — JWT + BCrypt
- **Historia Clínica Digital** — 26 preguntas clínicas, almacenada en PostgreSQL
- **Diagnóstico IA** — Google Gemini 1.5 Flash, proxy seguro vía backend
- **Programas de Tratamiento** — Hipnosis, Auriculoterapia, Yoga/Mindfulness, Grupo
- **Audioterapia y Videos** — Archivos locales o YouTube embed
- **Pasarela de Pago** — Wompi (Colombia) y Stripe (Internacional)
- **Contacto WhatsApp** — Formulario + botón flotante animado
- **Panel Administrador** — CRUD completo de usuarios, historias y contactos

## Prerrequisitos

- Java 21 (JDK, no JRE)
- Maven 3.9+
- Node.js 18+ y pnpm (`npm i -g pnpm`)
- PostgreSQL 15+
- IntelliJ IDEA (recomendado para backend)
- VS Code (recomendado para frontend)

## Configuración Local

### 1. Base de Datos PostgreSQL

```sql
CREATE DATABASE clinica_holistica;
-- usuario: postgres | contraseña: 12345678 | puerto: 5432
```

Las tablas se crean automáticamente con `spring.jpa.hibernate.ddl-auto=update`.

### 2. Backend (Spring Boot)

```bash
cd backend
# Crea el archivo application.properties (no está en Git)
```

Contenido de `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/clinica_holistica
spring.datasource.username=postgres
spring.datasource.password=12345678
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

app.jwt.secret=TU_SECRETO_JWT_MINIMO_32_CARACTERES_AQUI
app.jwt.expiration=86400000

gemini.api.key=TU_API_KEY_GEMINI_AQUI
```

Luego en IntelliJ: botón Run en `ClinicaApplication.java`, o desde terminal:

```bash
cd backend
mvn spring-boot:run
```

Al iniciar, el `DataSeeder` crea automáticamente la cuenta admin:

| Campo | Valor |
|-------|-------|
| Email | `admin@clinica.com` |
| Contraseña | `Admin2024!` |

### 3. Frontend (React + Vite)

```bash
# En la raíz del proyecto
pnpm install
pnpm dev
```

Crea el archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:8080
VITE_GEMINI_API_KEY=          # Opcional si el backend está activo
```

El frontend queda disponible en `http://localhost:5173`.

## Panel Administrador

Inicia sesión con `admin@clinica.com / Admin2024!` y accede a `/admin`.

El panel admin incluye:
- **Dashboard**: estadísticas en tiempo real (usuarios, historias, contactos)
- **Usuarios**: crear, editar rol/nombre/contraseña, activar/desactivar (soft delete — nunca borra datos médicos)
- **Historias Clínicas**: ver todas con respuestas completas
- **Contactos**: ver mensajes, cambiar estado NUEVO → LEÍDO → RESPONDIDO

## Pruebas con Postman

Importa: `postman/Clinica_Holistica.postman_collection.json`

### Flujo básico

```
1. POST /api/auth/registrar      → JWT se guarda automáticamente en colección
2. POST /api/auth/login          → Actualiza JWT
3. POST /api/historia            → Crea historia clínica (requiere JWT)
4. POST /api/diagnostico/ia      → Diagnóstico Gemini (requiere JWT)
5. POST /api/contacto            → Envía mensaje (público)
6. GET  /api/admin/resumen       → Dashboard (requiere JWT de admin@clinica.com)
```

### Tabla de endpoints

| Método | URL | Auth | Descripción |
|--------|-----|------|-------------|
| POST | `/api/auth/registrar` | No | Registro |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/forgot-password` | No | Token recuperación |
| POST | `/api/auth/reset-password` | No | Nueva contraseña |
| POST | `/api/historia` | JWT | Crear historia |
| GET | `/api/historia/mis-historias` | JWT | Mis historias |
| POST | `/api/diagnostico/ia` | JWT | Diagnóstico Gemini |
| POST | `/api/contacto` | No | Enviar contacto |
| GET | `/api/admin/resumen` | JWT Admin | Stats dashboard |
| GET | `/api/admin/usuarios` | JWT Admin | Listar usuarios |
| POST | `/api/admin/usuarios` | JWT Admin | Crear usuario |
| PUT | `/api/admin/usuarios/{id}` | JWT Admin | Editar usuario |
| DELETE | `/api/admin/usuarios/{id}` | JWT Admin | Desactivar (soft) |
| PUT | `/api/admin/usuarios/{id}/activar` | JWT Admin | Reactivar |
| GET | `/api/admin/historias` | JWT Admin | Todas las historias |
| GET | `/api/admin/contactos` | JWT Admin | Todos los contactos |
| PUT | `/api/admin/contactos/{id}/estado` | JWT Admin | Cambiar estado |

## WhatsApp

Edita `src/app/App.tsx` línea ~1107:

```typescript
const WA_NUMBER = "573001234567"; // ← Tu número real (57 = Colombia)
```

## Audios y Videos

- Audios: coloca archivos `.mp3` en `/public/audios/` y actualiza el array `AUDIOS` en App.tsx
- Videos: coloca archivos `.mp4` en `/public/videos/` o usa `youtubeId` en el array `VIDEOS`

## Pasarela de Pago

Agrega en `.env`:

```env
VITE_WOMPI_PUBLIC_KEY=pub_test_xxxx      # Wompi — Colombia
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx # Stripe — Internacional
```

## Despliegue en Producción

### Backend en Railway

1. Sube el proyecto a GitHub (sin `application.properties`)
2. Nuevo proyecto en [railway.app](https://railway.app) → conectar repo → seleccionar carpeta `backend`
3. Agregar variables de entorno en Railway:
   - `SPRING_DATASOURCE_URL=jdbc:postgresql://...`
   - `SPRING_DATASOURCE_USERNAME=postgres`
   - `SPRING_DATASOURCE_PASSWORD=...`
   - `APP_JWT_SECRET=...`
   - `GEMINI_API_KEY=...`
4. Railway detecta Maven y despliega automáticamente
5. Copia la URL pública (ej: `https://mi-clinica.railway.app`)

### Frontend en Vercel

1. Importar repo en [vercel.com](https://vercel.com)
2. Root directory: `/` (raíz)
3. Build command: `pnpm build`
4. Output directory: `dist`
5. Variable de entorno: `VITE_API_URL=https://mi-clinica.railway.app`

## Estructura del Proyecto

```
/
├── src/                          # Frontend React
│   ├── app/App.tsx               # Componente principal
│   └── styles/                   # Estilos y tokens Tailwind
├── backend/                      # Spring Boot
│   └── src/main/java/com/clinica/holistica/
│       ├── config/               # SecurityConfig, DataSeeder, CorsConfig
│       ├── controller/           # Auth, Historia, Diagnóstico, Contacto, Admin
│       ├── dto/                  # ApiResponse, AuthRequest/Response
│       ├── entity/               # Usuario, HistoriaClinica, Contacto
│       ├── repository/           # JPA Repositories
│       ├── security/             # JwtFilter, JwtUtil
│       └── service/              # AuthService, HistoriaService, GeminiService
├── postman/                      # Colección Postman importable
├── public/
│   ├── audios/                   # Archivos MP3
│   └── videos/                   # Archivos MP4
├── .env.example                  # Plantilla variables de entorno
├── .gitignore                    # Excluye .env, target/, secrets
└── README.md
```

## Seguridad

- `.env` y `application.properties` en `.gitignore` — **nunca se suben a GitHub**
- Contraseñas almacenadas con BCrypt (factor 10)
- JWT con expiración de 24h
- Soft delete — los registros médicos **nunca se eliminan permanentemente**
- CORS configurado para orígenes conocidos
- Rutas `/api/admin/**` protegen con JWT obligatorio

## Errores Comunes

| Error | Solución |
|-------|---------|
| `Cannot find module @rollup/rollup-win32-x64-msvc` | `pnpm add -D @rollup/rollup-win32-x64-msvc lightningcss-win32-x64-msvc` |
| `Connection refused :5432` | Verificar que PostgreSQL está corriendo |
| `GET is not supported at /api/auth/login` | Normal — el login es POST, usar Postman |
| `401 Unauthorized en /api/admin` | Hacer login con admin@clinica.com primero |
| `H2 dialect error` | Quitar dependencia H2 del pom.xml, usar PostgreSQL |
| Pantalla azul al iniciar sesión | Limpiar localStorage del navegador (`F12 > Application > Clear`) |

## Comandos Git

```bash
# Primer push a GitHub
git init
git add .
git commit -m "feat: plataforma clínica holística completa"
git remote add origin https://github.com/TU_USUARIO/clinica-holistica.git
git push -u origin main

# Subir cambios
git add .
git commit -m "descripción del cambio"
git push
```

---

Licencia: Uso exclusivo del Consultorio Holístico Cuídate Salud Plena. Todos los derechos reservados.
