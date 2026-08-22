package com.clinica.holistica.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Setter
@Getter
public class HistoriaRequest {

    private Map<String, String> respuestas;
    private Boolean consentimientoAceptado;


}