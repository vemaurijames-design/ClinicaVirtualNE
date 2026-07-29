package com.clinica.holistica.service;

import com.clinica.holistica.dto.ContactoRequest;
import com.clinica.holistica.entity.Contacto;
import com.clinica.holistica.repository.ContactoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactoService {

    private final ContactoRepository contactoRepo;

    public Contacto guardar(ContactoRequest req) {
        Contacto c = new Contacto();
        c.setNombre(req.getNombre());
        c.setTelefono(req.getTelefono());
        c.setTipo(req.getTipo());
        c.setMensaje(req.getMensaje());
        c.setEstado("NUEVO");
        return contactoRepo.save(c);
    }

    public List<Contacto> obtenerTodos() {
        return contactoRepo.findAll();
    }

    public List<Contacto> obtenerNuevos() {
        return contactoRepo.findByEstadoOrderByCreadoEnDesc("NUEVO");
    }
}
