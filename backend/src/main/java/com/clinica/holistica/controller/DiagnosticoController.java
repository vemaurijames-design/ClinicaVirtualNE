package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.service.GeminiService;
import com.clinica.holistica.service.HistoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/diagnostico")
@RequiredArgsConstructor
public class DiagnosticoController {

    private final GeminiService geminiService;
    private final HistoriaService historiaService;

    /**
     * Genera diagnóstico IA con Gemini.
     * El frontend puede llamar a este endpoint para mantener la API key segura en el servidor.
     *
     * POST /api/diagnostico/ia
     * Body: { "respuestas": { "nombre": "...", "edad": "...", ... }, "historiaId": 123 }
     */
    @PostMapping("/ia")
    public ResponseEntity<ApiResponse<String>> generarDiagnostico(
            @RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> respuestas = (Map<String, String>) body.get("respuestas");
            Long historiaId = body.get("historiaId") != null
                    ? Long.valueOf(body.get("historiaId").toString()) : null;

            String diagnosticoJson = geminiService.analizarHistoria(respuestas);

            // Si hay una historia guardada, vincular el diagnóstico
            if (historiaId != null) {
                try {
                    // Extraer nivel_riesgo y programa del JSON para guardar en BD
                    com.fasterxml.jackson.databind.ObjectMapper mapper =
                        new com.fasterxml.jackson.databind.ObjectMapper();
                    com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(diagnosticoJson);
                    String nivelRiesgo = node.path("nivel_riesgo").asText("MEDIO");
                    String programa = node.path("programa_recomendado").asText("mes1");
                    historiaService.guardarDiagnosticoIa(historiaId, diagnosticoJson, nivelRiesgo, programa);
                } catch (Exception ignored) { /* No bloquear si falla el guardado */ }
            }

            return ResponseEntity.ok(ApiResponse.ok("Diagnóstico generado", diagnosticoJson));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Error con Gemini: " + e.getMessage()));
        }
    }
}
