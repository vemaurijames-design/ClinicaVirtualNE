package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/planes")
public class AdminPlanController {

    private final UsuarioRepository usuarioRepo;

    public AdminPlanController(UsuarioRepository usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }

    @PutMapping("/{usuarioId}")
    public ResponseEntity<?> activar(
            @PathVariable Long usuarioId,
            @RequestBody Map<String, String> body
    ) {
        String plan = body.getOrDefault("plan", "mes1");
        if (plan == null || plan.isBlank()) plan = "mes1";
        plan = plan.toLowerCase().trim();

        Usuario u = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + usuarioId));

        u.setPlanActivo(plan);
        u.setPlanActivoDesde(LocalDateTime.now());
        u.setPlanActivoHasta(LocalDateTime.now().plusDays(30));
        usuarioRepo.save(u);

        return ResponseEntity.ok(ApiResponse.ok("Plan activado", Map.of(
                "usuarioId", usuarioId,
                "planActivo", plan,
                "planActivoHasta", u.getPlanActivoHasta().toString()
        )));
    }
}