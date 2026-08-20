package com.clinica.holistica.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "profesionales")
public class Profesional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(length = 40)
    private String telefono;

    @Column(length = 80)
    private String especialidad; // PSICOLOGO, PSIQUIATRA, MEDICO, HOLISTICO

    @Column(length = 500)
    private String meetLink;

    @Column(length = 30)
    private String modalidad = "VIRTUAL"; // VIRTUAL | PRESENCIAL | HIBRIDO

    private Boolean activo = true;

    private LocalDateTime creadoEn = LocalDateTime.now();

}