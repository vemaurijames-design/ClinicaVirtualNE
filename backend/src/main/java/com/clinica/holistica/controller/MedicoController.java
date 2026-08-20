package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.dto.ObservacionRequest;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.service.MedicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medico")
public class MedicoController {

    private final MedicoService medicoService;

    public MedicoController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    private Usuario user(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("No autenticado");
        }
        return (Usuario) auth.getPrincipal();
    }

    private void assertStaff(Usuario u) {
        String rol = u.getRol() != null ? u.getRol().toUpperCase() : "";
        if (!rol.equals("MEDICO") && !rol.equals("PSICOLOGO")
                && !rol.equals("PSIQUIATRA") && !rol.equals("ADMIN")) {
            throw new RuntimeException("No autorizado. Solo personal clínico.");
        }
    }

    @GetMapping("/historias")
    public ResponseEntity<?> historias(Authentication auth) {
        try {
            assertStaff(user(auth));
            return ResponseEntity.ok(ApiResponse.ok(medicoService.listarHistorias()));
        } catch (Exception e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/historias/{id}/observaciones")
    public ResponseEntity<?> observaciones(@PathVariable Long id, Authentication auth) {
        try {
            assertStaff(user(auth));
            return ResponseEntity.ok(ApiResponse.ok(medicoService.listarObservaciones(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/historias/{id}/observaciones")
    public ResponseEntity<?> guardarObs(
            @PathVariable Long id,
            @RequestBody ObservacionRequest req,
            Authentication auth) {
        try {
            Usuario medico = user(auth);
            assertStaff(medico);
            return ResponseEntity.ok(ApiResponse.ok(
                    "Observación guardada",
                    medicoService.guardarObservacion(id, req, medico)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}