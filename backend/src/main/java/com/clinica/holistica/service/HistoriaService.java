package com.clinica.holistica.service;

import com.clinica.holistica.dto.HistoriaRequest;
import com.clinica.holistica.entity.HistoriaClinica;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.HistoriaClinicaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class HistoriaService {

    private final HistoriaClinicaRepository historiaRepo;

    public HistoriaService(HistoriaClinicaRepository historiaRepo) {
        this.historiaRepo = historiaRepo;
    }

    @Transactional
    public HistoriaClinica guardarHistoria(HistoriaRequest req, Usuario usuario) {
        if (usuario == null) {
            throw new RuntimeException("Usuario no autenticado");
        }
        if (!Boolean.TRUE.equals(req.getConsentimientoAceptado())) {
            throw new RuntimeException("Debe aceptar el consentimiento informado");
        }

        Map<String, String> r = req.getRespuestas();
        if (r == null || r.isEmpty()) {
            throw new RuntimeException("No se recibieron respuestas de la historia clínica");
        }

        HistoriaClinica h = new HistoriaClinica();
        h.setUsuario(usuario);

        // Identificación
        h.setNombre(val(r, "nombre"));
        h.setEdad(val(r, "edad"));
        h.setGenero(val(r, "genero"));
        h.setCiudad(val(r, "ciudad"));

        // Motivo
        h.setMotivoConsulta(val(r, "motivo_consulta"));

        // Consumo
        h.setSustancias(val(r, "sustancias"));
        h.setEdadInicio(val(r, "edad_inicio"));
        h.setSustanciaPrincipal(val(r, "sustancia_principal"));
        h.setFrecuencia(val(r, "frecuencia"));
        h.setUltimoConsumo(val(r, "ultimo_consumo"));

        // Escalas (craving / deseo + abstinencia)
        String craving = val(r, "craving");
        if (craving == null || craving.isBlank()) {
            craving = val(r, "deseo_consumir");
        }
        h.setDeseoConsumir(craving);
        h.setAbstinenciaEscala(val(r, "abstinencia_escala"));

        // Salud mental
        h.setAtencionPsicologica(val(r, "atencion_psicologica"));
        h.setAtencionPsiquiatrica(val(r, "atencion_psiquiatrica"));
        h.setDiagnosticos(val(r, "diagnosticos"));
        h.setEnfermedades(val(r, "enfermedades"));

        // Familia
        h.setAntecedentesFamiliares(val(r, "antecedentes_familiares"));
        h.setCuantosFamiliares(val(r, "cuantos_familiares"));
        h.setCualesFamiliares(val(r, "cuales_familiares"));

        // Cierre / social
        h.setSituacionLaboral(val(r, "situacion_laboral"));
        h.setRedApoyo(val(r, "red_apoyo"));
        h.setMotivacion(val(r, "motivacion"));
        h.setExpectativas(val(r, "expectativas"));

        // Consentimiento
        h.setConsentimientoAceptado(true);
        h.setConsentimientoFecha(LocalDateTime.now());

        return historiaRepo.save(h);
    }

    @Transactional
    public void guardarDiagnosticoIa(
            Long historiaId,
            String diagnosticoJson,
            String nivelRiesgo,
            String programaRecomendado
    ) {
        HistoriaClinica h = historiaRepo.findById(historiaId)
                .orElseThrow(() -> new RuntimeException("Historia no encontrada"));
        h.setDiagnosticoIa(diagnosticoJson);
        h.setNivelRiesgo(nivelRiesgo);
        h.setProgramaRecomendado(programaRecomendado);
        historiaRepo.save(h);
    }

    public List<HistoriaClinica> obtenerPorUsuario(Long usuarioId) {
        return historiaRepo.findByUsuarioIdOrderByIdDesc(usuarioId);
    }

    public List<HistoriaClinica> obtenerTodas() {
        return historiaRepo.findAllByOrderByIdDesc();
    }

    public HistoriaClinica obtenerPorId(Long id) {
        return historiaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Historia no encontrada"));
    }

    private static String val(Map<String, String> r, String key) {
        if (r == null) {
            return null;
        }
        String v = r.get(key);
        return v != null ? v.trim() : null;
    }
}