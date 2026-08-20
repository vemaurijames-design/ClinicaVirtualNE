package com.clinica.holistica.config;

import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        crearAdmin();
        crearProfesionalDemo(
                "Dra. Ana López",
                "psicologa@clinicavirtual.com",
                "PSICOLOGO",
                "Psicología clínica y adicciones",
                "3001112233",
                "https://meet.google.com/aaa-bbbb-ccc"
        );
        crearProfesionalDemo(
                "Dr. Carlos Ruiz",
                "psiquiatra@clinicavirtual.com",
                "PSIQUIATRA",
                "Psiquiatría · salud mental",
                "3004445566",
                "https://meet.google.com/ddd-eeee-fff"
        );
        crearProfesionalDemo(
                "Dr. Nikolas Escobar",
                "medico@clinicavirtual.com",
                "MEDICO",
                "Medicina holística · adicciones",
                "3007778899",
                "https://meet.google.com/ggg-hhhh-iii"
        );
    }

    private void crearAdmin() {
        String adminEmail = "infoclinicavirtual@gmail.com";
        if (!usuarioRepo.existsByEmail(adminEmail)) {
            Usuario admin = new Usuario();
            admin.setNombre("Administrador Clínica");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("admin123456"));
            admin.setRol("ADMIN");
            usuarioRepo.save(admin);
            log.info("✅ Admin creado: {} / admin123456", adminEmail);
        } else {
            log.info("ℹ️  Admin ya existe: {}", adminEmail);
        }
    }

    private void crearProfesionalDemo(
            String nombre,
            String email,
            String rol,
            String especialidad,
            String telefono,
            String meetLink
    ) {
        if (usuarioRepo.existsByEmail(email)) {
            log.info("ℹ️  Profesional ya existe: {}", email);
            return;
        }
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode("Profesional123"));
        u.setRol(rol);
        u.setEspecialidad(especialidad);
        u.setTelefono(telefono);
        u.setMeetLink(meetLink);
        u.setModalidadAtencion("VIRTUAL");
        usuarioRepo.save(u);
        log.info("✅ Profesional creado: {} / {} / pass Profesional123", email, rol);
    }
}