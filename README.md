# Consultorio Holístico — Cuídate Salud Plena

Plataforma web para el Dr. Nikolas Escobar. Historia clínica con diagnóstico IA (Gemini), autenticación JWT, panel de administración y programas de tratamiento.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Spring Boot 3.2.5 + Java 21 + Maven |
| Base de datos | PostgreSQL 15+ |
| IA diagnóstico | Google Gemini 1.5 Flash |
| Autenticación | JWT (jjwt 0.11.5) + BCrypt |

---

## Requisitos previos

- **Java 21** (JDK 21) — [https://adoptium.net](https://adoptium.net)
- **Maven 3.9+** (IntelliJ lo incluye)
- **Node.js v20+** — [https://nodejs.org](https://nodejs.org)
- **pnpm** — `npm install -g pnpm`
- **PostgreSQL 15+** — [https://www.postgresql.org/download](https://www.postgresql.org/download)
- **IntelliJ IDEA** (Community o Ultimate)

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/clinica-holistica.git
cd clinica-holistica
```

---

## 2. Configurar PostgreSQL

### En pgAdmin 4 o psql:

```sql
-- Crear la base de datos
CREATE DATABASE clinica_holistica;

-- (Opcional) Crear usuario dedicado
CREATE USER clinica_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE clinica_holistica TO clinica_user;
```

> Las tablas `usuarios`, `historias_clinicas` y `contactos` se crean automáticamente al iniciar el backend (Hibernate `ddl-auto=update`).

---

## 3. Configurar el Backend

### 3.1 Editar application.properties

Abre `backend/src/main/resources/application.properties` y ajusta:

```properties
# PostgreSQL — cambia si tu usuario/contraseña son diferentes
spring.datasource.url=jdbc:postgresql://localhost:5432/clinica_holistica
spring.datasource.username=postgres
spring.datasource.password=12345678

# Gemini AI — obtén tu clave GRATIS en https://aistudio.google.com/app/apikey
app.gemini.api-key=AIzaSy...TU_CLAVE_AQUI

# Email Outlook/Hotmail — contraseña de aplicación (no la normal)
spring.mail.username=mantenimientojms@hotmail.com
spring.mail.password=TU_PASSWORD_APP_HOTMAIL
```

### 3.2 Obtener clave Gemini API

1. Ve a [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Inicia sesión con Google
3. Clic en **"Create API Key"**
4. Copia la clave (empieza con `AIzaSy...`)
5. Pégala en `app.gemini.api-key=`

### 3.3 Obtener contraseña de aplicación Hotmail (opcional)

Para que lleguen los correos de recuperación de contraseña:
1. Ve a [https://account.microsoft.com/security](https://account.microsoft.com/security)
2. **Seguridad avanzada** → **Contraseñas de aplicación**
3. Crea una nueva → copia la clave de 16 caracteres
4. Pégala en `spring.mail.password=`

> Si no configuras el correo, la app funciona igual. El reseteo de contraseña fallará silenciosamente.

### 3.4 Ejecutar en IntelliJ IDEA

1. Abre IntelliJ → **File > Open** → selecciona la carpeta `backend/`
2. IntelliJ detecta el `pom.xml` automáticamente — clic en **"Trust Project"**
3. Espera a que Maven descargue dependencias (~2 minutos)
4. Abre `src/main/java/com/clinica/holistica/ClinicaApplication.java`
5. Clic en el triángulo verde ▶ junto a `main` → **Run**
6. En la consola verás: `Started ClinicaApplication on port 8080`

#### Verificar que funciona:
```
GET http://localhost:8080/api/auth/login
# Debe responder 400 Bad Request (no 404 = backend activo)
```

---

## 4. Configurar el Frontend

### 4.1 Variables de entorno

Crea el archivo `.env` en la raíz del proyecto frontend:

```bash
# En la carpeta raíz (donde está package.json)
cp .env.example .env   # si existe, o créalo manualmente
```

Contenido del `.env`:

```
VITE_API_URL=http://localhost:8080
VITE_GEMINI_API_KEY=AIzaSy...TU_CLAVE_AQUI
```

### 4.2 Instalar y ejecutar

```bash
# En la carpeta raíz del proyecto
pnpm install
pnpm run dev
```

Abre: [http://localhost:5173](http://localhost:5173)

#### Si hay error de módulos nativos (Windows):
```bash
rmdir /s /q node_modules
del pnpm-lock.yaml
pnpm store prune
pnpm install
pnpm add -D lightningcss-win32-x64-msvc
pnpm run dev
```

---

## 5. Flujo completo de uso

```
1. Abrir http://localhost:5173
2. Clic en "Iniciar Sesión" → "Registrarse"
3. Crear cuenta con nombre, correo y contraseña (mín. 6 caracteres)
4. Ir a "Historia Clínica" → completar el cuestionario
5. Al final, el sistema llama a Gemini y genera el diagnóstico IA
6. Ver resultado con nivel de riesgo, diagnósticos y programa recomendado
7. Panel Admin: http://localhost:5173/admin (ver todas las historias)
```

---

## 6. Estructura del proyecto

```
clinica-holistica/
├── src/                          # Frontend React
│   ├── app/
│   │   └── App.tsx               # Componente principal (~2900 líneas)
│   ├── styles/
│   │   ├── theme.css             # Tokens Tailwind
│   │   └── fonts.css             # Google Fonts
│   └── imports/                  # Imágenes
├── backend/                      # Spring Boot
│   ├── src/main/java/com/clinica/holistica/
│   │   ├── ClinicaApplication.java
│   │   ├── config/               # Security, CORS, ExceptionHandler
│   │   ├── controller/           # Auth, Historia, Diagnostico, Contacto, Admin
│   │   ├── dto/                  # Request/Response DTOs
│   │   ├── entity/               # Usuario, HistoriaClinica, Contacto
│   │   ├── repository/           # JPA Repositories
│   │   ├── security/             # JwtUtil, JwtFilter
│   │   └── service/              # Auth, Historia, Gemini, Contacto
│   └── src/main/resources/
│       └── application.properties
├── .env                          # Variables frontend (NO subir a GitHub)
├── .gitignore
└── README.md
```

---

## 7. API Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/registrar` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión, retorna JWT |
| POST | `/api/auth/forgot-password` | Solicitar reset de contraseña |
| POST | `/api/auth/reset-password` | Cambiar contraseña con token |
| POST | `/api/historia` | Guardar historia clínica |
| GET | `/api/historia/mis-historias` | Historias del usuario (JWT) |
| POST | `/api/diagnostico/ia` | Generar diagnóstico con Gemini |
| POST | `/api/contacto` | Formulario de contacto |
| GET | `/api/admin/usuarios` | Listar usuarios (admin) |
| GET | `/api/admin/resumen` | Dashboard estadísticas |

---

## 8. Base de datos — Tablas creadas automáticamente

### `usuarios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL | PK autoincremental |
| nombre | VARCHAR(200) | Nombre completo |
| email | VARCHAR(255) | Único, lowercase |
| password_hash | VARCHAR(255) | BCrypt |
| rol | VARCHAR(50) | PACIENTE / ADMIN |
| activo | BOOLEAN | true por defecto |
| creado_en | TIMESTAMP | Fecha registro |

### `historias_clinicas`
Contiene todos los campos del cuestionario clínico + `diagnostico_ia` (JSON de Gemini) + `nivel_riesgo` + `programa_recomendado`.

### `contactos`
Formulario de contacto: nombre, teléfono, tipo, mensaje, estado.

---

## 9. Subir a GitHub

```bash
# Desde la raíz del proyecto
git init
git add .
git commit -m "feat: Consultorio Holístico - primera versión completa"

# Crear repo en github.com y conectar
git remote add origin https://github.com/TU_USUARIO/clinica-holistica.git
git branch -M main
git push -u origin main
```

> **IMPORTANTE:** El archivo `.env` está en `.gitignore` y NO se sube. Nunca subas claves API a GitHub.

---

## 10. Soporte

- Correo: mantenimientojms@hotmail.com
- Dr. Nikolas Escobar — Consultorio Holístico Cuídate Salud Plena, Medellín, Colombia
