package com.clinica.holistica.repository;

import com.clinica.holistica.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByPacienteIdOrderByFechaHoraDesc(Long pacienteId);
    List<Cita> findAllByOrderByFechaHoraDesc();
}