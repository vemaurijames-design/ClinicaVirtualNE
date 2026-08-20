package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.dto.PagoRequest;
import com.clinica.holistica.entity.Pago;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.service.PagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
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

    @GetMapping("/mios")
    public ResponseEntity<?> mios(Authentication auth) {
        Usuario u = (Usuario) auth.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok(pagoService.misPagos(u.getId())));
    }
}