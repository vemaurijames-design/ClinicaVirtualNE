package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.dto.ContactoRequest;
import com.clinica.holistica.entity.Contacto;
import com.clinica.holistica.service.ContactoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacto")
@RequiredArgsConstructor
public class ContactoController {

    private final ContactoService contactoService;

    @PostMapping
    public ResponseEntity<ApiResponse<Contacto>> guardar(@Valid @RequestBody ContactoRequest req) {
        Contacto c = contactoService.guardar(req);
        return ResponseEntity.ok(ApiResponse.ok("Solicitud recibida", c));
    }

    // Admin: ver todos los contactos
    @GetMapping
    public ResponseEntity<ApiResponse<List<Contacto>>> todos() {
        return ResponseEntity.ok(ApiResponse.ok(contactoService.obtenerTodos()));
    }
}
