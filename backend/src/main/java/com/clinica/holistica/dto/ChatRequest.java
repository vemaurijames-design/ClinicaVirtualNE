package com.clinica.holistica.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Setter
@Getter
public class ChatRequest {

    private String mensaje;
    private String rolProfesional;
    private String motivoCita;
    private String programa;
    private String fase; // ESCUCHAR | RECOMENDAR | CIERRE
    private List<Map<String, String>> historial;

}