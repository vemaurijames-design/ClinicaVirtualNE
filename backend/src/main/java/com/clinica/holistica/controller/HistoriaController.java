package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.dto.HistoriaRequest;
import com.clinica.holistica.entity.HistoriaClinica;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import com.clinica.holistica.service.HistoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/historia")
public class HistoriaController {

    private final HistoriaService historiaService;
    private final UsuarioRepository usuarioRepo;

    public HistoriaController(HistoriaService historiaService, UsuarioRepository usuarioRepo) {
        this.historiaService = historiaService;
        this.usuarioRepo = usuarioRepo;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HistoriaClinica>> guardar(
            @RequestBody HistoriaRequest req,
            Authentication auth
    ) {
        Usuario usuario = usuarioActual(auth);
        HistoriaClinica h = historiaService.guardarHistoria(req, usuario);
        return ResponseEntity.ok(ApiResponse.ok("Historia guardada", h));
    }

    @GetMapping("/mias")
    public ResponseEntity<ApiResponse<List<HistoriaClinica>>> misHistorias(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Debe iniciar sesión"));
        }
        Usuario usuario = usuarioActual(auth);
        List<HistoriaClinica> lista = historiaService.obtenerPorUsuario(usuario.getId());
        return ResponseEntity.ok(ApiResponse.ok("OK", lista));
    }

    @GetMapping("/todas")
    public ResponseEntity<ApiResponse<List<HistoriaClinica>>> todas() {
        return ResponseEntity.ok(ApiResponse.ok("OK", historiaService.obtenerTodas()));
    }

    private Usuario usuarioActual(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("No autenticado");
        }
        Object p = auth.getPrincipal();
        if (p instanceof Usuario u) {
            return u;
        }
        return usuarioRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + auth.getName()));
    }

    @GetMapping("/existe")
    public ResponseEntity<?> existe(Authentication auth) {
        Usuario u = (Usuario) auth.getPrincipal(); // o usuarioActual(auth)
        List<HistoriaClinica> list = historiaService.obtenerPorUsuario(u.getId());
        Map<String, Object> data = new HashMap<>();
        data.put("tieneHistoria", !list.isEmpty());
        data.put("cantidad", list.size());
        data.put("ultimaId", list.isEmpty() ? null : list.get(0).getId());
        return ResponseEntity.ok(ApiResponse.ok("OK", data));
    }
}