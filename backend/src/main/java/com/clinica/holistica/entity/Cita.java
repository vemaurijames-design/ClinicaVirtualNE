package com.clinica.holistica.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "citas")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Usuario paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesional_id")
    private Profesional profesional;

    @Column(length = 30, nullable = false)
    private String modalidad;

    @Column(length = 30)
    private String tipo;

    private LocalDateTime fechaHora;

    @Column(length = 500)
    private String meetLink;

    @Column(length = 1000)
    private String notasPaciente;

    @Column(length = 30)
    private String estado = "PENDIENTE";

    private LocalDateTime creadoEn = LocalDateTime.now();

}