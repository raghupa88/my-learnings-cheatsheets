package com.scb.fxo.controller;

import com.scb.fxo.domain.Trade;
import com.scb.fxo.domain.TradeStatus;
import com.scb.fxo.dto.TradeRequest;
import com.scb.fxo.repository.TradeRepository;
import com.scb.fxo.service.KafkaPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api")
public class TradeController {

    private final TradeRepository tradeRepository;
    private final KafkaPublisher kafkaPublisher;

    public TradeController(TradeRepository tradeRepository, KafkaPublisher kafkaPublisher) {
        this.tradeRepository = tradeRepository;
        this.kafkaPublisher = kafkaPublisher;
    }

    @PostMapping("/trade")
    public Trade bookTrade(@RequestBody TradeRequest request) {
        Trade trade = new Trade();
        trade.setRfqId(request.getRfqId());
        trade.setType(request.getType());
        trade.setCurrencyPair(request.getCurrencyPair());
        trade.setNotional(request.getNotional());
        trade.setStrike(request.getStrike());
        trade.setExpiry(request.getExpiry());
        trade.setPremium(request.getPremium());
        trade.setStatus(TradeStatus.ACTIVE);
        trade.setUserId(request.getUserId());
        trade.setRole(request.getRole());
        trade.setCreatedAt(Instant.now());
        tradeRepository.save(trade);
        kafkaPublisher.publish("fxo.trade.booked", trade.getId(), trade);
        return trade;
    }

    @GetMapping("/trade/{id}")
    public ResponseEntity<Trade> getTrade(@PathVariable String id) {
        return tradeRepository.findById(id).map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/trades")
    public List<Trade> getTrades(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.isBlank()) {
            return tradeRepository.findByUserId(userId);
        }
        return tradeRepository.findAll();
    }
}
