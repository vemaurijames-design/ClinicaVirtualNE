package com.clinica.holistica.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "contactos")
@Data
@NoArgsConstructor
public class Contacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 20)
    private String telefono;

    @Column(length = 100)
    private String tipo; // Consulta, Urgencia, Información, Sugerencia

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mensaje;

    @Column(length = 20)
    private String estado = "NUEVO"; // NUEVO | LEIDO | RESPONDIDO

    @Column(updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
}
