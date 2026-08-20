package com.clinica.holistica.repository;

import com.clinica.holistica.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByUsuarioIdOrderByCreadoEnDesc(Long usuarioId);
}