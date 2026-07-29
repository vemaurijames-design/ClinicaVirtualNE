package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.entity.Contacto;
import com.clinica.holistica.entity.HistoriaClinica;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.ContactoRepository;
import com.clinica.holistica.repository.HistoriaClinicaRepository;
import com.clinica.holistica.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Panel administrativo — solo accesible con rol ADMIN.
 * Ver toda la información: usuarios, historias clínicas, contactos.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsuarioRepository usuarioRepo;
    private final HistoriaClinicaRepository historiaRepo;
    private final ContactoRepository contactoRepo;

    // ── Usuarios ──────────────────────────────────────────────
    @GetMapping("/usuarios")
    public ResponseEntity<ApiResponse<List<Usuario>>> usuarios() {
        return ResponseEntity.ok(ApiResponse.ok(usuarioRepo.findAll()));
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<ApiResponse<Usuario>> usuario(@PathVariable Long id) {
        return usuarioRepo.findById(id)
                .map(u -> ResponseEntity.ok(ApiResponse.ok(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Historias clínicas ────────────────────────────────────
    @GetMapping("/historias")
    public ResponseEntity<ApiResponse<List<HistoriaClinica>>> historias() {
        return ResponseEntity.ok(ApiResponse.ok(historiaRepo.findAll()));
    }

    @GetMapping("/historias/{id}")
    public ResponseEntity<ApiResponse<HistoriaClinica>> historia(@PathVariable Long id) {
        return historiaRepo.findById(id)
                .map(h -> ResponseEntity.ok(ApiResponse.ok(h)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Contactos / Solicitudes ───────────────────────────────
    @GetMapping("/contactos")
    public ResponseEntity<ApiResponse<List<Contacto>>> contactos() {
        return ResponseEntity.ok(ApiResponse.ok(contactoRepo.findAll()));
    }

    // ── Resumen general ───────────────────────────────────────
    @GetMapping("/resumen")
    public ResponseEntity<ApiResponse<Map<String, Long>>> resumen() {
        Map<String, Long> stats = Map.of(
                "totalUsuarios", usuarioRepo.count(),
                "totalHistorias", historiaRepo.count(),
                "totalContactos", contactoRepo.count()
        );
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
