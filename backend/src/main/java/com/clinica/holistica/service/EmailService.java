package com.clinica.holistica.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.mail.clinic-email}")
    private String clinicEmail;

    public void enviarTokenRecuperacion(String emailDestino, String token) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(emailDestino);
        msg.setSubject("Recuperación de contraseña — Clínica Virtual");
        msg.setText(
                "Hola,\n\n" +
                        "Recibimos una solicitud para restablecer tu contraseña.\n\n" +
                        "Tu código de recuperación es:\n\n" +
                        "    " + token + "\n\n" +
                        "Válido por 1 hora.\n" +
                        "Si no solicitaste este cambio, ignora este correo.\n\n" +
                        "— Clínica Virtual / Consultorio Holístico"
        );
        mailSender.send(msg);
        log.info("Email de recuperación enviado a {}", emailDestino);
    }

    public void notificarMedicoNuevaHistoria(String nombrePaciente, Long historiaId, String nivelRiesgo) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(clinicEmail);
        msg.setSubject("[Clínica] Nueva historia clínica — " + nombrePaciente);
        msg.setText(
                "Se registró una nueva historia clínica.\n\n" +
                        "Paciente: " + nombrePaciente + "\n" +
                        "ID historia: " + historiaId + "\n" +
                        "Nivel de riesgo (IA): " + (nivelRiesgo != null ? nivelRiesgo : "Pendiente") + "\n\n" +
                        "Revisa el panel admin: /admin → Historias clínicas\n\n" +
                        "— Sistema Clínica Virtual"
        );
        try {
            mailSender.send(msg);
            log.info("Notificación enviada al médico por historia {}", historiaId);
        } catch (Exception e) {
            log.error("No se pudo notificar al médico: {}", e.getMessage());
        }
    }
}