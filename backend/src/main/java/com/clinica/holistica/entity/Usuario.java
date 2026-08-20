package com.clinica.holistica.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Getter
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Getter
    @Setter
    @Column(nullable = false, length = 150)
    private String nombre;

    @Getter
    @Setter
    @Column(nullable = false, unique = true, length = 180)
    private String email;

    /** Hash BCrypt — el resto del código usa getPasswordHash / setPasswordHash */
    @Setter
    @Getter
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Getter
    @Setter
    @Column(length = 30)
    private String rol = "PACIENTE"; // PACIENTE | ADMIN | MEDICO | PSICOLOGO | PSIQUIATRA

    @Getter
    @Setter
    @Column(length = 40)
    private String telefono;

    private Boolean activo = true;

    @Getter
    @Setter
    private LocalDateTime creadoEn = LocalDateTime.now();

    @Getter
    @Setter
    private LocalDateTime ultimoAcceso;

    // —— Recuperación de contraseña ——
    @Getter
    @Setter
    @Column(length = 100)
    private String resetToken;

    @Getter
    @Setter
    private LocalDateTime resetTokenExpira;

    // —— Plan / paquetes ——
    @Getter
    @Setter
    @Column(length = 30)
    private String planActivo; // mes1, mes2, ...

    @Setter
    @Getter
    private LocalDateTime planActivoDesde;

    @Setter
    @Getter
    private LocalDateTime planActivoHasta;

    // —— Contador chat IA gratis ——
    @Column(nullable = false)
    private Integer mensajesIaUsados = 0;

    // —— Campos de staff (si el usuario es médico/psicólogo en tabla usuarios) ——
    @Setter
    @Getter
    @Column(length = 80)
    private String especialidad;

    @Setter
    @Getter
    @Column(name = "meet_link", length = 500)
    private String meetLink;

    @Setter
    @Getter
    @Column(length = 30)
    private String modalidadAtencion; // VIRTUAL | PRESENCIAL | HIBRIDO

    // ═══════════════ GETTERS / SETTERS ═══════════════

    public String getName() { return nombre; }
    public void setName(String name) { this.nombre = name; }

    /** Alias para Spring Security / código que use getPassword() */
    public String getPassword() { return passwordHash; }
    public void setPassword(String password) { this.passwordHash = password; }

    public Boolean getActivo() { return activo == null || activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getPlanHasta() { return planActivoHasta; }
    public void setPlanHasta(LocalDateTime t) { this.planActivoHasta = t; }

    public Integer getMensajesIaUsados() {
        return mensajesIaUsados == null ? 0 : mensajesIaUsados;
    }
    public void setMensajesIaUsados(Integer n) {
        this.mensajesIaUsados = n == null ? 0 : n;
    }

}