package com.clinica.holistica.controller;

import com.clinica.holistica.dto.ApiResponse;
import com.clinica.holistica.dto.ProfesionalRequest;
import com.clinica.holistica.entity.Profesional;
import com.clinica.holistica.service.ProfesionalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/profesionales")
public class AdminProfesionalController {

    private final ProfesionalService profesionalService;

    public AdminProfesionalController(ProfesionalService profesionalService) {
        this.profesionalService = profesionalService;
    }

    @GetMapping
    public ResponseEntity<?> listar() {
        List<Profesional> list = profesionalService.listarProfesionales();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody ProfesionalRequest req) {
        try {
            Profesional p = profesionalService.crear(req);
            return ResponseEntity.ok(ApiResponse.ok("Profesional creado", p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody ProfesionalRequest req) {
        try {
            Profesional p = profesionalService.actualizar(id, req);
            return ResponseEntity.ok(ApiResponse.ok("Profesional actualizado", p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> desactivar(@PathVariable Long id) {
        try {
            Profesional p = profesionalService.desactivar(id);
            return ResponseEntity.ok(ApiResponse.ok("Profesional desactivado", p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}