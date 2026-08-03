# GUÍA POSTMAN — Consultorio Holístico
## Validación completa del Backend Java Spring Boot

---

## CONFIGURACIÓN INICIAL EN POSTMAN

### 1. Crear variable de entorno en Postman

1. Clic en **Environments** (engranaje arriba a la derecha)
2. New Environment → nombre: `Clinica Holistica Local`
3. Agregar estas variables:

| Variable | Valor inicial | Valor actual |
|----------|--------------|--------------|
| `base_url` | `http://localhost:8080` | `http://localhost:8080` |
| `jwt_token` | *(vacío)* | *(se llena automáticamente)* |

4. Guardar y seleccionar este environment en el dropdown superior derecho de Postman.

---

## PASO 1 — REGISTRAR USUARIO

**Método:** `POST`  
**URL:** `{{base_url}}/api/auth/registrar`

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "nombre": "Juan Carlos Pérez",
  "email": "juan@test.com",
  "password": "123456"
}
```

**Respuesta esperada (200 OK):**
```json
{
  "success": true,
  "message": "Registro exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuQHRlc3QuY29tIiwicm9sIjoiUEFDSUVOVEUi...",
    "nombre": "Juan Carlos Pérez",
    "email": "juan@test.com",
    "rol": "PACIENTE"
  }
}
```

### Guardar el token automáticamente en Postman:
1. En la request de registro, ir a pestaña **Tests**
2. Pegar este script:
```javascript
if (pm.response.code === 200) {
    const body = pm.response.json();
    if (body.success && body.data && body.data.token) {
        pm.environment.set("jwt_token", body.data.token);
        console.log("Token guardado:", body.data.token.substring(0, 30) + "...");
    }
}
```
3. Send → el token queda guardado en `{{jwt_token}}`

---

## PASO 2 — INICIAR SESIÓN (LOGIN)

**Método:** `POST`  
**URL:** `{{base_url}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "email": "juan@test.com",
  "password": "123456"
}
```

**Respuesta esperada (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "nombre": "Juan Carlos Pérez",
    "email": "juan@test.com",
    "rol": "PACIENTE"
  }
}
```

**Tests (pestaña Tests):**
```javascript
if (pm.response.code === 200) {
    const body = pm.response.json();
    if (body.success && body.data.token) {
        pm.environment.set("jwt_token", body.data.token);
        console.log("Login exitoso, token actualizado");
    }
}
```

**Error de credenciales incorrectas (400):**
```json
{
  "success": false,
  "message": "Email o contraseña incorrectos",
  "data": null
}
```

---

## PASO 3 — SOLICITAR RESET DE CONTRASEÑA

**Método:** `POST`  
**URL:** `{{base_url}}/api/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "juan@test.com"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Token generado",
  "data": {
    "token": "a3f8b2c1-d4e5-...",
    "nota": "En producción este token llega por email"
  }
}
```

> **Nota:** El token se muestra en la respuesta solo en modo desarrollo. En producción llegaría al email del usuario.

---

## PASO 4 — CAMBIAR CONTRASEÑA CON TOKEN

**Método:** `POST`  
**URL:** `{{base_url}}/api/auth/reset-password`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "token": "a3f8b2c1-d4e5-...",
  "nuevaPassword": "nuevaPass456"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Contraseña actualizada",
  "data": null
}
```

---

## PASO 5 — GUARDAR HISTORIA CLÍNICA

> **Requiere:** Token JWT en el header Authorization.

**Método:** `POST`  
**URL:** `{{base_url}}/api/historia`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw → JSON):**
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
    "diagnosticos": "Ninguno",
    "medicamentos": "Ninguno",
    "ideacion": "No",
    "enfermedades": "Ninguna",
    "antecedentes_familiares": "Sí",
    "cuantos_familiares": "2",
    "cuales_familiares": "Padre, hermano",
    "situacion_laboral": "Empleado",
    "red_apoyo": "Familia cercana",
    "motivacion": "Quiero mejorar mi salud y mi familia",
    "expectativas": "Dejar el alcohol completamente"
  },
  "consentimientoAceptado": true
}
```

**Respuesta esperada (200 OK):**
```json
{
  "success": true,
  "message": "Historia guardada",
  "data": {
    "id": 1,
    "nombre": "Juan Carlos Pérez",
    "edad": "35",
    "genero": "Masculino",
    "ciudad": "Medellín",
    "motivoConsulta": "Consumo problemático de alcohol",
    "sustancias": "Alcohol, Marihuana",
    "sustanciaPrincipal": "Alcohol",
    "nivelRiesgo": null,
    "programaRecomendado": null,
    "diagnosticoIa": null,
    "consentimientoAceptado": true,
    "creadoEn": "2025-07-31T10:30:00"
  }
}
```

**Guardar el historiaId en Tests:**
```javascript
if (pm.response.code === 200) {
    const body = pm.response.json();
    if (body.success && body.data && body.data.id) {
        pm.environment.set("historia_id", body.data.id);
        console.log("Historia ID guardado:", body.data.id);
    }
}
```

---

## PASO 6 — GENERAR DIAGNÓSTICO IA (Gemini)

> **Requiere:** Historia clínica completada + Clave Gemini configurada en `application.properties`.

**Método:** `POST`  
**URL:** `{{base_url}}/api/diagnostico/ia`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
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
    "sustancia_principal": "Alcohol",
    "frecuencia": "Diario",
    "ultimo_consumo": "Hace 2 días",
    "abstinencia_escala": "7",
    "atencion_psicologica": "Sí",
    "atencion_psiquiatrica": "No",
    "diagnosticos": "Ninguno",
    "medicamentos": "Ninguno",
    "ideacion": "No",
    "enfermedades": "Ninguna",
    "antecedentes_familiares": "Sí - padre y hermano",
    "situacion_laboral": "Empleado",
    "red_apoyo": "Familia",
    "motivacion": "Mejorar salud",
    "expectativas": "Abstinencia total"
  },
  "historiaId": 1
}
```

**Respuesta esperada (200 OK):**
```json
{
  "success": true,
  "message": "Diagnóstico generado",
  "data": "{\"resumen\":\"El paciente Juan Carlos...\",\"nivel_riesgo\":\"ALTO\",\"diagnosticos\":[{\"codigo\":\"F10.2\",\"nombre\":\"Trastorno por uso de alcohol...\"}],\"programa_recomendado\":\"mes1\",\"mensaje_al_paciente\":\"...\"}"
}
```

> El campo `data` contiene el JSON de Gemini como string. El frontend lo parsea automáticamente.

**Si la clave Gemini no está configurada (500):**
```json
{
  "success": false,
  "message": "Error Gemini: Error con Gemini AI: ...",
  "data": null
}
```
→ Solución: agregar `app.gemini.api-key=AIzaSy...` en `application.properties`.

---

## PASO 7 — VER MIS HISTORIAS (usuario autenticado)

**Método:** `GET`  
**URL:** `{{base_url}}/api/historia/mis-historias`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "nombre": "Juan Carlos Pérez",
      "nivelRiesgo": "ALTO",
      "programaRecomendado": "mes1",
      "creadoEn": "2025-07-31T10:30:00"
    }
  ]
}
```

---

## PASO 8 — FORMULARIO DE CONTACTO

**Método:** `POST`  
**URL:** `{{base_url}}/api/contacto`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "María López",
  "telefono": "3001234567",
  "tipo": "Consulta",
  "mensaje": "Quiero saber más sobre los programas de tratamiento para adicción al alcohol."
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Mensaje enviado",
  "data": {
    "id": 1,
    "nombre": "María López",
    "telefono": "3001234567",
    "tipo": "Consulta",
    "mensaje": "Quiero saber más...",
    "estado": "NUEVO",
    "creadoEn": "2025-07-31T11:00:00"
  }
}
```

---

## PASO 9 — PANEL ADMIN: RESUMEN

**Método:** `GET`  
**URL:** `{{base_url}}/api/admin/resumen`

**Respuesta:**
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "totalUsuarios": 5,
    "totalHistorias": 12,
    "totalContactos": 3
  }
}
```

---

## PASO 10 — ADMIN: VER TODOS LOS USUARIOS

**Método:** `GET`  
**URL:** `{{base_url}}/api/admin/usuarios`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan Carlos Pérez",
      "email": "juan@test.com",
      "rol": "PACIENTE",
      "activo": true,
      "creadoEn": "2025-07-31T10:00:00",
      "ultimoAcceso": "2025-07-31T10:30:00"
    }
  ]
}
```

---

## PASO 11 — ADMIN: VER TODAS LAS HISTORIAS CLÍNICAS

**Método:** `GET`  
**URL:** `{{base_url}}/api/admin/historias`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan Carlos Pérez",
      "edad": "35",
      "nivelRiesgo": "ALTO",
      "programaRecomendado": "mes1",
      "diagnosticoIa": "{...json de Gemini...}",
      "consentimientoAceptado": true,
      "creadoEn": "2025-07-31T10:30:00"
    }
  ]
}
```

---

## PASO 12 — ADMIN: VER CONTACTOS

**Método:** `GET`  
**URL:** `{{base_url}}/api/admin/contactos`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "María López",
      "tipo": "Consulta",
      "mensaje": "Quiero saber más...",
      "estado": "NUEVO",
      "creadoEn": "2025-07-31T11:00:00"
    }
  ]
}
```

---

## TABLA RESUMEN — TODOS LOS ENDPOINTS

| # | Método | Endpoint | Auth | Descripción |
|---|--------|----------|------|-------------|
| 1 | POST | `/api/auth/registrar` | No | Crear cuenta |
| 2 | POST | `/api/auth/login` | No | Iniciar sesión → JWT |
| 3 | POST | `/api/auth/forgot-password` | No | Solicitar token reset |
| 4 | POST | `/api/auth/reset-password` | No | Cambiar contraseña |
| 5 | POST | `/api/historia` | JWT opcional | Guardar historia clínica |
| 6 | GET | `/api/historia/mis-historias` | JWT requerido | Ver mis historias |
| 7 | GET | `/api/historia/todas` | No | Admin: todas las historias |
| 8 | POST | `/api/diagnostico/ia` | JWT opcional | Diagnóstico con Gemini AI |
| 9 | POST | `/api/contacto` | No | Enviar formulario contacto |
| 10 | GET | `/api/contacto` | No | Ver contactos |
| 11 | GET | `/api/admin/usuarios` | No | Admin: lista usuarios |
| 12 | GET | `/api/admin/historias` | No | Admin: lista historias |
| 13 | GET | `/api/admin/contactos` | No | Admin: lista contactos |
| 14 | GET | `/api/admin/resumen` | No | Admin: estadísticas |

---

## VERIFICAR DATOS EN PostgreSQL (pgAdmin)

Después de hacer las pruebas Postman, verifica en pgAdmin → Query Tool:

```sql
-- Ver usuarios registrados
SELECT id, nombre, email, rol, activo, creado_en FROM usuarios ORDER BY id DESC;

-- Ver historias clínicas guardadas
SELECT id, nombre, edad, nivel_riesgo, programa_recomendado, creado_en
FROM historias_clinicas ORDER BY id DESC;

-- Ver el diagnóstico IA de la última historia
SELECT id, nombre, nivel_riesgo, diagnostico_ia
FROM historias_clinicas ORDER BY id DESC LIMIT 1;

-- Ver contactos
SELECT id, nombre, tipo, estado, creado_en FROM contactos;

-- Estadísticas generales
SELECT
  (SELECT COUNT(*) FROM usuarios) as usuarios,
  (SELECT COUNT(*) FROM historias_clinicas) as historias,
  (SELECT COUNT(*) FROM contactos) as contactos;
```

---

## FLUJO FRONTEND ↔ BACKEND — QUÉ HACE CADA PANTALLA

```
/auth (Login/Registro)
  → POST /api/auth/registrar  { nombre, email, password }
  → POST /api/auth/login      { email, password }
  → Guarda JWT en localStorage como "ch_jwt"
  → Navega a /historia

/historia (Cuestionario clínico)
  → Guarda respuestas en localStorage como "ch_answers"
  → Al terminar: POST /api/historia { respuestas, consentimientoAceptado: true }
  → Guarda historiaId en localStorage como "ch_historia_id"
  → Navega a /diagnostico

/diagnostico (IA con Gemini)
  → Intenta POST /api/diagnostico/ia { respuestas, historiaId } via backend
  → Si backend falla → llama directamente a Gemini con VITE_GEMINI_API_KEY
  → Muestra resultado: nivel riesgo, diagnósticos DSM-5, programa recomendado
```

---

## ERRORES COMUNES Y SOLUCIONES

| Error | Causa | Solución |
|-------|-------|----------|
| `"GET is not supported"` | Abriste el endpoint en el navegador | Usa Postman con método POST |
| `"El email ya está registrado"` | Mismo email usado dos veces | Usa email diferente o login |
| `"Email o contraseña incorrectos"` | Credenciales incorrectas | Verificar email/pass en pgAdmin |
| `"Error con Gemini AI"` | API key inválida o no configurada | Agregar clave en application.properties |
| `Connection refused` | Backend no está corriendo | Iniciar IntelliJ → Run ClinicaApplication |
| `CORS error en consola` | Frontend en URL no permitida | Verificar app.cors.allowed-origins |
| `401 Unauthorized` | Sin JWT en header | Agregar `Authorization: Bearer {{jwt_token}}` |
