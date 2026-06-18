package com.scb.fxo.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Data
public class GreeksSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String tradeId;
    private Double delta;
    private Double gamma;
    private Double vega;
    private Double theta;
    private Instant timestamp;
}
