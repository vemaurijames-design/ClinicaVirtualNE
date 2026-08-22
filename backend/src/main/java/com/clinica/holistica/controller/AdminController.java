package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.entity.Contacto;
import com.clinica.holistica.entity.HistoriaClinica;
import com.clinica.holistica.entity.Profesional;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.ContactoRepository;
import com.clinica.holistica.repository.HistoriaClinicaRepository;
import com.clinica.holistica.repository.ProfesionalRepository;
import com.clinica.holistica.repository.UsuarioRepository;
import com.clinica.holistica.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsuarioRepository usuarioRepo;
    private final HistoriaClinicaRepository historiaRepo;
    private final ContactoRepository contactoRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ProfesionalRepository profesionalRepo;

    private boolean esAdmin(Usuario u) {
        return u != null && "ADMIN".equalsIgnoreCase(u.getRol());
    }

    private <T> ResponseEntity<ApiResponse<T>> noAuth() {
        return ResponseEntity.status(403)
                .body(ApiResponse.error("Acceso denegado — se requiere rol ADMIN"));
    }

    // ═══ USUARIOS ═══

    @GetMapping("/usuarios")
    public ResponseEntity<?> listarUsuarios(@AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();

        List<Map<String, Object>> lista = usuarioRepo.findAll().stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("nombre", u.getNombre());
            m.put("email", u.getEmail());
            m.put("rol", u.getRol());
            m.put("activo", u.getActivo());
            m.put("planActivo", u.getPlanActivo());
            m.put("planActivoDesde", u.getPlanActivoDesde());
            m.put("planActivoHasta", u.getPlanActivoHasta());
            m.put("creadoEn", u.getCreadoEn());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("OK", lista));
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> crearUsuario(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();

        try {
            String nombre = body.get("nombre");
            String email = body.get("email");
            String password = body.get("password");
            String rol = body.getOrDefault("rol", "PACIENTE");
            String telefono = body.getOrDefault("telefono", "");
            String especialidad = body.getOrDefault("especialidad", "");
            String meetLink = body.getOrDefault("meetLink", body.getOrDefault("meet_link", ""));

            if (nombre == null || nombre.isBlank()
                    || email == null || email.isBlank()
                    || password == null || password.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Nombre, email y contraseña son obligatorios"));
            }

            String emailNorm = email.trim().toLowerCase();
            if (usuarioRepo.findByEmail(emailNorm).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Ya existe un usuario con ese email"));
            }

            String r = rol.toUpperCase().trim();
            if (!List.of("PACIENTE", "ADMIN", "MEDICO", "PSICOLOGO", "PSIQUIATRA").contains(r)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Rol no válido: " + r));
            }

            // 1) Usuario (login)
            Usuario u = new Usuario();
            u.setNombre(nombre.trim());
            u.setEmail(emailNorm);
            u.setPasswordHash(passwordEncoder.encode(password));
            u.setRol(r);
            u.setActivo(true);
            u.setCreadoEn(LocalDateTime.now());
            u.setMensajesIaUsados(0);
            if (telefono != null && !telefono.isBlank()) u.setTelefono(telefono);
            if (especialidad != null && !especialidad.isBlank()) u.setEspecialidad(especialidad);
            if (meetLink != null && !meetLink.isBlank()) u.setMeetLink(meetLink);
            usuarioRepo.save(u);

            // 2) Si es personal clínico → también en profesionales (citas)
            Long profesionalId = null;
            if (List.of("MEDICO", "PSICOLOGO", "PSIQUIATRA").contains(r)) {
                String esp = (especialidad != null && !especialidad.isBlank())
                        ? especialidad
                        : r; // por defecto el rol

                // Evitar duplicado por email en profesionales
                Profesional prof = profesionalRepo.findByEmail(emailNorm).orElse(null);
                if (prof == null) {
                    prof = new Profesional();
                    prof.setNombre(nombre.trim());
                    prof.setEmail(emailNorm);
                    prof.setTelefono(telefono);
                    prof.setEspecialidad(esp);
                    prof.setMeetLink(meetLink != null && !meetLink.isBlank()
                            ? meetLink
                            : "https://meet.google.com/new");
                    prof.setModalidad("VIRTUAL");
                    prof.setActivo(true);
                    profesionalRepo.save(prof);
                } else {
                    prof.setNombre(nombre.trim());
                    prof.setEspecialidad(esp);
                    prof.setActivo(true);
                    if (meetLink != null && !meetLink.isBlank()) prof.setMeetLink(meetLink);
                    profesionalRepo.save(prof);
                }
                profesionalId = prof.getId();
            }

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", u.getId());
            data.put("nombre", u.getNombre());
            data.put("email", u.getEmail());
            data.put("rol", u.getRol());
            data.put("profesionalId", profesionalId);

            return ResponseEntity.ok(ApiResponse.ok(
                    profesionalId != null
                            ? "Usuario y profesional creados"
                            : "Usuario creado",
                    data));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<ApiResponse<Usuario>> editarUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();

        return usuarioRepo.findById(id).map(u -> {
            if (body.containsKey("nombre")) u.setNombre(body.get("nombre"));
            if (body.containsKey("rol")) u.setRol(body.get("rol"));
            if (body.containsKey("activo")) u.setActivo(Boolean.parseBoolean(body.get("activo")));
            if (body.containsKey("password") && body.get("password") != null
                    && !body.get("password").isBlank()) {
                u.setPasswordHash(passwordEncoder.encode(body.get("password")));
            }
            usuarioRepo.save(u);
            return ResponseEntity.ok(ApiResponse.ok("Usuario actualizado", u));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Usuario no encontrado")));
    }

    @PutMapping("/usuarios/{id}/activar")
    public ResponseEntity<ApiResponse<Void>> activarUsuario(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        return usuarioRepo.findById(id).map(u -> {
            u.setActivo(true);
            usuarioRepo.save(u);
            return ResponseEntity.ok(ApiResponse.<Void>ok("Usuario activado", null));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("No encontrado")));
    }

    @PutMapping("/usuarios/{id}/desactivar")
    public ResponseEntity<ApiResponse<Void>> desactivarUsuario(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        return usuarioRepo.findById(id).map(u -> {
            u.setActivo(false);
            usuarioRepo.save(u);
            return ResponseEntity.ok(ApiResponse.<Void>ok("Usuario desactivado", null));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("No encontrado")));
    }

    // ═══ HISTORIAS (con email del paciente) ═══

    @GetMapping("/historias")
    public ResponseEntity<?> listarHistorias(@AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();

        List<Map<String, Object>> lista = historiaRepo.findAllWithUsuario().stream().map(h -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", h.getId());
            m.put("nombre", h.getNombre());
            m.put("edad", h.getEdad());
            m.put("nivelRiesgo", h.getNivelRiesgo());
            m.put("programaRecomendado", h.getProgramaRecomendado());
            m.put("diagnosticoIa", h.getDiagnosticoIa());
            m.put("consentimientoAceptado", h.getConsentimientoAceptado());
            m.put("creadoEn", h.getCreadoEn() != null ? h.getCreadoEn() : h.getConsentimientoFecha());

            if (h.getUsuario() != null) {
                m.put("usuarioId", h.getUsuario().getId());
                m.put("usuarioNombre", h.getUsuario().getNombre());
                m.put("usuarioEmail", h.getUsuario().getEmail());
                m.put("planActivo", h.getUsuario().getPlanActivo());
                m.put("planActivoHasta", h.getUsuario().getPlanActivoHasta());
            } else {
                m.put("usuarioId", null);
                m.put("usuarioNombre", null);
                m.put("usuarioEmail", null);
                m.put("planActivo", null);
                m.put("planActivoHasta", null);
            }
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("OK", lista));
    }

    @GetMapping("/historias/{id}")
    public ResponseEntity<?> obtenerHistoria(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        return historiaRepo.findById(id)
                .map(h -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", h.getId());
                    m.put("nombre", h.getNombre());
                    m.put("diagnosticoIa", h.getDiagnosticoIa());
                    m.put("nivelRiesgo", h.getNivelRiesgo());
                    m.put("programaRecomendado", h.getProgramaRecomendado());
                    if (h.getUsuario() != null) {
                        m.put("usuarioEmail", h.getUsuario().getEmail());
                        m.put("usuarioNombre", h.getUsuario().getNombre());
                    }
                    return ResponseEntity.ok(ApiResponse.ok("OK", m));
                })
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Historia no encontrada")));
    }

    @DeleteMapping("/historias/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminarHistoria(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        if (!historiaRepo.existsById(id))
            return ResponseEntity.status(404).body(ApiResponse.error("Historia no encontrada"));
        historiaRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Historia eliminada", null));
    }

    // ═══ CONTACTOS ═══

    @GetMapping("/contactos")
    public ResponseEntity<ApiResponse<List<Contacto>>> listarContactos(
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        return ResponseEntity.ok(ApiResponse.ok("OK", contactoRepo.findAll()));
    }

    @PutMapping("/contactos/{id}/estado")
    public ResponseEntity<ApiResponse<Contacto>> cambiarEstadoContacto(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        return contactoRepo.findById(id).map(c -> {
            c.setEstado(body.getOrDefault("estado", "LEIDO"));
            contactoRepo.save(c);
            return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", c));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Contacto no encontrado")));
    }

    // ═══ RESUMEN ═══

    @GetMapping("/resumen")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resumen(
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        Map<String, Object> stats = Map.of(
                "totalUsuarios", usuarioRepo.count(),
                "usuariosActivos", usuarioRepo.countByActivoTrue(),
                "totalHistorias", historiaRepo.count(),
                "totalContactos", contactoRepo.count(),
                "contactosNuevos", contactoRepo.countByEstado("NUEVO")
        );
        return ResponseEntity.ok(ApiResponse.ok("OK", stats));
    }

    @PostMapping("/generar-token")
    public ResponseEntity<ApiResponse<Map<String, String>>> generarToken(
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        String token = jwtUtil.generateToken(admin.getEmail(), admin.getRol());
        return ResponseEntity.ok(ApiResponse.ok("Token generado",
                Map.of("token", token, "email", admin.getEmail())));
    }
}