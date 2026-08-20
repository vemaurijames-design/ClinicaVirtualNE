package com.clinica.holistica.repository;

import com.clinica.holistica.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    @Query("""
        SELECT c FROM Cita c
        LEFT JOIN FETCH c.paciente
        LEFT JOIN FETCH c.profesional
        WHERE c.paciente.id = :pid
        ORDER BY c.fechaHora DESC
        """)
    List<Cita> findByPacienteIdOrderByFechaHoraDesc(@Param("pid") Long pacienteId);

    @Query("""
        SELECT c FROM Cita c
        LEFT JOIN FETCH c.paciente
        LEFT JOIN FETCH c.profesional
        ORDER BY c.fechaHora DESC
        """)
    List<Cita> findAllByOrderByFechaHoraDesc();
}