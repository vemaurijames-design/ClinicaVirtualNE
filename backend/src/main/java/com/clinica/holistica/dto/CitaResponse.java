package com.clinica.holistica.dto;

import java.time.LocalDateTime;

/**
 * DTO plano para evitar LazyInitializationException
 * al serializar Cita con paciente/profesional LAZY.
 */
public class CitaResponse {

    private Long id;
    private String modalidad;
    private String tipo;
    private String estado;
    private LocalDateTime fechaHora;
    private String notasPaciente;
    private String meetLink;

    private Long profesionalId;
    private String profesionalNombre;
    private String profesionalEspecialidad;

    private Long pacienteId;
    private String pacienteNombre;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getModalidad() { return modalidad; }
    public void setModalidad(String modalidad) { this.modalidad = modalidad; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public String getNotasPaciente() { return notasPaciente; }
    public void setNotasPaciente(String notasPaciente) { this.notasPaciente = notasPaciente; }

    public String getMeetLink() { return meetLink; }
    public void setMeetLink(String meetLink) { this.meetLink = meetLink; }

    public Long getProfesionalId() { return profesionalId; }
    public void setProfesionalId(Long profesionalId) { this.profesionalId = profesionalId; }

    public String getProfesionalNombre() { return profesionalNombre; }
    public void setProfesionalNombre(String profesionalNombre) { this.profesionalNombre = profesionalNombre; }

    public String getProfesionalEspecialidad() { return profesionalEspecialidad; }
    public void setProfesionalEspecialidad(String profesionalEspecialidad) {
        this.profesionalEspecialidad = profesionalEspecialidad;
    }

    public Long getPacienteId() { return pacienteId; }
    public void setPacienteId(Long pacienteId) { this.pacienteId = pacienteId; }

    public String getPacienteNombre() { return pacienteNombre; }
    public void setPacienteNombre(String pacienteNombre) { this.pacienteNombre = pacienteNombre; }
}
