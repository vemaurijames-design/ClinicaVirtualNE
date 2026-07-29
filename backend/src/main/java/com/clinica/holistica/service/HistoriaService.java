package com.clinica.holistica.service;

import com.clinica.holistica.dto.HistoriaRequest;
import com.clinica.holistica.entity.HistoriaClinica;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.HistoriaClinicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HistoriaService {

    private final HistoriaClinicaRepository historiaRepo;
    private final GeminiService geminiService;

    public HistoriaClinica guardarHistoria(HistoriaRequest req, Usuario usuario) {
        Map<String, String> r = req.getRespuestas();
        HistoriaClinica h = new HistoriaClinica();

        h.setUsuario(usuario);
        h.setNombre(r.get("nombre"));
        h.setEdad(r.get("edad"));
        h.setGenero(r.get("genero"));
        h.setCiudad(r.get("ciudad"));
        h.setMotivoConsulta(r.get("motivo_consulta"));
        h.setSustancias(r.get("sustancias"));
        h.setEdadInicio(r.get("edad_inicio"));
        h.setSustanciaPrincipal(r.get("sustancia_principal"));
        h.setFrecuencia(r.get("frecuencia"));
        h.setUltimoConsumo(r.get("ultimo_consumo"));

        String escala = r.get("abstinencia_escala");
        if (escala != null && !escala.isBlank()) {
            try { h.setAbstinenciaEscala(Integer.parseInt(escala)); } catch (NumberFormatException ignored) {}
        }

        h.setAtencionPsicologica(r.get("atencion_psicologica"));
        h.setAtencionPsiquiatrica(r.get("atencion_psiquiatrica"));
        h.setDiagnosticos(r.get("diagnosticos"));
        h.setMedicamentos(r.get("medicamentos"));
        h.setIdeacion(r.get("ideacion"));
        h.setEnfermedades(r.get("enfermedades"));
        h.setAntecedentesFamiliares(r.get("antecedentes_familiares"));
        h.setCuantosFamiliares(r.get("cuantos_familiares"));
        h.setCualesFamiliares(r.get("cuales_familiares"));
        h.setSituacionLaboral(r.get("situacion_laboral"));
        h.setRedApoyo(r.get("red_apoyo"));
        h.setMotivacion(r.get("motivacion"));
        h.setExpectativas(r.get("expectativas"));
        h.setConsentimientoAceptado(req.getConsentimientoAceptado());

        if (Boolean.TRUE.equals(req.getConsentimientoAceptado())) {
            h.setConsentimientoFecha(LocalDateTime.now());
        }

        return historiaRepo.save(h);
    }

    public HistoriaClinica guardarDiagnosticoIa(Long historiaId, String diagnosticoJson,
                                                 String nivelRiesgo, String programaRecomendado) {
        HistoriaClinica h = historiaRepo.findById(historiaId)
                .orElseThrow(() -> new RuntimeException("Historia no encontrada"));
        h.setDiagnosticoIa(diagnosticoJson);
        h.setNivelRiesgo(nivelRiesgo);
        h.setProgramaRecomendado(programaRecomendado);
        return historiaRepo.save(h);
    }

    public List<HistoriaClinica> obtenerPorUsuario(Long usuarioId) {
        return historiaRepo.findByUsuarioId(usuarioId);
    }

    public List<HistoriaClinica> obtenerTodas() {
        return historiaRepo.findAll();
    }
}
