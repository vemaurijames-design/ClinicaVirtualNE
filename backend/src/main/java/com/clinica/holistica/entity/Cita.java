package com.clinica.holistica.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "citas")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    /** Profesional real de la tabla profesionales (NO usuarios) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesional_id")
    private Profesional profesional;

    @Column(length = 30, nullable = false)
    private String modalidad; // VIRTUAL_REAL | APOYO_IA

    @Column(length = 30)
    private String tipo; // CONSULTA, SEGUIMIENTO, etc.

    private LocalDateTime fechaHora;

    @Column(length = 500)
    private String meetLink;

    @Column(length = 1000)
    private String notasPaciente;

    @Column(length = 30)
    private String estado = "PENDIENTE"; // PENDIENTE | CONFIRMADA | CANCELADA

    private LocalDateTime creadoEn = LocalDateTime.now();

    // ── Getters / Setters ──

}