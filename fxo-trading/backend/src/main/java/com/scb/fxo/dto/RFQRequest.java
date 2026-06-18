package com.scb.fxo.dto;

import com.scb.fxo.domain.TradeType;
import lombok.Data;

@Data
public class RFQRequest {
    private String requestingUserId;
    private String currencyPair;
    private Double notional;
    private TradeType type;
}
