package com.scb.fxo.service;

import com.scb.fxo.domain.LifecycleEvent;
import com.scb.fxo.domain.LifecycleEventType;
import com.scb.fxo.domain.Trade;
import com.scb.fxo.domain.TradeStatus;
import com.scb.fxo.repository.LifecycleEventRepository;
import com.scb.fxo.repository.TradeRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class LifecycleService {

    private final TradeRepository tradeRepository;
    private final LifecycleEventRepository lifecycleEventRepository;
    private final KafkaPublisher kafkaPublisher;

    public LifecycleService(TradeRepository tradeRepository,
                            LifecycleEventRepository lifecycleEventRepository,
                            KafkaPublisher kafkaPublisher) {
        this.tradeRepository = tradeRepository;
        this.lifecycleEventRepository = lifecycleEventRepository;
        this.kafkaPublisher = kafkaPublisher;
    }

    public Optional<LifecycleEvent> triggerEvent(String tradeId, LifecycleEventType eventType) {
        return tradeRepository.findById(tradeId).map(trade -> {
            applyStatusTransition(trade, eventType);
            tradeRepository.save(trade);

            LifecycleEvent event = new LifecycleEvent();
            event.setTradeId(tradeId);
            event.setEventType(eventType);
            event.setPayload(buildSwiftPreview(trade, eventType));
            event.setTimestamp(Instant.now());
            lifecycleEventRepository.save(event);
            kafkaPublisher.publish("fxo.lifecycle.event", tradeId, event);
            return event;
        });
    }

    private void applyStatusTransition(Trade trade, LifecycleEventType eventType) {
        switch (eventType) {
            case CONFIRMED -> trade.setStatus(TradeStatus.CONFIRMED);
            case SETTLED -> trade.setStatus(TradeStatus.SETTLED);
            case EXPIRED -> trade.setStatus(TradeStatus.EXPIRED);
            default -> { /* BARRIER_HIT stays ACTIVE */ }
        }
    }

    private String buildSwiftPreview(Trade trade, LifecycleEventType eventType) {
        return String.format(
            "{1:F01SCBLSGSGAXXX0000000000}{2:I300XXXXXXXXXXXXN}{4:\n" +
            ":15A:\n:20:%s\n:22A:%s\n:94A:AGNT\n:82A:SCBL SG SX\n" +
            ":30T:%s\n:30V:%s\n:36:%.4f\n:33B:USD%.0f\n-}",
            trade.getId().substring(0, 8).toUpperCase(),
            eventType.name(),
            trade.getCreatedAt() != null ? trade.getCreatedAt().toString().substring(0, 10) : "",
            trade.getExpiry(),
            trade.getStrike() != null ? trade.getStrike() : 0.0,
            trade.getNotional() != null ? trade.getNotional() : 0.0
        );
    }
}
