package com.scb.fxo.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Data
public class Trade {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String rfqId;
    @Enumerated(EnumType.STRING)
    private TradeType type;
    private String currencyPair;
    private Double notional;
    private Double strike;
    private String expiry;
    private Double premium;
    @Enumerated(EnumType.STRING)
    private TradeStatus status;
    private String userId;
    private String role;
    private Instant createdAt;
}
