package com.clinica.holistica.service;

import com.clinica.holistica.dto.ObservacionRequest;
import com.clinica.holistica.entity.HistoriaClinica;
import com.clinica.holistica.entity.ObservacionMedica;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.HistoriaClinicaRepository;
import com.clinica.holistica.repository.ObservacionMedicaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MedicoService {

    private final HistoriaClinicaRepository historiaRepo;
    private final ObservacionMedicaRepository obsRepo;

    public MedicoService(HistoriaClinicaRepository historiaRepo,
                         ObservacionMedicaRepository obsRepo) {
        this.historiaRepo = historiaRepo;
        this.obsRepo = obsRepo;
    }

    /**
     * Lista historias para el panel médico (Map plano, sin ciclos JSON).
     * Usa JOIN FETCH del usuario para evitar LazyInitializationException
     * cuando spring.jpa.open-in-view=false.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarHistorias() {
        List<HistoriaClinica> list;
        try {
            // Preferir query con fetch si existe en el repo
            list = historiaRepo.findAllWithUsuario();
        } catch (Exception ex) {
            // Fallback si aún no agregaste el método al repository
            list = historiaRepo.findAll();
        }

        list.sort((a, b) -> Long.compare(
                b.getId() != null ? b.getId() : 0L,
                a.getId() != null ? a.getId() : 0L
        ));

        List<Map<String, Object>> out = new ArrayList<>();
        for (HistoriaClinica h : list) {
            out.add(mapHistoria(h));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarObservaciones(Long historiaId) {
        List<ObservacionMedica> list = obsRepo.findByHistoriaIdOrderByCreadoEnDesc(historiaId);
        List<Map<String, Object>> out = new ArrayList<>();
        for (ObservacionMedica o : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", o.getId());
            m.put("texto", o.getTexto());
            m.put("validaIa", Boolean.TRUE.equals(o.getValidaIa()));
            m.put("creadoEn", o.getCreadoEn());
            m.put("medicoNombre", nombreDeUsuario(o.getMedico()));
            out.add(m);
        }
        return out;
    }

    @Transactional
    public Map<String, Object> guardarObservacion(Long historiaId, ObservacionRequest req, Usuario medico) {
        if (req == null || req.getTexto() == null || req.getTexto().isBlank()) {
            throw new RuntimeException("La observación no puede estar vacía");
        }

        HistoriaClinica h = historiaRepo.findById(historiaId)
                .orElseThrow(() -> new RuntimeException("Historia no encontrada"));

        ObservacionMedica o = new ObservacionMedica();
        o.setHistoria(h);
        o.setMedico(medico);
        o.setTexto(req.getTexto().trim());
        o.setValidaIa(Boolean.TRUE.equals(req.getValidaIa()));
        o.setCreadoEn(LocalDateTime.now());
        o = obsRepo.save(o);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", o.getId());
        m.put("texto", o.getTexto());
        m.put("validaIa", o.getValidaIa());
        m.put("creadoEn", o.getCreadoEn());
        m.put("medicoNombre", nombreDeUsuario(medico));
        return m;
    }

    // ── helpers ──────────────────────────────────────────────

    private Map<String, Object> mapHistoria(HistoriaClinica h) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", h.getId());
        m.put("nombre", safe(h.getNombre()));
        m.put("edad", safe(h.getEdad()));
        m.put("genero", safe(h.getGenero()));
        m.put("ciudad", safe(h.getCiudad()));
        m.put("motivoConsulta", safe(h.getMotivoConsulta()));
        m.put("sustancias", safe(h.getSustancias()));
        m.put("sustanciaPrincipal", safe(h.getSustanciaPrincipal()));
        m.put("frecuencia", safe(h.getFrecuencia()));
        m.put("ultimoConsumo", safe(h.getUltimoConsumo()));
        //m.put("ideacion", safe(h.getIdeacion()));
        m.put("diagnosticos", safe(h.getDiagnosticos()));
        m.put("enfermedades", safe(h.getEnfermedades()));
        m.put("nivelRiesgo", safe(h.getNivelRiesgo()));
        m.put("programaRecomendado", safe(h.getProgramaRecomendado()));
        m.put("diagnosticoIa", h.getDiagnosticoIa()); // puede ser null
        m.put("consentimientoFecha", h.getConsentimientoFecha());

        try {
            Usuario u = h.getUsuario();
            if (u != null) {
                m.put("usuarioId", u.getId());
                m.put("usuarioEmail", u.getEmail());
                m.put("usuarioNombre", nombreDeUsuario(u));
            }
        } catch (Exception ignored) {
            // Lazy o sin usuario: no romper el listado
        }
        return m;
    }

    /** Compatible con getNombre() o getName() según tu entidad Usuario */
    private String nombreDeUsuario(Usuario u) {
        if (u == null) return null;
        try {
            // Preferir nombre (español)
            String n = u.getNombre();
            if (n != null && !n.isBlank()) return n;
        } catch (Throwable ignored) { }
        try {
            // Alternativa en inglés si tu entidad usa "name"
            java.lang.reflect.Method m = u.getClass().getMethod("getName");
            Object v = m.invoke(u);
            if (v != null && !String.valueOf(v).isBlank()) return String.valueOf(v);
        } catch (Throwable ignored) { }
        return u.getEmail();
    }

    private String safe(String v) {
        return v == null ? null : v;
    }
}