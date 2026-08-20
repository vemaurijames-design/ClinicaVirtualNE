package com.clinica.holistica.repository;

import com.clinica.holistica.entity.HistoriaClinica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {

    List<HistoriaClinica> findByUsuarioId(Long usuarioId);

    List<HistoriaClinica> findByUsuarioIdOrderByIdDesc(Long usuarioId);

    List<HistoriaClinica> findAllByOrderByIdDesc();

    @Query("SELECT h FROM HistoriaClinica h LEFT JOIN FETCH h.usuario ORDER BY h.id DESC")
    List<HistoriaClinica> findAllWithUsuario();
}