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

    // Guardar historia clínica (público — el usuario puede no estar autenticado)
    @PostMapping
    public ResponseEntity<ApiResponse<HistoriaClinica>> guardar(
            @RequestBody HistoriaRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        HistoriaClinica h = historiaService.guardarHistoria(req, usuario);
        return ResponseEntity.ok(ApiResponse.ok("Historia guardada", h));
    }

    // Mis historias (requiere autenticación)
    @GetMapping("/mis-historias")
    public ResponseEntity<ApiResponse<List<HistoriaClinica>>> misHistorias(
            @AuthenticationPrincipal Usuario usuario) {
        if (usuario == null) return ResponseEntity.status(401).body(ApiResponse.error("No autenticado"));
        return ResponseEntity.ok(ApiResponse.ok(historiaService.obtenerPorUsuario(usuario.getId())));
    }

    // Admin: todas las historias
    @GetMapping("/todas")
    public ResponseEntity<ApiResponse<List<HistoriaClinica>>> todas() {
        return ResponseEntity.ok(ApiResponse.ok(historiaService.obtenerTodas()));
    }
}
