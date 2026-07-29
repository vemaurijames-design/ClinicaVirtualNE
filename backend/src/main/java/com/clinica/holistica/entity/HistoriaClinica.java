package com.clinica.holistica.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "historias_clinicas")
@Data
@NoArgsConstructor
public class HistoriaClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con usuario (puede ser null si no está registrado)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // ── Datos personales ──────────────────────────────────────
    @Column(length = 150)
    private String nombre;

    @Column(length = 50)
    private String edad;

    @Column(length = 50)
    private String genero;

    @Column(length = 100)
    private String ciudad;

    // ── Motivo de consulta ────────────────────────────────────
    @Column(length = 200)
    private String motivoConsulta;

    // ── Historia de consumo ───────────────────────────────────
    @Column(length = 300)
    private String sustancias; // puede ser múltiple

    @Column(length = 50)
    private String edadInicio;

    @Column(length = 100)
    private String sustanciaPrincipal;

    @Column(length = 100)
    private String frecuencia;

    @Column(length = 100)
    private String ultimoConsumo;

    private Integer abstinenciaEscala; // 1-10

    // ── Atención previa ───────────────────────────────────────
    @Column(length = 100)
    private String atencionPsicologica;

    @Column(length = 100)
    private String atencionPsiquiatrica;

    // ── Salud mental ──────────────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String diagnosticos;

    @Column(length = 200)
    private String medicamentos;

    @Column(length = 200)
    private String ideacion;

    // ── Salud física ──────────────────────────────────────────
    @Column(length = 300)
    private String enfermedades;

    // ── Antecedentes familiares ───────────────────────────────
    @Column(length = 100)
    private String antecedentesFamiliares;

    @Column(length = 50)
    private String cuantosFamiliares;

    @Column(length = 200)
    private String cualesFamiliares;

    // ── Contexto social ───────────────────────────────────────
    @Column(length = 100)
    private String situacionLaboral;

    @Column(length = 100)
    private String redApoyo;

    @Column(columnDefinition = "TEXT")
    private String motivacion;

    @Column(columnDefinition = "TEXT")
    private String expectativas;

    // ── Diagnóstico IA ────────────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String diagnosticoIa; // JSON completo de Gemini

    @Column(length = 20)
    private String nivelRiesgo; // BAJO | MEDIO | ALTO | CRÍTICO

    @Column(length = 50)
    private String programaRecomendado;

    // ── Metadatos ─────────────────────────────────────────────
    @Column(updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();

    private LocalDateTime actualizadoEn = LocalDateTime.now();

    private Boolean consentimientoAceptado = false;

    private LocalDateTime consentimientoFecha;

    @PreUpdate
    public void preUpdate() {
        this.actualizadoEn = LocalDateTime.now();
    }
}
