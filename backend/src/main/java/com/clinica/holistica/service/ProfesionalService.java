package com.clinica.holistica.service;

import com.clinica.holistica.dto.ProfesionalRequest;
import com.clinica.holistica.entity.Profesional;
import com.clinica.holistica.repository.ProfesionalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProfesionalService {

    private final ProfesionalRepository profesionalRepo;

    public ProfesionalService(ProfesionalRepository profesionalRepo) {
        this.profesionalRepo = profesionalRepo;
    }

    public List<Profesional> listar() {
        return profesionalRepo.findAll();
    }

    /** Alias que usa AdminProfesionalController */
    public List<Profesional> listarProfesionales() {
        return listar();
    }

    public List<Profesional> listarActivos() {
        List<Profesional> activos = profesionalRepo.findByActivoTrue();
        if (activos != null && !activos.isEmpty()) {
            return activos;
        }
        return profesionalRepo.findAll();
    }

    @Transactional
    public Profesional crear(ProfesionalRequest req) {
        if (req == null) throw new RuntimeException("Datos incompletos");
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new RuntimeException("El email es obligatorio");
        }
        String email = req.getEmail().trim().toLowerCase();
        if (profesionalRepo.existsByEmail(email)) {
            throw new RuntimeException("Ya existe un profesional con ese email");
        }
        if (req.getNombre() == null || req.getNombre().isBlank()) {
            throw new RuntimeException("El nombre es obligatorio");
        }

        Profesional p = new Profesional();
        p.setNombre(req.getNombre().trim());
        p.setEmail(email);
        p.setTelefono(req.getTelefono());
        p.setEspecialidad(req.getEspecialidad());
        p.setMeetLink(req.getMeetLink()); // NO setMeetLinkBase
        p.setModalidad(req.getModalidad() != null && !req.getModalidad().isBlank()
                ? req.getModalidad() : "VIRTUAL");
        p.setActivo(req.getActivo() == null || req.getActivo());
        p.setCreadoEn(LocalDateTime.now());

        return profesionalRepo.save(p);
    }

    @Transactional
    public Profesional actualizar(Long id, ProfesionalRequest req) {
        Profesional p = profesionalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));

        if (req.getNombre() != null && !req.getNombre().isBlank()) {
            p.setNombre(req.getNombre().trim());
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            p.setEmail(req.getEmail().trim().toLowerCase());
        }
        if (req.getTelefono() != null) p.setTelefono(req.getTelefono());
        if (req.getEspecialidad() != null) p.setEspecialidad(req.getEspecialidad());
        if (req.getMeetLink() != null) p.setMeetLink(req.getMeetLink());
        if (req.getModalidad() != null) p.setModalidad(req.getModalidad());
        if (req.getActivo() != null) p.setActivo(req.getActivo());

        return profesionalRepo.save(p);
    }

    /** Soft-delete: marca activo=false */
    @Transactional
    public Profesional desactivar(Long id) {
        Profesional p = profesionalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));
        p.setActivo(false);
        return profesionalRepo.save(p);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!profesionalRepo.existsById(id)) {
            throw new RuntimeException("Profesional no encontrado");
        }
        profesionalRepo.deleteById(id);
    }
}