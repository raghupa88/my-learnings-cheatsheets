package com.scb.fxo.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Data
public class RFQ {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String requestingUserId;
    private String currencyPair;
    private Double notional;
    @Enumerated(EnumType.STRING)
    private TradeType type;
    @Enumerated(EnumType.STRING)
    private RFQStatus status;
    private Double bidRate;
    private Double offerRate;
    private Instant createdAt;
}
