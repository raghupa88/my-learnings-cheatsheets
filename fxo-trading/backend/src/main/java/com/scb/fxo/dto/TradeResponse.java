package com.scb.fxo.dto;

import com.scb.fxo.domain.TradeStatus;
import com.scb.fxo.domain.TradeType;
import lombok.Data;
import java.time.Instant;

@Data
public class TradeResponse {
    private String id;
    private String rfqId;
    private TradeType type;
    private String currencyPair;
    private Double notional;
    private Double strike;
    private String expiry;
    private Double premium;
    private TradeStatus status;
    private String userId;
    private String role;
    private Instant createdAt;
}
