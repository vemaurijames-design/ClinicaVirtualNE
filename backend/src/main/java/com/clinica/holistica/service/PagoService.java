package com.clinica.holistica.service;

import com.clinica.holistica.dto.PagoRequest;
import com.clinica.holistica.entity.Pago;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.PagoRepository;
import com.clinica.holistica.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PagoService {

    private final PagoRepository pagoRepo;
    private final UsuarioRepository usuarioRepo;

    public PagoService(PagoRepository pagoRepo, UsuarioRepository usuarioRepo) {
        this.pagoRepo = pagoRepo;
        this.usuarioRepo = usuarioRepo;
    }

    @Transactional
    public Pago crearYActivarDemo(PagoRequest req, Usuario usuario) {
        if (usuario == null) {
            throw new RuntimeException("Debe iniciar sesión");
        }
        if (req.getPrograma() == null || req.getPrograma().isBlank()) {
            throw new RuntimeException("Indique el programa (mes1, mes2, ...)");
        }

        BigDecimal monto = req.getMonto() != null ? req.getMonto() : BigDecimal.valueOf(350000);
        int dias = diasPorPrograma(req.getPrograma());

        Pago pago = new Pago();
        pago.setUsuario(usuario);
        pago.setPrograma(req.getPrograma().toLowerCase());
        pago.setMonto(monto);
        pago.setMoneda(req.getMoneda() != null ? req.getMoneda() : "COP");
        pago.setReferencia("DEMO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        pago.setEstado("APROBADO");
        pago.setCreadoEn(LocalDateTime.now());
        pago.setPagadoEn(LocalDateTime.now());
        pago.setActivadoHasta(LocalDateTime.now().plusDays(dias));
        pago = pagoRepo.save(pago);

        // Activar plan en el usuario
        Usuario u = usuarioRepo.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        u.setPlanActivo(pago.getPrograma());
        u.setPlanActivoDesde(LocalDateTime.now());
        u.setPlanActivoHasta(pago.getActivadoHasta());
        usuarioRepo.save(u);

        return pago;
    }

    public List<Pago> misPagos(Long usuarioId) {
        return pagoRepo.findByUsuarioIdOrderByCreadoEnDesc(usuarioId);
    }

    private int diasPorPrograma(String p) {
        return switch (p.toLowerCase()) {
            case "mes2" -> 60;
            case "mes3" -> 90;
            case "mes4" -> 120;
            default -> 30; // mes1
        };
    }
}