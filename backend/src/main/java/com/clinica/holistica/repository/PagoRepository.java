package com.clinica.holistica.repository;

import com.clinica.holistica.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByUsuarioIdOrderByCreadoEnDesc(Long usuarioId);

    Optional<Pago> findByReferencia(String referencia);

    Optional<Pago> findByWompiTransactionId(String wompiTransactionId);

    List<Pago> findByEstado(String estado);

    public final class PreciosPrograma {
        private PreciosPrograma() {}
        public static BigDecimal de(String p) {
            return switch (p == null ? "" : p.toLowerCase()) {
                case "mes2" -> new BigDecimal("650000");
                case "mes3" -> new BigDecimal("900000");
                case "mes4" -> new BigDecimal("1100000");
                default -> new BigDecimal("350000");
            };
        }
    }
}