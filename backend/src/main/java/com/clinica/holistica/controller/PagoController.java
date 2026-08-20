package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.service.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @PostMapping("/crear")
    public ResponseEntity<ApiResponse<Map<String, Object>>> crear(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Usuario usuario) {
        if (usuario == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Debe iniciar sesión"));
        }
        String programa = body.get("programa");
        Map<String, Object> data = pagoService.crearPago(usuario, programa);
        return ResponseEntity.ok(ApiResponse.ok("Pago creado", data));
    }

    /**
     * Webhook Wompi — configura esta URL en el dashboard de Wompi:
     * En local puedes usar ngrok.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody Map<String, Object> payload) {
        try {
            // Estructura simplificada; adapta a la payload real de Wompi
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            @SuppressWarnings("unchecked")
            Map<String, Object> transaction = data != null ? (Map<String, Object>) data.get("transaction") : null;

            if (transaction == null) return ResponseEntity.ok("ignored");

            String status = String.valueOf(transaction.get("status"));
            String reference = String.valueOf(transaction.get("reference"));
            String txId = String.valueOf(transaction.get("id"));

            if ("APPROVED".equalsIgnoreCase(status)) {
                pagoService.confirmarPagoAprobado(reference, txId);
            }
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            return ResponseEntity.ok("error-logged");
        }
    }





}