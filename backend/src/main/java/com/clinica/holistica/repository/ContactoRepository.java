package com.clinica.holistica.repository;

import com.clinica.holistica.entity.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContactoRepository extends JpaRepository<Contacto, Long> {
    List<Contacto> findByEstadoOrderByCreadoEnDesc(String estado);
    long countByEstado(String estado);
}
