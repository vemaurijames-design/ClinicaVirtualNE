package com.clinica.holistica.service;

import com.clinica.holistica.dto.AuthRequest;
import com.clinica.holistica.dto.AuthResponse;
import com.clinica.holistica.dto.RegisterRequest;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.UsuarioRepository;
import com.clinica.holistica.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse registrar(RegisterRequest req) {
        if (usuarioRepo.existsByEmail(req.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario u = new Usuario();
        u.setNombre(req.getNombre());
        u.setEmail(req.getEmail().toLowerCase().trim());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setRol("PACIENTE");
        u.setActivo(true);
        u.setCreadoEn(LocalDateTime.now());
        usuarioRepo.save(u);

        String token = jwtUtil.generateToken(u.getEmail(), u.getRol());
        return new AuthResponse(token, u.getNombre(), u.getEmail(), u.getRol());
    }

    public AuthResponse login(AuthRequest req) {
        Usuario u = usuarioRepo.findByEmail(req.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Email o contraseña incorrectos"));

        if (!u.getActivo()) {
            throw new RuntimeException("Cuenta inactiva. Contacte al administrador.");
        }

        if (!passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) {
            throw new RuntimeException("Email o contraseña incorrectos");
        }

        u.setUltimoAcceso(LocalDateTime.now());
        usuarioRepo.save(u);

        String token = jwtUtil.generateToken(u.getEmail(), u.getRol());
        return new AuthResponse(token, u.getNombre(), u.getEmail(), u.getRol());
    }

    public String solicitarReset(String email) {
        Usuario u = usuarioRepo.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Email no encontrado"));

        String token = UUID.randomUUID().toString();
        u.setResetToken(token);
        u.setResetTokenExpira(LocalDateTime.now().plusHours(1));
        usuarioRepo.save(u);

        // En producción enviar por email; aquí retornamos el token para la demo
        return token;
    }

    public void cambiarPassword(String token, String nuevaPassword) {
        Usuario u = usuarioRepo.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido o expirado"));

        if (u.getResetTokenExpira().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token ha expirado");
        }

        u.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        u.setResetToken(null);
        u.setResetTokenExpira(null);
        usuarioRepo.save(u);
    }
}
