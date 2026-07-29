package com.clinica.holistica.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class GeminiService {

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.url}")
    private String geminiUrl;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    public String analizarHistoria(Map<String, String> respuestas) {
        String prompt = construirPrompt(respuestas);

        Map<String, Object> body = Map.of(
            "contents", new Object[]{
                Map.of("parts", new Object[]{
                    Map.of("text", prompt)
                })
            },
            "generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 4096
            )
        );

        try {
            String response = webClient.post()
                .uri(geminiUrl + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            // Extraer el texto de la respuesta de Gemini
            JsonNode root = mapper.readTree(response);
            String text = root
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text").asText();

            // Limpiar el JSON del markdown si viene envuelto
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            return text;

        } catch (Exception e) {
            throw new RuntimeException("Error al comunicarse con Gemini AI: " + e.getMessage());
        }
    }

    private String construirPrompt(Map<String, String> r) {
        return """
            Eres el Dr. Nikolas Escobar, médico especialista en adicciones y salud mental del Consultorio Holístico Cuídate Salud Plena (Medellín, Colombia).

            Analiza esta historia clínica y responde ÚNICAMENTE con un JSON válido con esta estructura exacta:

            {
              "resumen": "Resumen clínico completo en 3-4 oraciones",
              "toxicologia": "Evaluación toxicológica detallada",
              "nivel_riesgo": "BAJO|MEDIO|ALTO|CRÍTICO",
              "nivel_riesgo_justificacion": "Justificación del nivel de riesgo",
              "diagnosticos": [
                {"codigo": "F10.2", "nombre": "Nombre DSM-5/CIE-10", "descripcion": "Descripción clínica"}
              ],
              "especialistas": [
                {"especialidad": "Psiquiatría", "prioridad": "URGENTE|PRIORITARIO|RECOMENDADO", "razon": "Razón"}
              ],
              "recomendaciones_inmediatas": ["Recomendación 1", "Recomendación 2"],
              "plan_tratamiento": {
                "primera_linea": "Tratamiento principal",
                "segunda_linea": "Tratamiento complementario",
                "seguimiento": "Plan de seguimiento"
              },
              "programa_recomendado": "mes1|mes2|mes3|mes4",
              "comorbilidades": ["Comorbilidad 1", "Comorbilidad 2"],
              "programa_justificacion": "Por qué recomiendas ese programa específico",
              "servicios_adicionales_recomendados": [
                {"servicio": "Nombre del servicio", "razon": "Por qué lo recomiendas"}
              ],
              "mensaje_al_paciente": "Mensaje cálido, motivador y personalizado del médico al paciente"
            }

            HISTORIA CLÍNICA:
            - Nombre: %s
            - Edad: %s
            - Género: %s
            - Ciudad: %s
            - Motivo de consulta: %s
            - Sustancias consumidas: %s
            - Edad de primer consumo: %s
            - Sustancia principal: %s
            - Frecuencia de consumo: %s
            - Último consumo: %s
            - Escala síndrome abstinencia (1-10): %s
            - Atención psicológica previa: %s
            - Atención psiquiátrica previa: %s
            - Diagnósticos previos: %s
            - Medicamentos actuales: %s
            - Ideación suicida/autolesión: %s
            - Enfermedades físicas: %s
            - Antecedentes familiares de adicción/mental: %s
            - Cuántos familiares afectados: %s
            - Cuáles familiares: %s
            - Situación laboral: %s
            - Red de apoyo: %s
            - Motivación para el cambio: %s
            - Expectativas del tratamiento: %s

            Responde SOLO con el JSON, sin texto adicional.
            """.formatted(
                r.getOrDefault("nombre", "No indicado"),
                r.getOrDefault("edad", "No indicado"),
                r.getOrDefault("genero", "No indicado"),
                r.getOrDefault("ciudad", "No indicado"),
                r.getOrDefault("motivo_consulta", "No indicado"),
                r.getOrDefault("sustancias", "No indicado"),
                r.getOrDefault("edad_inicio", "No indicado"),
                r.getOrDefault("sustancia_principal", "No indicado"),
                r.getOrDefault("frecuencia", "No indicado"),
                r.getOrDefault("ultimo_consumo", "No indicado"),
                r.getOrDefault("abstinencia_escala", "No indicado"),
                r.getOrDefault("atencion_psicologica", "No indicado"),
                r.getOrDefault("atencion_psiquiatrica", "No indicado"),
                r.getOrDefault("diagnosticos", "No indicado"),
                r.getOrDefault("medicamentos", "No indicado"),
                r.getOrDefault("ideacion", "No indicado"),
                r.getOrDefault("enfermedades", "No indicado"),
                r.getOrDefault("antecedentes_familiares", "No indicado"),
                r.getOrDefault("cuantos_familiares", "No indicado"),
                r.getOrDefault("cuales_familiares", "No indicado"),
                r.getOrDefault("situacion_laboral", "No indicado"),
                r.getOrDefault("red_apoyo", "No indicado"),
                r.getOrDefault("motivacion", "No indicado"),
                r.getOrDefault("expectativas", "No indicado")
            );
    }
}
