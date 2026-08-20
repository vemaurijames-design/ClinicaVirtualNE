package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.dto.CitaRequest;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import com.clinica.holistica.service.CitaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    private final CitaService citaService;
    private final UsuarioRepository usuarioRepository;

    public CitaController(CitaService citaService, UsuarioRepository usuarioRepository) {
        this.citaService = citaService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/profesionales")
    public ResponseEntity<?> profesionales() {
        return ResponseEntity.ok(ApiResponse.ok(citaService.profesionales()));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CitaRequest req, Authentication auth) {
        try {
            Usuario paciente = resolverUsuario(auth);
            return ResponseEntity.ok(ApiResponse.ok(
                    "Cita registrada. Se notificó por correo.",
                    citaService.agendar(req, paciente)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            e.getMessage() != null ? e.getMessage() : "Error al agendar"));
        }
    }

    @GetMapping("/mias")
    public ResponseEntity<?> mias(Authentication auth) {
        try {
            Usuario paciente = resolverUsuario(auth);
            return ResponseEntity.ok(ApiResponse.ok(citaService.mias(paciente.getId())));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            e.getMessage() != null ? e.getMessage() : "Error"));
        }
    }

    private Usuario resolverUsuario(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Debe iniciar sesión");
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof Usuario u) {
            return u;
        }

        String email;
        if (principal instanceof UserDetails ud) {
            email = ud.getUsername();
        } else if (principal instanceof String s) {
            email = s;
        } else {
            email = auth.getName();
        }

        if (email == null || email.isBlank()) {
            throw new RuntimeException("No se pudo identificar al usuario");
        }

        String finalEmail = email;
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + finalEmail));
    }
}