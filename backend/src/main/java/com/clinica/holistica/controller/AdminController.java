package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.entity.Contacto;
import com.clinica.holistica.entity.HistoriaClinica;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.ContactoRepository;
import com.clinica.holistica.repository.HistoriaClinicaRepository;
import com.clinica.holistica.repository.UsuarioRepository;
import com.clinica.holistica.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Panel Admin — CRUD completo.
 * Todos los endpoints requieren rol ADMIN (validado con JWT).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsuarioRepository usuarioRepo;
    private final HistoriaClinicaRepository historiaRepo;
    private final ContactoRepository contactoRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ── Helpers ─────────────────────────────────────────
    private boolean esAdmin(Usuario u) {
        return u != null && "ADMIN".equals(u.getRol());
    }

    /** Genérico para que compile con cualquier tipo de respuesta */
    private <T> ResponseEntity<ApiResponse<T>> noAuth() {
        return ResponseEntity.status(403)
                .body(ApiResponse.error("Acceso denegado — se requiere rol ADMIN"));
    }

    // ════════════════════════════════════════════════════
    // USUARIOS — CRUD completo
    // ════════════════════════════════════════════════════

    @GetMapping("/usuarios")
    public ResponseEntity<ApiResponse<List<Usuario>>> listarUsuarios(
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        return ResponseEntity.ok(ApiResponse.ok("OK", usuarioRepo.findAll()));
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<ApiResponse<Usuario>> obtenerUsuario(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        return usuarioRepo.findById(id)
                .map(u -> ResponseEntity.ok(ApiResponse.ok("OK", u)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Usuario no encontrado")));
    }

    @PostMapping("/usuarios")
    public ResponseEntity<ApiResponse<Usuario>> crearUsuario(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();

        String email = body.get("email");
        if (email == null || usuarioRepo.existsByEmail(email.toLowerCase().trim()))
            return ResponseEntity.badRequest().body(ApiResponse.error("Email ya existe o es inválido"));

        Usuario u = new Usuario();
        u.setNombre(body.getOrDefault("nombre", "Sin nombre"));
        u.setEmail(email.toLowerCase().trim());
        u.setPasswordHash(passwordEncoder.encode(body.getOrDefault("password", "Clinica2024!")));
        u.setRol(body.getOrDefault("rol", "PACIENTE"));
        u.setActivo(true);
        u.setCreadoEn(LocalDateTime.now());
        usuarioRepo.save(u);
        return ResponseEntity.ok(ApiResponse.ok("Usuario creado", u));
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<ApiResponse<Usuario>> editarUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();

        return usuarioRepo.findById(id).map(u -> {
            if (body.containsKey("nombre"))   u.setNombre(body.get("nombre"));
            if (body.containsKey("rol"))      u.setRol(body.get("rol"));
            if (body.containsKey("activo"))   u.setActivo(Boolean.parseBoolean(body.get("activo")));
            if (body.containsKey("password")) u.setPasswordHash(passwordEncoder.encode(body.get("password")));
            usuarioRepo.save(u);
            return ResponseEntity.ok(ApiResponse.ok("Usuario actualizado", u));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Usuario no encontrado")));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<ApiResponse<Void>> desactivarUsuario(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();

        return usuarioRepo.findById(id).map(u -> {
            if ("ADMIN".equals(u.getRol()))
                return ResponseEntity.badRequest().<ApiResponse<Void>>body(
                        ApiResponse.error("No se puede desactivar a otro ADMIN"));
            u.setActivo(false);
            usuarioRepo.save(u);
            return ResponseEntity.ok(ApiResponse.<Void>ok("Usuario desactivado", null));
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

    // ════════════════════════════════════════════════════
    // HISTORIAS CLÍNICAS
    // ════════════════════════════════════════════════════

    @GetMapping("/historias")
    public ResponseEntity<ApiResponse<List<HistoriaClinica>>> listarHistorias(
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        return ResponseEntity.ok(ApiResponse.ok("OK", historiaRepo.findAll()));
    }

    @GetMapping("/historias/{id}")
    public ResponseEntity<ApiResponse<HistoriaClinica>> obtenerHistoria(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        return historiaRepo.findById(id)
                .map(h -> ResponseEntity.ok(ApiResponse.ok("OK", h)))
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

    // ════════════════════════════════════════════════════
    // CONTACTOS
    // ════════════════════════════════════════════════════

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

    // ════════════════════════════════════════════════════
    // RESUMEN / DASHBOARD
    // ════════════════════════════════════════════════════

    @GetMapping("/resumen")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resumen(
            @AuthenticationPrincipal Usuario admin) {
        if (!esAdmin(admin)) return noAuth();
        Map<String, Object> stats = Map.of(
                "totalUsuarios",   usuarioRepo.count(),
                "usuariosActivos", usuarioRepo.countByActivoTrue(),
                "totalHistorias",  historiaRepo.count(),
                "totalContactos",  contactoRepo.count(),
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