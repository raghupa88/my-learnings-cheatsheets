package com.scb.fxo.service;

import com.scb.fxo.domain.GreeksSnapshot;
import com.scb.fxo.domain.Trade;
import com.scb.fxo.domain.TradeStatus;
import com.scb.fxo.repository.GreeksSnapshotRepository;
import com.scb.fxo.repository.TradeRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class GreeksEngine {

    private final TradeRepository tradeRepository;
    private final GreeksSnapshotRepository greeksSnapshotRepository;
    private final KafkaPublisher kafkaPublisher;

    public GreeksEngine(TradeRepository tradeRepository,
                        GreeksSnapshotRepository greeksSnapshotRepository,
                        KafkaPublisher kafkaPublisher) {
        this.tradeRepository = tradeRepository;
        this.greeksSnapshotRepository = greeksSnapshotRepository;
        this.kafkaPublisher = kafkaPublisher;
    }

    @Scheduled(fixedRate = 5000)
    public void computeGreeks() {
        List<Trade> activeTrades = tradeRepository.findByStatus(TradeStatus.ACTIVE);
        long t = System.currentTimeMillis();
        AtomicInteger idx = new AtomicInteger(0);
        activeTrades.forEach(trade -> {
            int i = idx.getAndIncrement();
            GreeksSnapshot snap = new GreeksSnapshot();
            snap.setTradeId(trade.getId());
            snap.setDelta(0.5 + 0.3 * Math.sin(t / 10000.0 + i));
            snap.setGamma(0.02 + 0.01 * Math.cos(t / 8000.0 + i));
            snap.setVega(0.15 + 0.05 * Math.sin(t / 12000.0 + i));
            snap.setTheta(-0.03 - 0.01 * Math.abs(Math.sin(t / 9000.0 + i)));
            snap.setTimestamp(Instant.now());
            greeksSnapshotRepository.save(snap);
            kafkaPublisher.publish("fxo.greeks.updated", trade.getId(), snap);
        });
    }
}
