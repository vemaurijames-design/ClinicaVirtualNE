package com.clinica.holistica.service;

import com.clinica.holistica.entity.Cita;
import com.clinica.holistica.entity.Profesional;
import com.clinica.holistica.entity.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class CitaMailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:infoclinicavirtual@gmail.com}")
    private String from;

    @Value("${app.mail.clinic-email:infoclinicavirtual@gmail.com}")
    private String clinicEmail;

    public CitaMailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void notificarAgendamiento(Cita cita) {
        if (cita == null) return;

        Usuario paciente = cita.getPaciente();
        Profesional prof = cita.getProfesional();

        String fecha = cita.getFechaHora() != null ? cita.getFechaHora().toString() : "Por confirmar";
        String modalidad = cita.getModalidad() != null ? cita.getModalidad() : "—";
        String notas = cita.getNotasPaciente() != null ? cita.getNotasPaciente() : "—";
        String meet = cita.getMeetLink() != null ? cita.getMeetLink() : "Se enviará antes de la cita";

        // Correo al paciente
        if (paciente != null && paciente.getEmail() != null) {
            enviar(
                    paciente.getEmail(),
                    "Cita confirmada — Clínica Virtual",
                    "Hola " + safe(paciente.getNombre()) + ",\n\n" +
                            "Su cita quedó registrada.\n\n" +
                            "Modalidad: " + modalidad + "\n" +
                            "Fecha/hora: " + fecha + "\n" +
                            (prof != null ? "Profesional: " + safe(prof.getNombre()) + " (" + safe(prof.getEspecialidad()) + ")\n" : "Apoyo IA / chat\n") +
                            "Meet: " + meet + "\n" +
                            "Notas: " + notas + "\n\n" +
                            "Emergencia: Línea de la Vida 800-911-2000 o 123.\n\n" +
                            "Consultorio Holístico"
            );
        }

        // Correo al profesional (si es VIRTUAL_REAL)
        if (prof != null && prof.getEmail() != null && !prof.getEmail().isBlank()) {
            enviar(
                    prof.getEmail(),
                    "Nueva cita agendada — Clínica Virtual",
                    "Se agendó una cita con usted.\n\n" +
                            "Paciente: " + (paciente != null ? safe(paciente.getNombre()) : "—") + "\n" +
                            "Email paciente: " + (paciente != null ? safe(paciente.getEmail()) : "—") + "\n" +
                            "Fecha/hora: " + fecha + "\n" +
                            "Modalidad: " + modalidad + "\n" +
                            "Meet: " + meet + "\n" +
                            "Notas del paciente: " + notas + "\n\n" +
                            "Consultorio Holístico"
            );
        }

        // Copia a la clínica
        enviar(
                clinicEmail,
                "Cita registrada — " + modalidad,
                "Nueva cita en el sistema.\n\n" +
                        "Paciente: " + (paciente != null ? safe(paciente.getNombre()) + " <" + safe(paciente.getEmail()) + ">" : "—") + "\n" +
                        "Profesional: " + (prof != null ? safe(prof.getNombre()) : "Apoyo IA") + "\n" +
                        "Fecha: " + fecha + "\n" +
                        "Notas: " + notas
        );
    }

    private void enviar(String to, String subject, String text) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(text);
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("No se pudo enviar correo a " + to + ": " + e.getMessage());
        }
    }

    private static String safe(String s) {
        return s == null ? "—" : s;
    }
}