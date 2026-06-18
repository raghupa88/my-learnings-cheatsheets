package com.scb.fxo.dto;

import com.scb.fxo.domain.TradeType;
import lombok.Data;

@Data
public class TradeRequest {
    private String rfqId;
    private TradeType type;
    private String currencyPair;
    private Double notional;
    private Double strike;
    private String expiry;
    private Double premium;
    private String userId;
    private String role;
}
