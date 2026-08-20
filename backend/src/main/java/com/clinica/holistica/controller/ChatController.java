package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import com.clinica.holistica.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final GeminiService geminiService;
    private final UsuarioRepository usuarioRepo;
    private static final int GRATIS = 6;

    public ChatController(GeminiService geminiService, UsuarioRepository usuarioRepo) {
        this.geminiService = geminiService;
        this.usuarioRepo = usuarioRepo;
    }

    @PostMapping("/acompanamiento")
    public ResponseEntity<?> acompanamiento(@RequestBody Map<String, String> body,
                                            Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Debe iniciar sesión"));
        }

        Usuario u = (Usuario) auth.getPrincipal();
        u = usuarioRepo.findById(u.getId()).orElse(u);

        int usados = u.getMensajesIaUsados();
        boolean tienePlan = u.getPlanActivo() != null
                && !u.getPlanActivo().isBlank()
                && (u.getPlanActivoHasta() == null
                || u.getPlanActivoHasta().isAfter(LocalDateTime.now()));

        if (usados >= GRATIS && !tienePlan) {
            return ResponseEntity.status(402).body(ApiResponse.error(
                    "Has usado tus mensajes gratuitos. Activa el Programa Mes 1 para continuar."
            ));
        }

        String mensaje = body.get("mensaje");
        if (mensaje == null || mensaje.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mensaje vacío"));
        }

        String respuesta = geminiService.generarTextoLibre(construirPromptAcompanamiento(u, mensaje));

        u.setMensajesIaUsados(usados + 1);
        usuarioRepo.save(u);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "respuesta", respuesta,
                "mensajesUsados", u.getMensajesIaUsados(),
                "limiteGratis", GRATIS,
                "tienePlan", tienePlan,
                "requierePago", !tienePlan && u.getMensajesIaUsados() >= GRATIS
        )));
    }

    private String construirPromptAcompanamiento(Usuario u, String mensaje) {
        String nombre = u.getNombre() != null ? u.getNombre().split(" ")[0] : "paciente";
        return """
            Eres un profesional de salud mental de la Clínica Virtual (Consultorio Holístico, Colombia).
            Escuchas con empatía temas de adicciones, ansiedad y estrés.
            No digas en cada mensaje que eres una IA. Sé cálido y breve.
            Si es natural, orienta al Programa Mes 1 y a agendar consulta.
            Emergencia: Línea de la Vida 800-911-2000 o 123.

            Paciente: %s
            Mensaje: %s

            Responde en español, 2 a 5 oraciones.
            """.formatted(nombre, mensaje);
    }
}