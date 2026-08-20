package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.entity.HistoriaClinica;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import com.clinica.holistica.service.AcompanamientoService;
import com.clinica.holistica.service.HistoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AcompanamientoService acompanamientoService;
    private final HistoriaService historiaService;
    private final UsuarioRepository usuarioRepo;

    public ChatController(
            AcompanamientoService acompanamientoService,
            HistoriaService historiaService,
            UsuarioRepository usuarioRepo
    ) {
        this.acompanamientoService = acompanamientoService;
        this.historiaService = historiaService;
        this.usuarioRepo = usuarioRepo;
    }

    @PostMapping("/acompanamiento")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        Usuario usuario = usuarioActual(auth);
        String mensaje = body.getOrDefault("mensaje", "").trim();

        if (mensaje.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Mensaje vacío"));
        }

        List<HistoriaClinica> historias = historiaService.obtenerPorUsuario(usuario.getId());
        if (historias.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Debe completar primero la historia clínica"));
        }

        HistoriaClinica ultima = historias.get(0);
        String respuesta = acompanamientoService.responder(
                usuario.getNombre(),
                ultima.getDiagnosticoIa(),
                ultima.getNivelRiesgo(),
                ultima.getProgramaRecomendado(),
                mensaje
        );

        Map<String, String> data = new HashMap<>();
        data.put("respuesta", respuesta);
        return ResponseEntity.ok(ApiResponse.ok("OK", data));
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
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}