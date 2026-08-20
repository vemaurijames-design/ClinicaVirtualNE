package com.clinica.holistica.service;

import com.clinica.holistica.dto.CitaRequest;
import com.clinica.holistica.dto.CitaResponse;
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

    private void exigirPlanActivo(Usuario paciente) {
        boolean ok = paciente.getPlanActivo() != null
                && !paciente.getPlanActivo().isBlank()
                && (paciente.getPlanActivoHasta() == null
                || paciente.getPlanActivoHasta().isAfter(LocalDateTime.now()));
        if (!ok) {
            throw new RuntimeException(
                    "Debe tener un paquete activo (mínimo Mes 1) para agendar consulta. "
                            + "Vaya a Programas y complete el pago."
            );
        }
    }

    @Transactional
    public CitaResponse agendar(CitaRequest req, Usuario paciente) {
        if (paciente == null) {
            throw new RuntimeException("Debe iniciar sesión");
        }
        if (req == null) {
            throw new RuntimeException("Datos de cita incompletos");
        }

        exigirPlanActivo(paciente);

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
            if (citaMailService != null) {
                citaMailService.notificarAgendamiento(saved);
            }
        } catch (Exception ignored) {
            // la cita ya quedó guardada
        }

        // Mapear DENTRO de la transacción (sesión abierta)
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CitaResponse> mias(Long pacienteId) {
        return citaRepo.findByPacienteIdOrderByFechaHoraDesc(pacienteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CitaResponse> todas() {
        return citaRepo.findAllByOrderByFechaHoraDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /** Convierte entidad → DTO sin proxies problemáticos */
    public CitaResponse toResponse(Cita c) {
        CitaResponse r = new CitaResponse();
        r.setId(c.getId());
        r.setModalidad(c.getModalidad());
        r.setTipo(c.getTipo());
        r.setEstado(c.getEstado());
        r.setFechaHora(c.getFechaHora());
        r.setNotasPaciente(c.getNotasPaciente());
        r.setMeetLink(c.getMeetLink());

        if (c.getPaciente() != null) {
            r.setPacienteId(c.getPaciente().getId());
            r.setPacienteNombre(c.getPaciente().getNombre());
        }
        if (c.getProfesional() != null) {
            r.setProfesionalId(c.getProfesional().getId());
            r.setProfesionalNombre(c.getProfesional().getNombre());
            r.setProfesionalEspecialidad(c.getProfesional().getEspecialidad());
        }
        return r;
    }
}