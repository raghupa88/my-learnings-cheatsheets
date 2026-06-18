package com.scb.fxo.controller;

import com.scb.fxo.domain.RFQ;
import com.scb.fxo.domain.RFQStatus;
import com.scb.fxo.dto.RFQRequest;
import com.scb.fxo.repository.RFQRepository;
import com.scb.fxo.service.KafkaPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/rfq")
public class RFQController {

    private final RFQRepository rfqRepository;
    private final KafkaPublisher kafkaPublisher;

    public RFQController(RFQRepository rfqRepository, KafkaPublisher kafkaPublisher) {
        this.rfqRepository = rfqRepository;
        this.kafkaPublisher = kafkaPublisher;
    }

    @PostMapping
    public RFQ createRFQ(@RequestBody RFQRequest request) {
        RFQ rfq = new RFQ();
        rfq.setRequestingUserId(request.getRequestingUserId());
        rfq.setCurrencyPair(request.getCurrencyPair());
        rfq.setNotional(request.getNotional());
        rfq.setType(request.getType());
        rfq.setStatus(RFQStatus.PENDING);
        rfq.setCreatedAt(Instant.now());
        rfqRepository.save(rfq);
        kafkaPublisher.publish("fxo.rfq.created", rfq.getId(), rfq.getId());
        return rfq;
    }

    @GetMapping("/{id}")
    public ResponseEntity<RFQ> getRFQ(@PathVariable String id) {
        return rfqRepository.findById(id).map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<RFQ> getAllRFQs() {
        return rfqRepository.findAll();
    }
}
