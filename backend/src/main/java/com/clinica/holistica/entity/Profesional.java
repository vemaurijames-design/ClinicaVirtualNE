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

    // getters / setters (getMeetLink / setMeetLink — NO meetLinkBase)
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
    private String especialidad;

    @Column(name = "meet_link", length = 500)
    private String meetLink;

    @Column(length = 30)
    private String modalidad = "VIRTUAL";

    private Boolean activo = true;

    private LocalDateTime creadoEn = LocalDateTime.now();

}