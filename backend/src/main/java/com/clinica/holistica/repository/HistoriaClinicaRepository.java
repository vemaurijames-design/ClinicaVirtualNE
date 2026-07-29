package com.clinica.holistica.repository;

import com.clinica.holistica.entity.HistoriaClinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {
    List<HistoriaClinica> findByUsuarioId(Long usuarioId);
    Optional<HistoriaClinica> findTopByUsuarioIdOrderByCreadoEnDesc(Long usuarioId);
}
