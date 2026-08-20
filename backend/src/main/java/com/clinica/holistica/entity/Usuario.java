package com.clinica.holistica.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios" )
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Usuario {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String passwordHash;


    // Getters / setters
    @Column(length = 30)
    private String rol = "PACIENTE"; // PACIENTE | ADMIN | MEDICO | PSICOLOGO | PSIQUIATRA

    @Column(length = 120)
    private String especialidad; // ej. "Psicología clínica", "Psiquiatría adicciones"

    @Column(length = 30)
    private String telefono;

    @Column(length = 255)
    private String meetLink; // enlace Meet/Zoom por defecto del profesional

    /** VIRTUAL | PRESENCIAL | AMBAS */
    @Column(length = 20)
    private String modalidadAtencion = "VIRTUAL";

    @Column(length = 20)
    private String planActivo;

    private LocalDateTime planActivoDesde;
    private LocalDateTime planActivoHasta;

    @Column(nullable = false)
    private Boolean activo = true;

    private LocalDateTime creadoEn = LocalDateTime.now();

    private LocalDateTime ultimoAcceso;

    @Column(length = 100)
    private String resetToken;

    private LocalDateTime resetTokenExpira;

}

