# CONSULTORIO HOLÍSTICO — Guía Definitiva
## Java Spring Boot + React + PostgreSQL — Local + GitHub + Nube

---

## 1. ARQUITECTURA COMPLETA

```
clinica-holistica/                 ← Raíz del proyecto
│
├── src/                           ← FRONTEND (React 18 + TypeScript + Vite + Tailwind)
│   ├── app/
│   │   └── App.tsx               ← Toda la app (~2900 líneas)
│   └── styles/
│       └── theme.css             ← Tokens de diseño
│
├── backend/                       ← BACKEND (Spring Boot 3.2 + Java 21)
│   ├── pom.xml                   ← Dependencias Maven
│   └── src/main/
│       ├── java/com/clinica/holistica/
│       │   ├── ClinicaApplication.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java
│       │   │   ├── CorsConfig.java
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── HistoriaController.java
│       │   │   ├── DiagnosticoController.java
│       │   │   ├── ContactoController.java
│       │   │   └── AdminController.java
│       │   ├── dto/
│       │   │   ├── ApiResponse.java
│       │   │   ├── AuthRequest.java
│       │   │   ├── AuthResponse.java
│       │   │   ├── RegisterRequest.java
│       │   │   ├── HistoriaRequest.java
│       │   │   └── ContactoRequest.java
│       │   ├── entity/
│       │   │   ├── Usuario.java
│       │   │   ├── HistoriaClinica.java
│       │   │   └── Contacto.java
│       │   ├── repository/
│       │   │   ├── UsuarioRepository.java
│       │   │   ├── HistoriaClinicaRepository.java
│       │   │   └── ContactoRepository.java
│       │   ├── security/
│       │   │   ├── JwtUtil.java
│       │   │   └── JwtFilter.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── GeminiService.java
│       │       ├── HistoriaService.java
│       │       └── ContactoService.java
│       └── resources/
│           └── application.properties
│
├── .env                           ← Variables frontend (NO subir a GitHub)
├── .env.example                   ← Plantilla pública (SÍ subir)
├── .gitignore
└── package.json                   ← Configuración pnpm
```

---

## 2. TODOS LOS ARCHIVOS BACKEND — CÓDIGO COMPLETO

### pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
    <relativePath/>
  </parent>

  <groupId>com.clinica</groupId>
  <artifactId>holistica-backend</artifactId>
  <version>1.0.0</version>
  <packaging>jar</packaging>
  <name>Consultorio Holístico Backend</name>

  <properties>
    <java.version>21</java.version>
    <jjwt.version>0.11.5</jjwt.version>
  </properties>

  <dependencies>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
    <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
    <dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><scope>runtime</scope></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-api</artifactId><version>${jjwt.version}</version></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-impl</artifactId><version>${jjwt.version}</version><scope>runtime</scope></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-jackson</artifactId><version>${jjwt.version}</version><scope>runtime</scope></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-mail</artifactId></dependency>
    <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-webflux</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
    <dependency><groupId>org.springframework.security</groupId><artifactId>spring-security-test</artifactId><scope>test</scope></dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        <configuration>
          <excludes>
            <exclude><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></exclude>
          </excludes>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

---

### application.properties
```properties
spring.application.name=holistica-backend
server.port=8080

# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/clinica_holistica
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=12345678

# Hibernate — crea tablas automáticamente
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.open-in-view=false
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.h2.H2ConsoleAutoConfiguration

# JWT
app.jwt.secret=CuidateSaludPlenaJWT2024SecretKey!@#$%SuperSegura
app.jwt.expiration-ms=86400000

# Gemini AI — obtén clave GRATIS: https://aistudio.google.com/app/apikey
app.gemini.api-key=${GEMINI_API_KEY:CONFIGURA_TU_CLAVE}
app.gemini.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

# Email Hotmail
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=mantenimientojms@hotmail.com
spring.mail.password=${MAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.test-connection=false
app.mail.from=mantenimientojms@hotmail.com
app.mail.clinic-email=mantenimientojms@hotmail.com

# CORS
app.cors.allowed-origins=http://localhost:5173,http://localhost:3000,http://localhost:4173

# Logging
logging.level.com.clinica=INFO
logging.level.org.springframework.security=WARN
logging.level.org.hibernate=WARN
```

---

### ClinicaApplication.java
```java
package com.clinica.holistica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ClinicaApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClinicaApplication.class, args);
    }
}
```

---

### entity/Usuario.java
```java
package com.clinica.holistica.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data @NoArgsConstructor @AllArgsConstructor
public class Usuario {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(length = 20)
    private String rol = "PACIENTE"; // PACIENTE | MEDICO | ADMIN

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();

    private LocalDateTime ultimoAcceso;

    private String resetToken;
    private LocalDateTime resetTokenExpira;
}
```

---

### entity/HistoriaClinica.java
```java
package com.clinica.holistica.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "historias_clinicas")
@Data @NoArgsConstructor
public class HistoriaClinica {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(length = 150) private String nombre;
    @Column(length = 50)  private String edad;
    @Column(length = 50)  private String genero;
    @Column(length = 100) private String ciudad;
    @Column(length = 200) private String motivoConsulta;
    @Column(length = 300) private String sustancias;
    @Column(length = 50)  private String edadInicio;
    @Column(length = 100) private String sustanciaPrincipal;
    @Column(length = 100) private String frecuencia;
    @Column(length = 100) private String ultimoConsumo;
    private Integer abstinenciaEscala;
    @Column(length = 100) private String atencionPsicologica;
    @Column(length = 100) private String atencionPsiquiatrica;
    @Column(columnDefinition = "TEXT") private String diagnosticos;
    @Column(length = 200) private String medicamentos;
    @Column(length = 200) private String ideacion;
    @Column(length = 300) private String enfermedades;
    @Column(length = 100) private String antecedentesFamiliares;
    @Column(length = 50)  private String cuantosFamiliares;
    @Column(length = 200) private String cualesFamiliares;
    @Column(length = 100) private String situacionLaboral;
    @Column(length = 100) private String redApoyo;
    @Column(columnDefinition = "TEXT") private String motivacion;
    @Column(columnDefinition = "TEXT") private String expectativas;

    // Diagnóstico IA
    @Column(columnDefinition = "TEXT") private String diagnosticoIa;
    @Column(length = 20)  private String nivelRiesgo;
    @Column(length = 50)  private String programaRecomendado;

    @Column(updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
    private LocalDateTime actualizadoEn = LocalDateTime.now();
    private Boolean consentimientoAceptado = false;
    private LocalDateTime consentimientoFecha;

    @PreUpdate
    public void preUpdate() { this.actualizadoEn = LocalDateTime.now(); }
}
```

---

### entity/Contacto.java
```java
package com.clinica.holistica.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "contactos")
@Data @NoArgsConstructor
public class Contacto {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150) private String nombre;
    @Column(length = 20)  private String telefono;
    @Column(length = 100) private String tipo;
    @Column(columnDefinition = "TEXT", nullable = false) private String mensaje;
    @Column(length = 20)  private String estado = "NUEVO";

    @Column(updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
}
```

---

### dto/ApiResponse.java
```java
package com.clinica.holistica.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "OK", data);
    }
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
```

---

### dto/AuthRequest.java
```java
package com.clinica.holistica.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
}
```

---

### dto/AuthResponse.java
```java
package com.clinica.holistica.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String nombre;
    private String email;
    private String rol;
}
```

---

### dto/RegisterRequest.java
```java
package com.clinica.holistica.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String nombre;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 6)
    private String password;
}
```

---

### dto/HistoriaRequest.java
```java
package com.clinica.holistica.dto;

import lombok.Data;
import java.util.Map;

@Data
public class HistoriaRequest {
    private Map<String, String> respuestas;
    private Boolean consentimientoAceptado = false;
}
```

---

### dto/ContactoRequest.java
```java
package com.clinica.holistica.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactoRequest {
    @NotBlank private String nombre;
    private String telefono;
    private String tipo;
    @NotBlank private String mensaje;
}
```

---

### repository/UsuarioRepository.java
```java
package com.clinica.holistica.repository;

import com.clinica.holistica.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Usuario> findByResetToken(String resetToken);
}
```

---

### repository/HistoriaClinicaRepository.java
```java
package com.clinica.holistica.repository;

import com.clinica.holistica.entity.HistoriaClinica;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {
    List<HistoriaClinica> findByUsuarioId(Long usuarioId);
    Optional<HistoriaClinica> findTopByUsuarioIdOrderByCreadoEnDesc(Long usuarioId);
}
```

---

### repository/ContactoRepository.java
```java
package com.clinica.holistica.repository;

import com.clinica.holistica.entity.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactoRepository extends JpaRepository<Contacto, Long> {
    List<Contacto> findByEstadoOrderByCreadoEnDesc(String estado);
}
```

---

### security/JwtUtil.java
```java
package com.clinica.holistica.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email, String rol) {
        return Jwts.builder()
                .setSubject(email)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isValid(String token) {
        try { getClaims(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey()).build()
                .parseClaimsJws(token).getBody();
    }
}
```

---

### security/JwtFilter.java
```java
package com.clinica.holistica.security;

import com.clinica.holistica.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = req.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.isValid(token)) {
                String email = jwtUtil.extractEmail(token);
                usuarioRepository.findByEmail(email).ifPresent(user -> {
                    var auth = new UsernamePasswordAuthenticationToken(
                            user, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRol()))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                });
            }
        }
        chain.doFilter(req, res);
    }
}
```

---

### service/AuthService.java
```java
package com.clinica.holistica.service;

import com.clinica.holistica.dto.*;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import com.clinica.holistica.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse registrar(RegisterRequest req) {
        if (usuarioRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("El email ya está registrado");

        Usuario u = new Usuario();
        u.setNombre(req.getNombre());
        u.setEmail(req.getEmail().toLowerCase().trim());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setRol("PACIENTE");
        u.setActivo(true);
        u.setCreadoEn(LocalDateTime.now());
        usuarioRepo.save(u);

        return new AuthResponse(jwtUtil.generateToken(u.getEmail(), u.getRol()),
                u.getNombre(), u.getEmail(), u.getRol());
    }

    public AuthResponse login(AuthRequest req) {
        Usuario u = usuarioRepo.findByEmail(req.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Email o contraseña incorrectos"));

        if (!u.getActivo())
            throw new RuntimeException("Cuenta inactiva");

        if (!passwordEncoder.matches(req.getPassword(), u.getPasswordHash()))
            throw new RuntimeException("Email o contraseña incorrectos");

        u.setUltimoAcceso(LocalDateTime.now());
        usuarioRepo.save(u);

        return new AuthResponse(jwtUtil.generateToken(u.getEmail(), u.getRol()),
                u.getNombre(), u.getEmail(), u.getRol());
    }

    public String solicitarReset(String email) {
        Usuario u = usuarioRepo.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Email no encontrado"));

        String token = UUID.randomUUID().toString();
        u.setResetToken(token);
        u.setResetTokenExpira(LocalDateTime.now().plusHours(1));
        usuarioRepo.save(u);
        return token;
    }

    public void cambiarPassword(String token, String nuevaPassword) {
        Usuario u = usuarioRepo.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (u.getResetTokenExpira().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Token expirado");

        u.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        u.setResetToken(null);
        u.setResetTokenExpira(null);
        usuarioRepo.save(u);
    }
}
```

---

### service/GeminiService.java
```java
package com.clinica.holistica.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.url}")
    private String geminiUrl;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    public String analizarHistoria(Map<String, String> respuestas) {
        String prompt = construirPrompt(respuestas);

        Map<String, Object> body = Map.of(
            "contents", new Object[]{ Map.of("parts", new Object[]{ Map.of("text", prompt) }) },
            "generationConfig", Map.of("temperature", 0.3, "maxOutputTokens", 4096)
        );

        try {
            String response = webClient.post()
                .uri(geminiUrl + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            JsonNode root = mapper.readTree(response);
            String text = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            return text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
        } catch (Exception e) {
            throw new RuntimeException("Error con Gemini AI: " + e.getMessage());
        }
    }

    private String construirPrompt(Map<String, String> r) {
        return """
            Eres el Dr. Nikolas Escobar, médico especialista en adicciones del Consultorio Holístico Cuídate Salud Plena.
            Analiza la historia clínica y responde ÚNICAMENTE con JSON válido:

            {
              "resumen": "Resumen clínico en 3-4 oraciones",
              "nivel_riesgo": "BAJO|MEDIO|ALTO|CRÍTICO",
              "nivel_riesgo_justificacion": "Justificación",
              "diagnosticos": [{"codigo": "F10.2", "nombre": "DSM-5/CIE-10", "descripcion": "Descripción"}],
              "especialistas": [{"especialidad": "Psiquiatría", "prioridad": "URGENTE|PRIORITARIO|RECOMENDADO", "razon": ""}],
              "recomendaciones_inmediatas": ["Recomendación 1"],
              "plan_tratamiento": {"primera_linea": "", "segunda_linea": "", "seguimiento": ""},
              "programa_recomendado": "mes1|mes2|mes3|mes4",
              "comorbilidades": ["Comorbilidad"],
              "mensaje_al_paciente": "Mensaje cálido y motivador"
            }

            HISTORIA: nombre=%s, edad=%s, genero=%s, ciudad=%s, motivo=%s,
            sustancias=%s, edad_inicio=%s, sustancia_principal=%s, frecuencia=%s,
            ultimo_consumo=%s, abstinencia_escala=%s, atencion_psicologica=%s,
            atencion_psiquiatrica=%s, diagnosticos_previos=%s, medicamentos=%s,
            ideacion=%s, enfermedades=%s, antecedentes_familiares=%s,
            situacion_laboral=%s, red_apoyo=%s, motivacion=%s, expectativas=%s

            Responde SOLO JSON, sin texto adicional.
            """.formatted(
                r.getOrDefault("nombre","?"), r.getOrDefault("edad","?"),
                r.getOrDefault("genero","?"), r.getOrDefault("ciudad","?"),
                r.getOrDefault("motivo_consulta","?"), r.getOrDefault("sustancias","?"),
                r.getOrDefault("edad_inicio","?"), r.getOrDefault("sustancia_principal","?"),
                r.getOrDefault("frecuencia","?"), r.getOrDefault("ultimo_consumo","?"),
                r.getOrDefault("abstinencia_escala","?"), r.getOrDefault("atencion_psicologica","?"),
                r.getOrDefault("atencion_psiquiatrica","?"), r.getOrDefault("diagnosticos","?"),
                r.getOrDefault("medicamentos","?"), r.getOrDefault("ideacion","?"),
                r.getOrDefault("enfermedades","?"), r.getOrDefault("antecedentes_familiares","?"),
                r.getOrDefault("situacion_laboral","?"), r.getOrDefault("red_apoyo","?"),
                r.getOrDefault("motivacion","?"), r.getOrDefault("expectativas","?")
            );
    }
}
```

---

### service/HistoriaService.java
```java
package com.clinica.holistica.service;

import com.clinica.holistica.dto.HistoriaRequest;
import com.clinica.holistica.entity.HistoriaClinica;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.HistoriaClinicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HistoriaService {

    private final HistoriaClinicaRepository historiaRepo;

    public HistoriaClinica guardarHistoria(HistoriaRequest req, Usuario usuario) {
        Map<String, String> r = req.getRespuestas();
        HistoriaClinica h = new HistoriaClinica();

        h.setUsuario(usuario);
        h.setNombre(r.get("nombre"));
        h.setEdad(r.get("edad"));
        h.setGenero(r.get("genero"));
        h.setCiudad(r.get("ciudad"));
        h.setMotivoConsulta(r.get("motivo_consulta"));
        h.setSustancias(r.get("sustancias"));
        h.setEdadInicio(r.get("edad_inicio"));
        h.setSustanciaPrincipal(r.get("sustancia_principal"));
        h.setFrecuencia(r.get("frecuencia"));
        h.setUltimoConsumo(r.get("ultimo_consumo"));

        String escala = r.get("abstinencia_escala");
        if (escala != null && !escala.isBlank()) {
            try { h.setAbstinenciaEscala(Integer.parseInt(escala)); } catch (NumberFormatException ignored) {}
        }

        h.setAtencionPsicologica(r.get("atencion_psicologica"));
        h.setAtencionPsiquiatrica(r.get("atencion_psiquiatrica"));
        h.setDiagnosticos(r.get("diagnosticos"));
        h.setMedicamentos(r.get("medicamentos"));
        h.setIdeacion(r.get("ideacion"));
        h.setEnfermedades(r.get("enfermedades"));
        h.setAntecedentesFamiliares(r.get("antecedentes_familiares"));
        h.setCuantosFamiliares(r.get("cuantos_familiares"));
        h.setCualesFamiliares(r.get("cuales_familiares"));
        h.setSituacionLaboral(r.get("situacion_laboral"));
        h.setRedApoyo(r.get("red_apoyo"));
        h.setMotivacion(r.get("motivacion"));
        h.setExpectativas(r.get("expectativas"));
        h.setConsentimientoAceptado(req.getConsentimientoAceptado());

        if (Boolean.TRUE.equals(req.getConsentimientoAceptado()))
            h.setConsentimientoFecha(LocalDateTime.now());

        return historiaRepo.save(h);
    }

    public HistoriaClinica guardarDiagnosticoIa(Long historiaId, String diagnosticoJson,
                                                  String nivelRiesgo, String programa) {
        HistoriaClinica h = historiaRepo.findById(historiaId)
                .orElseThrow(() -> new RuntimeException("Historia no encontrada"));
        h.setDiagnosticoIa(diagnosticoJson);
        h.setNivelRiesgo(nivelRiesgo);
        h.setProgramaRecomendado(programa);
        return historiaRepo.save(h);
    }

    public List<HistoriaClinica> obtenerPorUsuario(Long usuarioId) {
        return historiaRepo.findByUsuarioId(usuarioId);
    }

    public List<HistoriaClinica> obtenerTodas() {
        return historiaRepo.findAll();
    }
}
```

---

### service/ContactoService.java
```java
package com.clinica.holistica.service;

import com.clinica.holistica.dto.ContactoRequest;
import com.clinica.holistica.entity.Contacto;
import com.clinica.holistica.repository.ContactoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactoService {

    private final ContactoRepository contactoRepo;

    public Contacto guardar(ContactoRequest req) {
        Contacto c = new Contacto();
        c.setNombre(req.getNombre());
        c.setTelefono(req.getTelefono());
        c.setTipo(req.getTipo());
        c.setMensaje(req.getMensaje());
        return contactoRepo.save(c);
    }

    public List<Contacto> obtenerTodos() {
        return contactoRepo.findAll();
    }

    public List<Contacto> obtenerNuevos() {
        return contactoRepo.findByEstadoOrderByCreadoEnDesc("NUEVO");
    }
}
```

---

### controller/AuthController.java
```java
package com.clinica.holistica.controller;

import com.clinica.holistica.dto.*;
import com.clinica.holistica.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/registrar")
    public ResponseEntity<ApiResponse<AuthResponse>> registrar(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Registro exitoso", authService.registrar(req)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", authService.login(req)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(@RequestBody Map<String, String> body) {
        String token = authService.solicitarReset(body.get("email"));
        return ResponseEntity.ok(ApiResponse.ok("Token generado",
                Map.of("token", token, "nota", "En producción llega por email")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, String> body) {
        authService.cambiarPassword(body.get("token"), body.get("nuevaPassword"));
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada", null));
    }
}
```

---

### controller/HistoriaController.java
```java
package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.dto.HistoriaRequest;
import com.clinica.holistica.entity.HistoriaClinica;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.service.HistoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/historia")
@RequiredArgsConstructor
public class HistoriaController {

    private final HistoriaService historiaService;

    @PostMapping
    public ResponseEntity<ApiResponse<HistoriaClinica>> guardar(
            @RequestBody HistoriaRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ApiResponse.ok("Historia guardada",
                historiaService.guardarHistoria(req, usuario)));
    }

    @GetMapping("/mis-historias")
    public ResponseEntity<ApiResponse<List<HistoriaClinica>>> misHistorias(
            @AuthenticationPrincipal Usuario usuario) {
        if (usuario == null)
            return ResponseEntity.status(401).body(ApiResponse.error("No autenticado"));
        return ResponseEntity.ok(ApiResponse.ok(historiaService.obtenerPorUsuario(usuario.getId())));
    }

    @GetMapping("/todas")
    public ResponseEntity<ApiResponse<List<HistoriaClinica>>> todas() {
        return ResponseEntity.ok(ApiResponse.ok(historiaService.obtenerTodas()));
    }
}
```

---

### controller/DiagnosticoController.java
```java
package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.service.GeminiService;
import com.clinica.holistica.service.HistoriaService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/diagnostico")
@RequiredArgsConstructor
public class DiagnosticoController {

    private final GeminiService geminiService;
    private final HistoriaService historiaService;
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping("/ia")
    public ResponseEntity<ApiResponse<String>> generarDiagnostico(@RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> respuestas = (Map<String, String>) body.get("respuestas");
            Long historiaId = body.get("historiaId") != null
                    ? Long.valueOf(body.get("historiaId").toString()) : null;

            String diagnosticoJson = geminiService.analizarHistoria(respuestas);

            if (historiaId != null) {
                try {
                    JsonNode node = mapper.readTree(diagnosticoJson);
                    historiaService.guardarDiagnosticoIa(historiaId, diagnosticoJson,
                            node.path("nivel_riesgo").asText("MEDIO"),
                            node.path("programa_recomendado").asText("mes1"));
                } catch (Exception ignored) {}
            }

            return ResponseEntity.ok(ApiResponse.ok("Diagnóstico generado", diagnosticoJson));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Error Gemini: " + e.getMessage()));
        }
    }
}
```

---

### controller/ContactoController.java
```java
package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.dto.ContactoRequest;
import com.clinica.holistica.entity.Contacto;
import com.clinica.holistica.service.ContactoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/contacto")
@RequiredArgsConstructor
public class ContactoController {

    private final ContactoService contactoService;

    @PostMapping
    public ResponseEntity<ApiResponse<Contacto>> guardar(@Valid @RequestBody ContactoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Mensaje enviado", contactoService.guardar(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Contacto>>> todos() {
        return ResponseEntity.ok(ApiResponse.ok(contactoService.obtenerTodos()));
    }
}
```

---

### controller/AdminController.java
```java
package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.entity.*;
import com.clinica.holistica.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsuarioRepository usuarioRepo;
    private final HistoriaClinicaRepository historiaRepo;
    private final ContactoRepository contactoRepo;

    @GetMapping("/usuarios")
    public ResponseEntity<ApiResponse<List<Usuario>>> usuarios() {
        return ResponseEntity.ok(ApiResponse.ok(usuarioRepo.findAll()));
    }

    @GetMapping("/historias")
    public ResponseEntity<ApiResponse<List<HistoriaClinica>>> historias() {
        return ResponseEntity.ok(ApiResponse.ok(historiaRepo.findAll()));
    }

    @GetMapping("/contactos")
    public ResponseEntity<ApiResponse<List<Contacto>>> contactos() {
        return ResponseEntity.ok(ApiResponse.ok(contactoRepo.findAll()));
    }

    @GetMapping("/resumen")
    public ResponseEntity<ApiResponse<Map<String, Long>>> resumen() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "totalUsuarios", usuarioRepo.count(),
                "totalHistorias", historiaRepo.count(),
                "totalContactos", contactoRepo.count()
        )));
    }
}
```

---

### config/SecurityConfig.java
```java
package com.clinica.holistica.config;

import com.clinica.holistica.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {})
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/contacto").permitAll()
                .requestMatchers("/api/diagnostico/**").permitAll()
                .requestMatchers("/api/historia/**").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

### config/CorsConfig.java
```java
package com.clinica.holistica.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

---

### config/GlobalExceptionHandler.java
```java
package com.clinica.holistica.config;

import com.clinica.holistica.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntime(RuntimeException e) {
        return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error interno: " + e.getMessage()));
    }
}
```

---

## 3. FRONTEND — Variables de entorno

### .env (NO subir a GitHub)
```
VITE_API_URL=http://localhost:8080
VITE_GEMINI_API_KEY=AIzaSy_TU_CLAVE_AQUI
```

### .env.example (SÍ subir)
```
VITE_API_URL=http://localhost:8080
VITE_GEMINI_API_KEY=AIzaSy...OBTENER_EN_aistudio.google.com
```

---

## 4. .gitignore
```gitignore
# Frontend
node_modules/
dist/
.pnpm-store/
pnpm-lock.yaml

# Variables de entorno NUNCA subir
.env
.env.local
.env.production

# Backend Java
backend/target/
backend/*.jar
*.iml
.idea/
out/

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
logs/
```

---

## 5. BASES DE DATOS — PostgreSQL

### Crear la base de datos (ejecutar en pgAdmin → Query Tool)
```sql
-- Solo necesitas ejecutar esto una vez
CREATE DATABASE clinica_holistica;
```

### Las tablas se crean AUTOMÁTICAMENTE al iniciar el backend

Hibernate crea estas tablas con `ddl-auto=update`:

```
┌─────────────────────────────────────────────────────────┐
│ TABLA: usuarios                                          │
├──────────────────┬───────────────┬──────────────────────┤
│ id               │ BIGSERIAL     │ PK autoincremental   │
│ nombre           │ VARCHAR(150)  │ Nombre completo      │
│ email            │ VARCHAR(150)  │ UNIQUE, lowercase    │
│ password_hash    │ TEXT          │ BCrypt hash          │
│ rol              │ VARCHAR(20)   │ PACIENTE/ADMIN       │
│ activo           │ BOOLEAN       │ true por defecto     │
│ creado_en        │ TIMESTAMP     │ Fecha registro       │
│ ultimo_acceso    │ TIMESTAMP     │ Último login         │
│ reset_token      │ TEXT          │ Para recuperar pass  │
│ reset_token_expira│ TIMESTAMP    │ Expiración token     │
└──────────────────┴───────────────┴──────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TABLA: historias_clinicas                                │
├──────────────────┬───────────────┬──────────────────────┤
│ id               │ BIGSERIAL     │ PK autoincremental   │
│ usuario_id       │ BIGINT FK     │ → usuarios.id        │
│ nombre           │ VARCHAR(150)  │ Nombre paciente      │
│ edad             │ VARCHAR(50)   │                      │
│ genero           │ VARCHAR(50)   │                      │
│ motivo_consulta  │ VARCHAR(200)  │                      │
│ sustancias       │ VARCHAR(300)  │                      │
│ diagnostico_ia   │ TEXT          │ JSON de Gemini       │
│ nivel_riesgo     │ VARCHAR(20)   │ BAJO/MEDIO/ALTO      │
│ programa_recom.  │ VARCHAR(50)   │ mes1/mes2/mes3/mes4  │
│ creado_en        │ TIMESTAMP     │                      │
└──────────────────┴───────────────┴──────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TABLA: contactos                                         │
├──────────────────┬───────────────┬──────────────────────┤
│ id               │ BIGSERIAL     │ PK autoincremental   │
│ nombre           │ VARCHAR(150)  │                      │
│ telefono         │ VARCHAR(20)   │                      │
│ tipo             │ VARCHAR(100)  │ Consulta/Urgencia    │
│ mensaje          │ TEXT          │                      │
│ estado           │ VARCHAR(20)   │ NUEVO/LEIDO/RESP     │
│ creado_en        │ TIMESTAMP     │                      │
└──────────────────┴───────────────┴──────────────────────┘
```

### Ver datos en pgAdmin
```sql
-- Ver todos los usuarios registrados
SELECT id, nombre, email, rol, activo, creado_en FROM usuarios;

-- Ver historias clínicas
SELECT id, nombre, edad, nivel_riesgo, programa_recomendado, creado_en
FROM historias_clinicas ORDER BY creado_en DESC;

-- Ver diagnóstico IA de una historia específica
SELECT diagnostico_ia FROM historias_clinicas WHERE id = 1;

-- Ver contactos nuevos
SELECT * FROM contactos WHERE estado = 'NUEVO';

-- Estadísticas generales
SELECT
  (SELECT COUNT(*) FROM usuarios) AS usuarios,
  (SELECT COUNT(*) FROM historias_clinicas) AS historias,
  (SELECT COUNT(*) FROM contactos) AS contactos;
```

---

## 6. EJECUCIÓN LOCAL PASO A PASO

### Paso 1 — PostgreSQL
1. Abrir pgAdmin
2. Clic derecho en Databases → Create → Database → nombre: `clinica_holistica`
3. Listo (las tablas se crean solas)

### Paso 2 — Backend en IntelliJ
1. File > Open → seleccionar carpeta `backend/`
2. Esperar descarga Maven (~2 min primera vez)
3. Editar `application.properties`:
   - `spring.datasource.password=TU_PASSWORD_POSTGRES`
   - `app.gemini.api-key=AIzaSy...TU_CLAVE`
4. Run `ClinicaApplication.java` ▶
5. Consola muestra: `Started ClinicaApplication on port 8080`

### Paso 3 — Frontend
```powershell
# En la carpeta raíz del proyecto
# Crear .env con:
# VITE_API_URL=http://localhost:8080
# VITE_GEMINI_API_KEY=AIzaSy...

pnpm install
pnpm add -D @rollup/rollup-win32-x64-msvc
pnpm add -D lightningcss-win32-x64-msvc
pnpm dev
```

Abrir: http://localhost:5173

### Paso 4 — Verificar
```
POST http://localhost:8080/api/auth/registrar
Body: {"nombre":"Juan","email":"juan@test.com","password":"123456"}
→ {"success":true,"data":{"token":"eyJ...","nombre":"Juan",...}}
```

---

## 7. SUBIR A GITHUB

```bash
# En la raíz del proyecto
git init
git add .
git commit -m "feat: Consultorio Holistico v1.0 - Spring Boot + React + PostgreSQL"

# Crear repo en github.com → New Repository → nombre: clinica-holistica
git remote add origin https://github.com/TU_USUARIO/clinica-holistica.git
git branch -M main
git push -u origin main
```

> El `.env` está en `.gitignore` — tus claves NUNCA suben a GitHub.

---

## 8. DESPLIEGUE EN LA NUBE

### OPCIÓN A — Railway + Vercel (RECOMENDADO, gratis)

**Backend → Railway:**
1. railway.app → New Project → Deploy from GitHub
2. Seleccionar repo → Root Directory: `backend`
3. Add Service → PostgreSQL (Railway lo conecta automáticamente)
4. En Variables (Settings → Variables) agregar:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://[railway-genera-esto]/railway
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=[generado por Railway]
APP_JWT_SECRET=CuidateSaludPlenaJWT2024SecretKey!@#$%SuperSegura
APP_GEMINI_API_KEY=AIzaSy...TU_CLAVE
APP_CORS_ALLOWED_ORIGINS=https://clinica-holistica.vercel.app
SPRING_MAIL_PASSWORD=TU_PASSWORD_HOTMAIL
```
→ Railway da URL: `https://holistica-backend-production.railway.app`

**Frontend → Vercel:**
1. vercel.com → New Project → Import desde GitHub
2. Framework: Vite (detectado automático)
3. Variables de entorno en Vercel:
```
VITE_API_URL=https://holistica-backend-production.railway.app
VITE_GEMINI_API_KEY=AIzaSy...TU_CLAVE
```
4. Deploy → Vercel da URL: `https://clinica-holistica.vercel.app`

5. Actualizar CORS en Railway:
```
APP_CORS_ALLOWED_ORIGINS=https://clinica-holistica.vercel.app
```

---

### OPCIÓN B — Render (gratis, arranca lento)

**Backend → Render:**
- New Web Service → GitHub → Root: `backend/`
- Build: `mvn clean package -DskipTests`
- Start: `java -jar target/holistica-backend-1.0.0.jar`
- Add PostgreSQL: New → PostgreSQL

**Frontend → Render:**
- New Static Site → Build: `pnpm install && pnpm build`
- Publish dir: `dist`

---

## 9. ENDPOINTS COMPLETOS DE LA API

| Método | Endpoint | Body | Respuesta |
|--------|----------|------|-----------|
| POST | `/api/auth/registrar` | `{nombre, email, password}` | `{token, nombre, email, rol}` |
| POST | `/api/auth/login` | `{email, password}` | `{token, nombre, email, rol}` |
| POST | `/api/auth/forgot-password` | `{email}` | `{token}` |
| POST | `/api/auth/reset-password` | `{token, nuevaPassword}` | `{}` |
| POST | `/api/historia` | `{respuestas:{...}, consentimientoAceptado}` | Historia guardada |
| GET | `/api/historia/mis-historias` | JWT en header | Lista de historias |
| GET | `/api/historia/todas` | — | Todas las historias |
| POST | `/api/diagnostico/ia` | `{respuestas:{...}, historiaId}` | JSON diagnóstico Gemini |
| POST | `/api/contacto` | `{nombre, telefono, tipo, mensaje}` | Contacto guardado |
| GET | `/api/contacto` | — | Lista contactos |
| GET | `/api/admin/usuarios` | — | Lista usuarios |
| GET | `/api/admin/historias` | — | Lista historias |
| GET | `/api/admin/resumen` | — | `{totalUsuarios, totalHistorias, totalContactos}` |

**Header para endpoints autenticados:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## 10. CHECKLIST ANTES DE PRODUCCIÓN

- [ ] Cambiar contraseña PostgreSQL por una segura
- [ ] Cambiar `app.jwt.secret` por clave de 64+ caracteres aleatorios
- [ ] Agregar clave Gemini real (AIzaSy...)
- [ ] Configurar contraseña de aplicación Hotmail (no la contraseña normal)
- [ ] En producción: cambiar `ddl-auto=update` → `validate`
- [ ] Verificar CORS apunta a tu dominio real de Vercel
- [ ] Probar registro + login + historia + diagnóstico en producción
- [ ] Activar HTTPS (Railway y Vercel lo hacen automático)
