package com.clinica.holistica.service;

import com.clinica.holistica.dto.CitaRequest;
import com.clinica.holistica.entity.Cita;
import com.clinica.holistica.entity.Profesional;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.CitaRepository;
import com.clinica.holistica.repository.ProfesionalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CitaService {

    private final CitaRepository citaRepo;
    private final ProfesionalRepository profesionalRepo;
    private final CitaMailService citaMailService;

    public CitaService(CitaRepository citaRepo,
                       ProfesionalRepository profesionalRepo,
                       CitaMailService citaMailService) {
        this.citaRepo = citaRepo;
        this.profesionalRepo = profesionalRepo;
        this.citaMailService = citaMailService;
    }

    public List<Profesional> profesionales() {
        List<Profesional> activos = profesionalRepo.findByActivoTrue();
        if (activos != null && !activos.isEmpty()) {
            return activos;
        }
        return profesionalRepo.findAll();
    }

    @Transactional
    public Cita agendar(CitaRequest req, Usuario paciente) {
        if (paciente == null) {
            throw new RuntimeException("Debe iniciar sesión");
        }
        if (req == null) {
            throw new RuntimeException("Datos de cita incompletos");
        }

        Cita c = new Cita();
        c.setPaciente(paciente);
        c.setModalidad(req.getModalidad() != null ? req.getModalidad() : "APOYO_IA");
        c.setTipo("CONSULTA");
        c.setNotasPaciente(req.getNotasPaciente());
        c.setEstado("PENDIENTE");
        c.setCreadoEn(LocalDateTime.now());

        if (req.getFechaHora() != null) {
            c.setFechaHora(req.getFechaHora());
        } else {
            c.setFechaHora(LocalDateTime.now().plusHours(1));
        }

        if ("VIRTUAL_REAL".equalsIgnoreCase(c.getModalidad())) {
            if (req.getProfesionalId() == null) {
                throw new RuntimeException("Seleccione un profesional");
            }
            Profesional prof = profesionalRepo.findById(req.getProfesionalId())
                    .orElseThrow(() -> new RuntimeException("Profesional no encontrado"));
            c.setProfesional(prof);
            if (prof.getMeetLink() != null && !prof.getMeetLink().isBlank()) {
                c.setMeetLink(prof.getMeetLink());
            }
        } else {
            c.setProfesional(null);
            c.setMeetLink(null);
        }

        Cita saved = citaRepo.save(c);

        try {
            citaMailService.notificarAgendamiento(saved);
        } catch (Exception ignored) {
            // La cita ya está guardada aunque falle el correo
        }

        return saved;
    }

    public List<Cita> mias(Long pacienteId) {
        return citaRepo.findByPacienteIdOrderByFechaHoraDesc(pacienteId);
    }

    public List<Cita> todas() {
        return citaRepo.findAllByOrderByFechaHoraDesc();
    }
}