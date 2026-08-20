package com.clinica.holistica.repository;

import com.clinica.holistica.entity.ObservacionMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ObservacionMedicaRepository extends JpaRepository<ObservacionMedica, Long> {
    List<ObservacionMedica> findByHistoriaIdOrderByCreadoEnDesc(Long historiaId);
}