package com.clinica.holistica.config;

import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seed: creates the default admin account on first startup if it doesn't exist.
 * Credentials: admin@clinica.com / Admin2024!
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@clinica.com";
        if (!usuarioRepo.existsByEmail(adminEmail)) {
            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("Admin2024!"));
            admin.setRol("ADMIN");
            admin.setActivo(true);
            admin.setCreadoEn(LocalDateTime.now());
            usuarioRepo.save(admin);
            log.info("✅ Admin creado: {} / Admin2024!", adminEmail);
        } else {
            log.info("ℹ️  Admin ya existe: {}", adminEmail);
        }
    }
}
