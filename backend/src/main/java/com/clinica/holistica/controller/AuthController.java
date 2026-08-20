package com.clinica.holistica.controller;

import com.clinica.holistica.dto.*;
import com.clinica.holistica.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/registrar")
    public ResponseEntity<ApiResponse<AuthResponse>> registrar(@Valid @RequestBody RegisterRequest req) {
        AuthResponse resp = authService.registrar(req);
        return ResponseEntity.ok(ApiResponse.ok("Registro exitoso", resp));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest req) {
        AuthResponse resp = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", resp));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(
            @RequestBody Map<String, String> body) {
        String token = authService.solicitarReset(body.get("email"));
        return ResponseEntity.ok(ApiResponse.ok("Token generado",
                Map.of("token", token,
                        "nota", "En producción este token llega por email")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestBody Map<String, String> body) {
        authService.cambiarPassword(body.get("token"), body.get("nuevaPassword"));
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada", null));
    }
}