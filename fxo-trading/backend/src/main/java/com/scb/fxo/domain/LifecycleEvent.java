package com.scb.fxo.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Data
public class LifecycleEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String tradeId;
    @Enumerated(EnumType.STRING)
    private LifecycleEventType eventType;
    private String payload;
    private Instant timestamp;
}
