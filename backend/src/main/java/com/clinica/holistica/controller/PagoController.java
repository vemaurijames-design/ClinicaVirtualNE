package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.dto.PagoRequest;
import com.clinica.holistica.entity.Pago;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import com.clinica.holistica.service.PagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;
    private final UsuarioRepository usuarioRepository;

    public PagoController(PagoService pagoService, UsuarioRepository usuarioRepository) {
        this.pagoService = pagoService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody PagoRequest req, Authentication auth) {
        try {
            if (auth == null || auth.getPrincipal() == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Debe iniciar sesión"));
            }
            Usuario u = (Usuario) auth.getPrincipal();
            Pago pago = pagoService.crearYActivarDemo(req, u);
            return ResponseEntity.ok(ApiResponse.ok("Pago registrado y plan activado", pago));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** Historial de pagos del usuario logueado */
    @GetMapping("/mios")
    public ResponseEntity<?> mios(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Debe iniciar sesión"));
        }
        Usuario u = (Usuario) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok(pagoService.misPagos(u.getId())));
    }

    /**
     * Plan activo del usuario: qué programa tiene, hasta cuándo, días restantes.
     * URL final: GET /api/pagos/mi-plan
     */
    @GetMapping("/mi-plan")
    public ResponseEntity<?> miPlan(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Debe iniciar sesión"));
        }

        Usuario principal = (Usuario) auth.getPrincipal();
        Usuario u = usuarioRepository.findById(principal.getId()).orElse(principal);

        boolean activo = u.getPlanActivo() != null
                && !u.getPlanActivo().isBlank()
                && (u.getPlanActivoHasta() == null
                || u.getPlanActivoHasta().isAfter(LocalDateTime.now()));

        long diasRestantes = 0;
        if (activo && u.getPlanActivoHasta() != null) {
            diasRestantes = java.time.Duration.between(
                    LocalDateTime.now(), u.getPlanActivoHasta()).toDays();
            if (diasRestantes < 0) diasRestantes = 0;
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("tienePlan", activo);
        data.put("programa", u.getPlanActivo());
        data.put("desde", u.getPlanActivoDesde());
        data.put("hasta", u.getPlanActivoHasta());
        data.put("diasRestantes", diasRestantes);
        data.put("incluye", activo
                ? List.of(
                "Acompañamiento IA ilimitado",
                "Agendar citas (IA o profesional real)",
                "Audios y videos del paquete",
                "Historial y diagnóstico"
        )
                : List.of("Solo mensajes gratuitos de acompañamiento"));

        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}