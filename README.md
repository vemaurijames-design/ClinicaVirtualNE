# 🏥 Consultorio Holístico — Cuídate Salud Plena
### Plataforma Digital de Salud Mental y Tratamiento de Adicciones

> **Dr. Nikolas Escobar** · Medellín, Colombia  
> Stack: React 18 + TypeScript · Spring Boot 3.2 · PostgreSQL · Gemini AI

---

## 📋 MÓDULOS INCLUIDOS

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| 🏠 Landing Page | `/` | Presentación, servicios, precios, contacto |
| 🔐 Login / Registro | `/auth` | Autenticación JWT + recuperar contraseña |
| 📋 Historia Clínica | `/historia` | Cuestionario IA de 24 preguntas |
| 🧠 Diagnóstico IA | `/diagnostico` | Análisis Gemini DSM-5/CIE-10 |
| 💊 Programas | `/tratamientos` | Programas mes 1-4 + pagos Wompi/Stripe |
| 🎵 Audios & Videos | `/audios` | Biblioteca terapéutica multimedia |
| 📱 WhatsApp | Flotante | Botón en toda la app → clínica directa |
| 🛡️ Admin Panel | API REST | Ver usuarios, historias, contactos |

---

## 🏗️ ARQUITECTURA

```
clinica-holistica/
│
├── src/                          ← Frontend React + TypeScript + Vite
│   ├── app/App.tsx               ← Toda la app (~3000 líneas)
│   └── styles/
│       ├── theme.css             ← Tokens de diseño (colores, fuentes)
│       └── fonts.css             ← Google Fonts
│
├── backend/                      ← Backend Java Spring Boot
│   ├── pom.xml                   ← Dependencias Maven
│   └── src/main/
│       ├── java/com/clinica/holistica/
│       │   ├── ClinicaApplication.java
│       │   ├── config/           ← Security, CORS, ExceptionHandler
│       │   ├── controller/       ← Auth, Historia, Diagnóstico, Contacto, Admin
│       │   ├── dto/              ← Request/Response DTOs
│       │   ├── entity/           ← Usuario, HistoriaClinica, Contacto
│       │   ├── repository/       ← JPA Repositories
│       │   ├── security/         ← JwtUtil, JwtFilter
│       │   └── service/          ← Auth, Gemini, Historia, Contacto
│       └── resources/
│           └── application.properties
│
├── public/
│   ├── audios/                   ← Colocar archivos .mp3 aquí
│   └── videos/                   ← Colocar archivos .mp4 aquí
│
├── .env                          ← Variables frontend (NO subir a Git)
├── .env.example                  ← Plantilla pública
├── .gitignore
└── README.md
```

---

## ⚙️ REQUISITOS PREVIOS

| Software | Versión | Descarga |
|----------|---------|----------|
| Java JDK | 21+ | [adoptium.net](https://adoptium.net) |
| Maven | 3.9+ | Incluido en IntelliJ |
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| pnpm | 11+ | `npm install -g pnpm` |
| PostgreSQL | 15+ | [postgresql.org](https://postgresql.org/download) |
| IntelliJ IDEA | 2024+ | [jetbrains.com/idea](https://jetbrains.com/idea) |
| Postman | Última | [postman.com](https://postman.com/downloads) |

---

## 🚀 CLONAR Y EJECUTAR LOCALMENTE

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/clinica-holistica.git
cd clinica-holistica
```

---

### Paso 2 — Configurar PostgreSQL

#### En pgAdmin 4:
1. Abrir pgAdmin → clic derecho en **Databases** → **Create** → **Database**
2. Nombre: `clinica_holistica` → **Save**

#### O por línea de comandos:
```sql
psql -U postgres
CREATE DATABASE clinica_holistica;
\q
```

> Las tablas se crean **automáticamente** al iniciar el backend (Hibernate).

---

### Paso 3 — Configurar el Backend

#### 3.1 Abrir en IntelliJ IDEA

1. Abrir IntelliJ → **File → Open**
2. Seleccionar la carpeta `backend/` (donde está `pom.xml`)
3. IntelliJ detecta Maven → clic en **"Trust Project"**
4. Esperar descarga de dependencias (~2 minutos la primera vez)
5. Verificar en la barra lateral: **Maven → holistica-backend → Dependencies** (debe cargar sin errores)

#### 3.2 Configurar application.properties

Abrir `backend/src/main/resources/application.properties` y editar:

```properties
# ── PostgreSQL ──────────────────────────────────────────
spring.datasource.url=jdbc:postgresql://localhost:5432/clinica_holistica
spring.datasource.username=postgres
spring.datasource.password=TU_PASSWORD_POSTGRES     ← cambiar

# ── Gemini AI (GRATIS) ───────────────────────────────────
# 1. Ir a: https://aistudio.google.com/app/apikey
# 2. Clic en "Create API Key"
# 3. Copiar la clave (empieza con AIzaSy...)
app.gemini.api-key=AIzaSy_TU_CLAVE_AQUI             ← cambiar

# ── Email Hotmail (opcional) ──────────────────────────────
# Para recuperación de contraseña por email:
spring.mail.username=mantenimientojms@hotmail.com
spring.mail.password=TU_PASSWORD_APP_HOTMAIL         ← cambiar (contraseña de APLICACIÓN, no la normal)

# ── WhatsApp de la clínica ────────────────────────────────
# Editar en App.tsx línea: const WA_NUMBER = "573001234567";
# Formato: código país sin + (Colombia=57) + número sin espacios
```

#### 3.3 Ejecutar el Backend

1. Abrir `src/main/java/com/clinica/holistica/ClinicaApplication.java`
2. Clic en el triángulo verde ▶ junto a `main`
3. Seleccionar **"Run 'ClinicaApplication'"**
4. Esperar en la consola: `Started ClinicaApplication on port(s): 8080`

#### 3.4 Verificar que el backend funciona

Abrir en el navegador: `http://localhost:8080/api/admin/resumen`

Debe aparecer:
```json
{"success":true,"data":{"totalUsuarios":0,"totalHistorias":0,"totalContactos":0}}
```

---

### Paso 4 — Configurar el Frontend

#### 4.1 Crear archivo .env

En la carpeta **raíz** del proyecto (donde está `package.json`), crear el archivo `.env`:

```bash
# Windows PowerShell:
New-Item .env

# O simplemente crear el archivo manualmente con este contenido:
```

Contenido del `.env`:
```
VITE_API_URL=http://localhost:8080
VITE_GEMINI_API_KEY=AIzaSy_TU_CLAVE_AQUI
```

#### 4.2 Instalar dependencias y ejecutar

```powershell
# Instalar dependencias
pnpm install

# Si hay error de módulos nativos en Windows:
pnpm add -D @rollup/rollup-win32-x64-msvc
pnpm add -D lightningcss-win32-x64-msvc

# Iniciar servidor de desarrollo
pnpm dev
```

Abrir: **http://localhost:5173**

---

## 🎵 AGREGAR AUDIOS Y VIDEOS

### Audios (archivos .mp3)

1. Copiar tus archivos `.mp3` a la carpeta `public/audios/`
2. En `App.tsx`, buscar el array `AUDIOS` (~línea 600)
3. Agregar tu audio:

```typescript
{
  id: 10,
  title: "Nombre de tu audio",
  sub: "Subtítulo descriptivo",
  dur: "12 min",
  cat: "autohipnosis",           // autohipnosis | binaural | podcasts
  free: true,                    // true = reproducción libre | false = requiere programa
  audioSrc: "/audios/mi-audio.mp3",  // ← ruta desde public/
  waveform: [40, 80, 60, 90, 45, 70, 55, 85, 65, 75],
},
```

### Videos (archivos .mp4 o YouTube)

1. Copiar tus archivos `.mp4` a `public/videos/` **O** usar ID de YouTube
2. En `App.tsx`, buscar el array `VIDEOS` (~línea 640)
3. Agregar tu video:

```typescript
// Opción A — Video local (.mp4)
{
  id: 5,
  title: "Sesión de Hipnoterapia",
  desc: "Descripción del video",
  thumb: "/videos/thumb-hipnosis.jpg",   // miniatura opcional
  videoSrc: "/videos/hipnosis.mp4",      // ← video local
  doctor: true,
},

// Opción B — YouTube embed
{
  id: 6,
  title: "Meditación Guiada",
  desc: "Sesión de 20 minutos con el Dr. Escobar",
  thumb: "https://img.youtube.com/vi/ID_DEL_VIDEO/maxresdefault.jpg",
  youtubeId: "dQw4w9WgXcQ",             // ← solo el ID de YouTube
  doctor: true,
},
```

---

## 💳 MÉTODOS DE PAGO

### Wompi (Colombia — recomendado)

1. Registrarse en [comercios.wompi.co](https://comercios.wompi.co)
2. Obtener clave pública de pruebas: `pub_test_...`
3. Agregar al `.env`:
```
VITE_WOMPI_PUBLIC_KEY=pub_test_TU_CLAVE
```
4. En `App.tsx` buscar `VITE_WOMPI_PUBLIC_KEY` — el código ya está listo para activarse

### Stripe (Internacional)

1. Registrarse en [stripe.com](https://stripe.com)
2. Obtener publishable key: `pk_test_...`
3. Agregar al `.env`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE
```

---

## 📱 WHATSAPP — Configuración

Cambiar el número de WhatsApp de la clínica:

En `App.tsx`, buscar:
```typescript
const WA_NUMBER = "573001234567"; // ← línea ~1107
```

Reemplazar con el número real:
```typescript
const WA_NUMBER = "57XXXXXXXXXX"; // Colombia: 57 + 10 dígitos sin espacios
// Ejemplo: 573105551234 (para el número 310 555 1234)
```

---

## 🔑 OLVIDAR CONTRASEÑA — Configuración

El sistema de recuperación de contraseña funciona así:

**En desarrollo (actual):** El token de reset aparece en la respuesta de la API (para pruebas).

**Para producción** — configurar email real:

1. En Hotmail/Outlook: Cuenta → Seguridad → Contraseñas de aplicación → Crear nueva
2. Copiar la contraseña de 16 caracteres
3. Agregar en `application.properties`:
```properties
spring.mail.password=xxxx xxxx xxxx xxxx
```

**Proveedores alternativos:**
- **SendGrid:** `spring.mail.host=smtp.sendgrid.net` · port 587
- **Gmail:** `spring.mail.host=smtp.gmail.com` · port 587 (usar contraseña de app)
- **AWS SES:** configuración vía SDK

---

## 🧪 PRUEBAS CON POSTMAN — Guía Completa

### Configuración inicial

1. Descargar Postman: [postman.com/downloads](https://postman.com/downloads)
2. Crear Environment: ⚙️ → **Manage Environments** → **Add**
   - Nombre: `Clinica Local`
   - Variables:

   | Variable | Valor |
   |----------|-------|
   | `base_url` | `http://localhost:8080` |
   | `jwt_token` | *(vacío — se llena automático)* |
   | `historia_id` | *(vacío — se llena automático)* |
   | `reset_token` | *(vacío — se llena automático)* |

3. Seleccionar el environment "Clinica Local" en el dropdown superior derecho

---

### 📌 REQUEST 1 — Registrar Usuario

```
Método: POST
URL:    {{base_url}}/api/auth/registrar
Header: Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre": "Juan Carlos Pérez",
  "email": "juan@test.com",
  "password": "123456"
}
```

**Tests (guardar token automático):**
```javascript
if (pm.response.code === 200) {
    const body = pm.response.json();
    if (body.success && body.data.token) {
        pm.environment.set("jwt_token", body.data.token);
        console.log("✅ Token guardado");
    }
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Registro exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "nombre": "Juan Carlos Pérez",
    "email": "juan@test.com",
    "rol": "PACIENTE"
  }
}
```

---

### 📌 REQUEST 2 — Login

```
Método: POST
URL:    {{base_url}}/api/auth/login
Header: Content-Type: application/json
```

**Body:**
```json
{
  "email": "juan@test.com",
  "password": "123456"
}
```

**Tests:**
```javascript
if (pm.response.code === 200) {
    pm.environment.set("jwt_token", pm.response.json().data.token);
    console.log("✅ Login exitoso");
}
```

---

### 📌 REQUEST 3 — Recuperar Contraseña

```
Método: POST
URL:    {{base_url}}/api/auth/forgot-password
Body:   { "email": "juan@test.com" }
```

**Tests (guardar token de reset):**
```javascript
if (pm.response.code === 200) {
    pm.environment.set("reset_token", pm.response.json().data.token);
}
```

---

### 📌 REQUEST 4 — Cambiar Contraseña

```
Método: POST
URL:    {{base_url}}/api/auth/reset-password
Body:   { "token": "{{reset_token}}", "nuevaPassword": "nueva123" }
```

---

### 📌 REQUEST 5 — Guardar Historia Clínica

```
Método: POST
URL:    {{base_url}}/api/historia
Header: Authorization: Bearer {{jwt_token}}
        Content-Type: application/json
```

**Body:**
```json
{
  "respuestas": {
    "nombre": "Juan Carlos Pérez",
    "edad": "35",
    "genero": "Masculino",
    "ciudad": "Medellín",
    "motivo_consulta": "Consumo problemático de alcohol",
    "sustancias": "Alcohol, Marihuana",
    "edad_inicio": "18",
    "sustancia_principal": "Alcohol",
    "frecuencia": "Diario",
    "ultimo_consumo": "Hace 2 días",
    "abstinencia_escala": "7",
    "atencion_psicologica": "Sí, hace 2 años",
    "atencion_psiquiatrica": "No",
    "diagnosticos": "Ansiedad generalizada",
    "medicamentos": "Ninguno",
    "ideacion": "No",
    "enfermedades": "Hipertensión leve",
    "antecedentes_familiares": "Sí",
    "cuantos_familiares": "2",
    "cuales_familiares": "Padre y hermano",
    "situacion_laboral": "Empleado",
    "red_apoyo": "Familia cercana",
    "motivacion": "Mejorar mi salud",
    "expectativas": "Abstinencia total"
  },
  "consentimientoAceptado": true
}
```

**Tests:**
```javascript
if (pm.response.code === 200) {
    pm.environment.set("historia_id", pm.response.json().data.id);
    console.log("✅ Historia ID:", pm.response.json().data.id);
}
```

---

### 📌 REQUEST 6 — Diagnóstico IA con Gemini

```
Método: POST
URL:    {{base_url}}/api/diagnostico/ia
Header: Authorization: Bearer {{jwt_token}}
        Content-Type: application/json
```

**Body:**
```json
{
  "respuestas": {
    "nombre": "Juan Carlos Pérez",
    "edad": "35",
    "motivo_consulta": "Consumo problemático de alcohol",
    "sustancia_principal": "Alcohol",
    "frecuencia": "Diario",
    "abstinencia_escala": "7",
    "ideacion": "No"
  },
  "historiaId": {{historia_id}}
}
```

> ⚠️ Requiere `app.gemini.api-key` configurado en `application.properties`

---

### 📌 REQUEST 7 — Mis Historias

```
Método: GET
URL:    {{base_url}}/api/historia/mis-historias
Header: Authorization: Bearer {{jwt_token}}
```

---

### 📌 REQUEST 8 — Formulario de Contacto (→ WhatsApp backend)

```
Método: POST
URL:    {{base_url}}/api/contacto
Body:   { "nombre": "María", "telefono": "3001234567", "tipo": "Consulta", "mensaje": "Quiero información" }
```

---

### 📌 REQUESTS ADMIN (9-12)

| # | Método | Endpoint | Descripción |
|---|--------|----------|-------------|
| 9 | GET | `{{base_url}}/api/admin/resumen` | Totales generales |
| 10 | GET | `{{base_url}}/api/admin/usuarios` | Lista de usuarios |
| 11 | GET | `{{base_url}}/api/admin/historias` | Historias clínicas |
| 12 | GET | `{{base_url}}/api/admin/contactos` | Contactos recibidos |

---

### Verificar datos en pgAdmin después de las pruebas

```sql
-- Usuarios registrados
SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY id DESC;

-- Historias clínicas con diagnóstico IA
SELECT id, nombre, nivel_riesgo, programa_recomendado, creado_en
FROM historias_clinicas ORDER BY id DESC;

-- Diagnóstico IA completo
SELECT nombre, diagnostico_ia FROM historias_clinicas WHERE id = 1;

-- Contactos
SELECT id, nombre, tipo, estado, creado_en FROM contactos;
```

---

## 🔧 CONFIGURACIÓN INTELLIJ IDEA — Detallada

### 1. Importar el proyecto Backend

```
File → Open → Seleccionar carpeta backend/ → OK
→ Clic en "Trust Project"
→ Esperar a que Maven descargue dependencias
```

### 2. Configurar JDK 21

```
File → Project Structure → Project
→ SDK: seleccionar "21" (si no aparece → "+ Add SDK → Download JDK → Version 21")
→ Language Level: 21
→ OK
```

### 3. Verificar Maven

```
View → Tool Windows → Maven
→ Expandir "holistica-backend"
→ Clic en "Reload All Maven Projects" (ícono de refresh)
→ Verificar que no haya errores rojos
```

### 4. Configurar Run/Debug Configuration

```
Run → Edit Configurations → + → Spring Boot
→ Name: ClinicaApplication
→ Main class: com.clinica.holistica.ClinicaApplication
→ Environment variables (clic en ícono carpeta):
  GEMINI_API_KEY=AIzaSy...TU_CLAVE
  MAIL_PASSWORD=tu_password_app_hotmail
→ OK
```

### 5. Ejecutar

```
Clic en ▶ Run (o Shift+F10)
→ Consola debe mostrar:
  Tomcat started on port 8080
  Started ClinicaApplication in 4.xxx seconds
```

### 6. Solución de errores comunes IntelliJ

| Error | Solución |
|-------|----------|
| `Cannot resolve symbol` | Maven → Reload All Maven Projects |
| `Cannot find JDK 21` | File → Project Structure → SDK → Download JDK 21 |
| `Port 8080 already in use` | Cambiar `server.port=8090` en application.properties |
| `Could not autowire JwtFilter` | Verificar `@Component` en JwtFilter.java |
| `H2 AUTO_SERVER error` | Verificar que H2 esté excluido en application.properties |

---

## 📦 SUBIR A GITHUB

```bash
# En la raíz del proyecto
git init

# Agregar todos los archivos (respeta .gitignore — NO sube .env ni target/)
git add .
git commit -m "feat: Consultorio Holistico Cuidate Salud Plena v1.0

- Login/Registro con JWT y BCrypt
- Historia Clínica con 24 preguntas
- Diagnóstico IA con Google Gemini
- Programas de tratamiento mes 1-4
- Audios y videos terapéuticos
- WhatsApp flotante
- Panel administrativo
- Spring Boot 3.2 + PostgreSQL + React 18"

# Crear repo en github.com → New Repository → clinica-holistica
git remote add origin https://github.com/TU_USUARIO/clinica-holistica.git
git branch -M main
git push -u origin main
```

> **Importante:** El archivo `.env` está en `.gitignore` — tus claves API y contraseñas NUNCA se suben a GitHub.

---

## 🌐 PASAR A PRODUCCIÓN

### Opción A — Railway + Vercel (Recomendado, gratis)

#### Backend en Railway:
1. Ir a [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Seleccionar repo → **Root Directory: `backend`**
3. Railway detecta el `pom.xml` automáticamente
4. **Add Service → PostgreSQL** (Railway lo conecta automático)
5. En **Settings → Variables** agregar:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://[railway-host]/railway
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=[generado por Railway]
APP_JWT_SECRET=CuidateSaludPlenaJWT2024SecretKey!SuperSegura
APP_GEMINI_API_KEY=AIzaSy...TU_CLAVE_REAL
APP_CORS_ALLOWED_ORIGINS=https://clinica-holistica.vercel.app
SPRING_MAIL_PASSWORD=tu_password_app_hotmail
```

Railway da URL como: `https://holistica-backend-production.railway.app`

#### Frontend en Vercel:
1. Ir a [vercel.com](https://vercel.com) → New Project → Import desde GitHub
2. Framework: **Vite** (detectado automático)
3. **Environment Variables:**
```
VITE_API_URL=https://holistica-backend-production.railway.app
VITE_GEMINI_API_KEY=AIzaSy...TU_CLAVE_REAL
```
4. Deploy → URL: `https://clinica-holistica.vercel.app`

5. Actualizar CORS en Railway:
```
APP_CORS_ALLOWED_ORIGINS=https://clinica-holistica.vercel.app
```

### Antes de ir a producción — Checklist:

- [ ] Cambiar `spring.jpa.hibernate.ddl-auto=update` → `validate`
- [ ] Usar clave JWT de 64+ caracteres aleatorios
- [ ] Clave Gemini real (empieza con `AIzaSy...`)
- [ ] Contraseña app Hotmail configurada
- [ ] CORS apunta al dominio real de Vercel
- [ ] HTTPS activo (Railway y Vercel lo hacen automático)
- [ ] Número WhatsApp real configurado en App.tsx
- [ ] Claves Wompi/Stripe reales para pagos

---

## 📊 TABLAS DE BASE DE DATOS

Las tablas se crean automáticamente. Estructura:

### `usuarios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL PK | Autoincremental |
| nombre | VARCHAR(150) | Nombre completo |
| email | VARCHAR(150) UNIQUE | Correo normalizado |
| password_hash | TEXT | BCrypt hash |
| rol | VARCHAR(20) | PACIENTE / ADMIN |
| activo | BOOLEAN | Cuenta activa |
| creado_en | TIMESTAMP | Fecha de registro |
| ultimo_acceso | TIMESTAMP | Último login |
| reset_token | TEXT | Token recuperar pass |

### `historias_clinicas`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL PK | |
| usuario_id | BIGINT FK | → usuarios.id |
| nombre, edad, genero... | VARCHAR | Datos del formulario |
| diagnostico_ia | TEXT | JSON completo de Gemini |
| nivel_riesgo | VARCHAR(20) | BAJO/MEDIO/ALTO/CRÍTICO |
| programa_recomendado | VARCHAR(50) | mes1/mes2/mes3/mes4 |
| consentimiento_aceptado | BOOLEAN | |
| creado_en | TIMESTAMP | |

### `contactos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL PK | |
| nombre, telefono, tipo | VARCHAR | Datos del formulario |
| mensaje | TEXT | Mensaje completo |
| estado | VARCHAR(20) | NUEVO/LEIDO/RESPONDIDO |
| creado_en | TIMESTAMP | |

---

## 🆘 ERRORES FRECUENTES

| Error | Causa | Solución |
|-------|-------|----------|
| `Connection refused :8080` | Backend no corre | IntelliJ → Run ▶ |
| `pnpm dev` falla rollup | Módulo nativo faltante | `pnpm add -D @rollup/rollup-win32-x64-msvc` |
| Login pantalla azul | (ya corregido) | Actualizar App.tsx |
| Gemini 404 error | API key inválida | Verificar empieza con `AIzaSy` |
| `H2 AUTO_SERVER error` | H2 mal configurado | Ver application.properties |
| Email no llega | Password app mal | Usar contraseña de APLICACIÓN Hotmail |
| CORS error | Frontend en URL diferente | Actualizar `app.cors.allowed-origins` |

---

## 📞 CONTACTO

- **Dr. Nikolas Escobar** — Director Médico
- **Clínica:** Consultorio Holístico Cuídate Salud Plena, Medellín, Colombia
- **Email:** mantenimientojms@hotmail.com
- **WhatsApp:** [wa.me/573001234567](https://wa.me/573001234567)
