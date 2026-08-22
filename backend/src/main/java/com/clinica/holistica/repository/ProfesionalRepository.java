package com.clinica.holistica.repository;

import com.clinica.holistica.entity.Profesional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;


public interface ProfesionalRepository extends JpaRepository<Profesional, Long> {
    boolean existsByEmail(String email);
    List<Profesional> findByActivoTrue();
    Optional<Profesional> findByEmail(String email);
}