package com.clinica.holistica.service;

import com.clinica.holistica.entity.Pago;
import com.clinica.holistica.entity.Usuario;
import com.clinica.holistica.repository.PagoRepository;
import com.clinica.holistica.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepo;
    private final UsuarioRepository usuarioRepo;

    @Value("${wompi.public-key}")
    private String publicKey;

    @Value("${wompi.integrity-secret}")
    private String integritySecret;

    // Precios en centavos COP (Wompi usa centavos)
    private static final Map<String, Long> PRECIOS_CENTAVOS = Map.of(
            "mes1", 35000000L,  // $350.000
            "mes2", 65000000L,
            "mes3", 90000000L,
            "mes4", 110000000L
    );

    public Map<String, Object> crearPago(Usuario usuario, String programa) {
        if (!PRECIOS_CENTAVOS.containsKey(programa)) {
            throw new RuntimeException("Programa inválido");
        }
        long amountInCents = PRECIOS_CENTAVOS.get(programa);
        String reference = "CH-" + usuario.getId() + "-" + UUID.randomUUID().toString().substring(0, 8);

        Pago pago = new Pago();
        pago.setUsuario(usuario);
        pago.setPrograma(programa);
        pago.setMonto(BigDecimal.valueOf(amountInCents).movePointLeft(2));
        pago.setMoneda("COP");
        pago.setReferencia(reference);
        pago.setEstado("PENDIENTE");
        pagoRepo.save(pago);

        // Firma integrity: reference + amountInCents + currency + integritySecret
        String cadena = reference + amountInCents + "COP" + integritySecret;
        String signature = sha256(cadena);

        return Map.of(
                "publicKey", publicKey,
                "currency", "COP",
                "amountInCents", amountInCents,
                "reference", reference,
                "signature", signature,
                "programa", programa,
                "pagoId", pago.getId()
        );
    }

    @Transactional
    public void confirmarPagoAprobado(String reference, String wompiTxId) {
        Pago pago = pagoRepo.findByReferencia(reference)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));

        if ("APROBADO".equals(pago.getEstado())) return; // idempotente

        pago.setEstado("APROBADO");
        pago.setWompiTransactionId(wompiTxId);
        pago.setPagadoEn(LocalDateTime.now());

        LocalDateTime hasta = LocalDateTime.now().plusDays(30);
        pago.setActivadoHasta(hasta);
        pagoRepo.save(pago);

        Usuario u = pago.getUsuario();
        String programa = "";
        u.setPlanActivo(programa);
        u.setPlanActivo(pago.getPrograma());
        u.setPlanActivoDesde(LocalDateTime.now());
        u.setPlanActivoHasta(pago.getActivadoHasta());

        usuarioRepo.save(u);
    }

    private String sha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(integritySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            // Wompi usa SHA256 simple de la cadena (no HMAC) en integrity — según docs:
            // reference + amountInCents + currency + integritySecret → SHA256
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error firmando pago", e);
        }
    }
}