package com.scb.fxo.dto;

import com.scb.fxo.domain.RFQStatus;
import com.scb.fxo.domain.TradeType;
import lombok.Data;
import java.time.Instant;

@Data
public class RFQResponse {
    private String id;
    private String requestingUserId;
    private String currencyPair;
    private Double notional;
    private TradeType type;
    private RFQStatus status;
    private Double bidRate;
    private Double offerRate;
    private Instant createdAt;
}
