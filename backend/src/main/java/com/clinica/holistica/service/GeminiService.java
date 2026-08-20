package com.clinica.holistica.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    /** Modelo principal: 3.5-flash (estable y disponible en v1beta) */
    @Value("${app.gemini.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent}")
    private String geminiUrl;

    private final ObjectMapper mapper = new ObjectMapper();
    private final RestTemplate rest = new RestTemplate();

    /**
     * Modelos actuales (2026). NO incluir gemini-1.5-flash ni gemini-2.0-flash (retirados → 404).
     */
    private static final List<String> FALLBACK_MODELS = List.of(
            "gemini-3.6-flash",
            "gemini-3.7-flash",
            "gemini-3.5-flash"
    );

    // ─────────────────────────────────────────────
    // Diagnóstico (historia clínica → JSON)
    // ─────────────────────────────────────────────

    public String analizarHistoria(Map<String, String> respuestas) {
        String prompt = construirPrompt(respuestas);
        return generarConFallbacks(prompt);
    }

    // ─────────────────────────────────────────────
    // Acompañamiento / texto libre
    // ─────────────────────────────────────────────

    public String generarTextoLibre(String prompt) {
        return generarConFallbacks(prompt);
    }

    /**
     * Prueba la URL de properties y luego cada modelo de FALLBACK_MODELS.
     */
    private String generarConFallbacks(String prompt) {
        String body = buildRequestBody(prompt);
        Exception last = null;

        List<String> urls = new ArrayList<>();
        String primary = cleanUrl(geminiUrl);
        if (!primary.isBlank()) {
            urls.add(primary);
        }
        for (String model : FALLBACK_MODELS) {
            String u = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + model + ":generateContent";
            if (urls.stream().noneMatch(x -> x.equalsIgnoreCase(u))) {
                urls.add(u);
            }
        }

        for (String url : urls) {
            try {
                return callOnce(url, body);
            } catch (Exception e) {
                last = e;
            }
        }

        String detail = last != null ? last.getMessage() : "sin detalle";
        throw new RuntimeException(
                "El servicio de IA no está disponible. Verifique API key y modelos. " + detail,
                last
        );
    }

    // ─────────────────────────────────────────────
    // HTTP
    // ─────────────────────────────────────────────

    private String callOnce(String url, String body) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("Falta app.gemini.api-key en application.properties");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey.trim());

        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> res = rest.exchange(url, HttpMethod.POST, entity, String.class);
            if (res.getBody() == null || res.getBody().isBlank()) {
                throw new RuntimeException("Gemini body vacío desde " + url);
            }
            return extractText(res.getBody());
        } catch (RestClientResponseException e) {
            throw new RuntimeException(
                    e.getStatusCode().value() + " " + e.getStatusText()
                            + " from POST " + url
                            + " body=" + e.getResponseBodyAsString(),
                    e
            );
        }
    }

    private String cleanUrl(String url) {
        if (url == null) {
            return "";
        }
        int q = url.indexOf('?');
        if (q > 0) {
            url = url.substring(0, q);
        }
        return url.trim();
    }

    private String buildRequestBody(String prompt) {
        try {
            ObjectNode root = mapper.createObjectNode();
            ObjectNode content = root.putArray("contents").addObject();
            content.putArray("parts").addObject().put("text", prompt);
            ObjectNode gen = root.putObject("generationConfig");
            gen.put("temperature", 0.3);
            gen.put("maxOutputTokens", 4096);
            return mapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new RuntimeException("Error armando body Gemini", e);
        }
    }

    private String extractText(String responseBody) {
        try {
            JsonNode root = mapper.readTree(responseBody);
            JsonNode text = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");
            if (text.isMissingNode() || text.asText().isBlank()) {
                throw new RuntimeException("Respuesta Gemini vacía: " + responseBody);
            }
            return text.asText()
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```\\s*", "")
                    .trim();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("No se pudo parsear respuesta Gemini", e);
        }
    }

    // ─────────────────────────────────────────────
    // Prompt diagnóstico
    // ─────────────────────────────────────────────

    private String f(Map<String, String> r, String key) {
        if (r == null) {
            return "No respondido";
        }
        String v = r.get(key);
        if (v == null || v.isBlank()) {
            return "No respondido";
        }
        return v.replace("\"", "'").trim();
    }

    private String construirPrompt(Map<String, String> r) {
        String craving = f(r, "craving");
        if ("No respondido".equals(craving)) {
            craving = f(r, "deseo_consumir");
        }

        return """
            Eres el Dr. Nikolas Escobar, médico especialista en adicciones y salud mental en Colombia.
            Analiza la historia clínica y responde ÚNICAMENTE con JSON válido (sin markdown, sin ```).

            Estructura obligatoria del JSON:
            {
              "resumen": "Resumen clínico en 3-4 oraciones claro para el paciente",
              "nivel_riesgo": "BAJO|MEDIO|ALTO|CRÍTICO",
              "nivel_riesgo_justificacion": "Breve justificación del nivel de riesgo",
              "diagnosticos": [
                {"codigo": "F10.2", "nombre": "Nombre DSM-5/CIE-11", "descripcion": "Cómo se manifiesta en este paciente"}
              ],
              "recomendaciones_inmediatas": ["Recomendación 1", "Recomendación 2"],
              "plan_tratamiento": {
                "primera_linea": "...",
                "segunda_linea": "...",
                "seguimiento": "..."
              },
              "programa_recomendado": "mes1|mes2|mes3|mes4",
              "programa_justificacion": "Por qué ese programa de la clínica",
              "mensaje_al_paciente": "Mensaje cálido, claro y orientador sobre qué debe saber y hacer"
            }

            Reglas:
                CONTEXTO NACIONAL (agosto 2026):
                Colombia atraviesa las consecuencias del terremoto de magnitud 7,4 del 10 de agosto
                (Chocó / Eje Cafetero / Valle). Muchas personas presentan miedo a réplicas, insomnio,
                ansiedad, duelo o aumento de consumo. Si en la historia hay evento_reciente o
                sintomas_post_trauma relacionados con desastre:
                - Incluye en el resumen una orientación sobre respuestas normales post-desastre.
                - Si hay ideación suicida o crisis: nivel_riesgo CRÍTICO y Línea de la Vida 800-911-2000 / 123.
                - programa_recomendado: prioriza mes1 si hay trauma agudo + inestabilidad o craving alto.
                - mensaje_al_paciente: cálido, sin alarmismo; valida que pedir ayuda es un acto de cuidado.
            - programa_recomendado SOLO puede ser: mes1, mes2, mes3 o mes4.
            - No inventes precios.
            - El diagnóstico es orientativo (apoyo IA), no reemplaza valoración presencial.
            - Si hay ideación suicida, autolesión o crisis: nivel_riesgo = CRÍTICO y recomienda Línea de la Vida 800-911-2000 y emergencias 123.

            HISTORIA CLÍNICA:
            Nombre: %s
            Edad: %s
            Motivo de consulta: %s
            Sustancias consumidas: %s
            Edad de inicio: %s
            Sustancia principal: %s
            Frecuencia: %s
            Último consumo: %s
            Deseo de consumir (craving 1-10): %s
            Abstinencia (1-10): %s
            Atención psicológica: %s
            Atención psiquiátrica: %s
            Diagnósticos previos: %s
            Enfermedades médicas: %s
            Antecedentes familiares: %s
            Cuántos familiares: %s
            Cuáles familiares: %s
            Motivación: %s
            Expectativas: %s
            Evento reciente: %s
            Síntomas post-evento: %s

            Responde SOLO el JSON.
            """.formatted(
                f(r, "nombre"),
                f(r, "edad"),
                f(r, "motivo_consulta"),
                f(r, "sustancias"),
                f(r, "edad_inicio"),
                f(r, "sustancia_principal"),
                f(r, "frecuencia"),
                f(r, "ultimo_consumo"),
                f(r, "evento_reciente"),
                f(r, "sintomas_post_trauma"),
                craving,
                f(r, "abstinencia_escala"),
                f(r, "atencion_psicologica"),
                f(r, "atencion_psiquiatrica"),
                f(r, "diagnosticos"),
                f(r, "enfermedades"),
                f(r, "antecedentes_familiares"),
                f(r, "cuantos_familiares"),
                f(r, "cuales_familiares"),
                f(r, "motivacion"),
                f(r, "expectativas")
        );
    }
}