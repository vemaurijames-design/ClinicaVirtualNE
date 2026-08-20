package com.clinica.holistica.dto;

import java.math.BigDecimal;

public class PagoRequest {
    private String programa;
    private BigDecimal monto;
    private String moneda;
    private String modo; // DEMO | WOMPI

    public String getPrograma() { return programa; }
    public void setPrograma(String programa) { this.programa = programa; }
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
    public String getModo() { return modo; }
    public void setModo(String modo) { this.modo = modo; }
}