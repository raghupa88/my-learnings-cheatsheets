package com.scb.fxo.dto;

import com.scb.fxo.domain.LifecycleEventType;
import lombok.Data;

@Data
public class LifecycleRequest {
    private LifecycleEventType eventType;
}
