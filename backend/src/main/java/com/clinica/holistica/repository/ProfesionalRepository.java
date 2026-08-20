package com.clinica.holistica.repository;

import com.clinica.holistica.entity.Profesional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface ProfesionalRepository extends JpaRepository<Profesional, Long> {
    boolean existsByEmail(String email);
    List<Profesional> findByActivoTrue();
}