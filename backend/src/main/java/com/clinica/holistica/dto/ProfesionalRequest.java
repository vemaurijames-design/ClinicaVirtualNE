package com.clinica.holistica.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ProfesionalRequest {
    private String nombre;
    private String email;
    private String telefono;
    private String especialidad;
    private String meetLink;
    private String modalidad;
    private Boolean activo;

}