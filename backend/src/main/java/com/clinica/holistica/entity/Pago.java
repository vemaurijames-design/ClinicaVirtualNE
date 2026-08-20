package com.clinica.holistica.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(length = 50, nullable = false)
    private String programa; // mes1, mes2, mes3, mes4

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(length = 10)
    private String moneda = "COP";

    @Column(length = 100, unique = true)
    private String referencia;

    @Column(length = 100)
    private String wompiTransactionId;

    @Column(length = 30)
    private String estado = "PENDIENTE"; // PENDIENTE | APROBADO | RECHAZADO

    private LocalDateTime creadoEn = LocalDateTime.now();
    private LocalDateTime pagadoEn;
    private LocalDateTime activadoHasta;

}