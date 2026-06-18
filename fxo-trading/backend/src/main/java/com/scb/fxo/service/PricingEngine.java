package com.scb.fxo.service;

import com.scb.fxo.domain.RFQ;
import com.scb.fxo.domain.RFQStatus;
import com.scb.fxo.repository.RFQRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class PricingEngine {

    private static final Logger log = LoggerFactory.getLogger(PricingEngine.class);

    private static final Map<String, Double> MID_RATES = Map.of(
        "USD/INR", 83.5,
        "EUR/USD", 1.085,
        "GBP/USD", 1.265,
        "USD/JPY", 149.5,
        "AUD/USD", 0.653
    );

    private final RFQRepository rfqRepository;
    private final KafkaPublisher kafkaPublisher;

    public PricingEngine(RFQRepository rfqRepository, KafkaPublisher kafkaPublisher) {
        this.rfqRepository = rfqRepository;
        this.kafkaPublisher = kafkaPublisher;
    }

    @KafkaListener(topics = "fxo.rfq.created", groupId = "pricing-engine")
    public void handleRFQ(String rfqId) {
        rfqRepository.findById(rfqId).ifPresent(rfq -> {
            try { Thread.sleep(800); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            double mid = MID_RATES.getOrDefault(rfq.getCurrencyPair(), 1.0);
            rfq.setBidRate(Math.round(mid * 0.995 * 10000.0) / 10000.0);
            rfq.setOfferRate(Math.round(mid * 1.005 * 10000.0) / 10000.0);
            rfq.setStatus(RFQStatus.QUOTED);
            rfqRepository.save(rfq);
            kafkaPublisher.publish("fxo.quote.returned", rfqId, rfq);
            log.info("Priced RFQ {} bid={} offer={}", rfqId, rfq.getBidRate(), rfq.getOfferRate());
        });
    }
}
