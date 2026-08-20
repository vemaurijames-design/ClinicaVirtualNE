package com.clinica.holistica.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "historias_clinicas")
public class HistoriaClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnore
    private Usuario usuario;

    private String nombre;
    private String edad;
    private String genero;
    private String ciudad;

    @Column(length = 2000)
    private String motivoConsulta;

    @Column(length = 1000)
    private String sustancias;
    private String edadInicio;
    private String sustanciaPrincipal;
    private String frecuencia;
    private String ultimoConsumo;

    private String deseoConsumir;
    private String abstinenciaEscala;

    private String atencionPsicologica;
    private String atencionPsiquiatrica;

    @Column(length = 1000)
    private String diagnosticos;

    @Column(length = 1000)
    private String enfermedades;

    private String antecedentesFamiliares;
    private String cuantosFamiliares;

    @Column(length = 500)
    private String cualesFamiliares;

    private String situacionLaboral;
    private String redApoyo;
    private String motivacion;

    @Column(length = 2000)
    private String expectativas;

    private Boolean consentimientoAceptado;
    private LocalDateTime consentimientoFecha;

    @Column(columnDefinition = "TEXT")
    private String diagnosticoIa;
    private String nivelRiesgo;
    private String programaRecomendado;

    private LocalDateTime creadoEn = LocalDateTime.now();




}