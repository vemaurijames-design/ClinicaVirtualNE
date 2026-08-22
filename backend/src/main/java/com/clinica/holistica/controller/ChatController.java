package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.dto.ChatRequest;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import com.clinica.holistica.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
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
    public ResponseEntity<?> acompanamiento(@RequestBody ChatRequest req,
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

        String mensaje = req != null ? req.getMensaje() : null;
        if (mensaje == null || mensaje.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mensaje vacío"));
        }

        String prompt = construirPrompt(
                u,
                mensaje,
                req.getRolProfesional(),
                req.getMotivoCita(),
                req.getPrograma(),
                req.getHistorial(),
                req.getFase()
        );

        String respuesta = geminiService.generarTextoLibre(prompt);

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

    private String construirPrompt(
            Usuario u,
            String mensaje,
            String rol,
            String motivo,
            String programa,
            List<Map<String, String>> historial,
            String fase
    ) {
        String nombre = (u.getNombre() != null && !u.getNombre().isBlank())
                ? u.getNombre().split(" ")[0]
                : "paciente";

        String rolDesc = getString(rol);

        // Nunca hacer switch sobre null
        String faseNorm = (fase != null && !fase.isBlank()) ? fase.trim().toUpperCase() : "ESCUCHAR";

        String instruccionFase;
        if ("CIERRE".equals(faseNorm)) {
            instruccionFase = "FASE CIERRE: Resume en 2-3 frases, da 1 recomendación práctica y orienta a plan/audios/cita. No hagas más preguntas abiertas.";
        } else if ("RECOMENDAR".equals(faseNorm)) {
            instruccionFase = "FASE RECOMENDAR: Valida y da 1-2 orientaciones. Si no tiene plan, menciona Mes 1 con naturalidad. Máximo una pregunta breve.";
        } else {
            instruccionFase = "FASE ESCUCHAR: Empatía, 2 a 4 oraciones, una sola pregunta abierta. No vendas en cada mensaje. No digas que eres una IA.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(rolDesc).append("\n");
        sb.append(instruccionFase).append("\n");
        sb.append("Clínica Virtual Colombia. Salud mental, adicciones e impacto emocional. Español natural.\n");
        sb.append("Paciente: ").append(nombre).append("\n");
        if (programa != null && !programa.isBlank()) {
            sb.append("Plan activo: ").append(programa).append("\n");
        }
        if (motivo != null && !motivo.isBlank()) {
            sb.append("Motivo de la cita: ").append(motivo).append("\n");
        }
        if (historial != null && !historial.isEmpty()) {
            sb.append("Historial reciente:\n");
            int from = Math.max(0, historial.size() - 8);
            for (int i = from; i < historial.size(); i++) {
                Map<String, String> m = historial.get(i);
                if (m == null) continue;
                sb.append(m.getOrDefault("role", "user"))
                        .append(": ")
                        .append(m.getOrDefault("content", ""))
                        .append("\n");
            }
        }
        sb.append("Mensaje actual: ").append(mensaje).append("\n");
        sb.append("Respuesta:");
        return sb.toString();
    }

    private static String getString(String rol) {
        String rolNorm = (rol != null && !rol.isBlank()) ? rol.trim().toUpperCase() : "PSICOLOGO";

        String rolDesc;
        if ("PSIQUIATRA".equals(rolNorm)) {
            rolDesc = "Actúas como psiquiatra clínico empático. Exploras síntomas, sueño y riesgo. No recetas por chat. Emergencia: 123 / 800-911-2000.";
        } else if ("MEDICO_HOLISTICO".equals(rolNorm)) {
            rolDesc = "Actúas como médico holístico. Integras mente-cuerpo, estrés, adicciones y hábitos de calma.";
        } else {
            rolDesc = "Actúas como psicólogo clínico. Escuchas, validas y exploras emociones, craving y red de apoyo.";
        }
        return rolDesc;
    }
}