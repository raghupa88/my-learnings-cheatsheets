package com.scb.fxo.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class GreeksResponse {
    private String id;
    private String tradeId;
    private Double delta;
    private Double gamma;
    private Double vega;
    private Double theta;
    private Instant timestamp;
}
