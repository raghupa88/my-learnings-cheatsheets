package com.scb.fxo.controller;

import com.scb.fxo.domain.LifecycleEvent;
import com.scb.fxo.dto.LifecycleRequest;
import com.scb.fxo.repository.LifecycleEventRepository;
import com.scb.fxo.service.LifecycleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lifecycle")
public class LifecycleController {

    private final LifecycleService lifecycleService;
    private final LifecycleEventRepository lifecycleEventRepository;

    public LifecycleController(LifecycleService lifecycleService,
                               LifecycleEventRepository lifecycleEventRepository) {
        this.lifecycleService = lifecycleService;
        this.lifecycleEventRepository = lifecycleEventRepository;
    }

    @PostMapping("/{tradeId}")
    public ResponseEntity<LifecycleEvent> triggerEvent(
            @PathVariable String tradeId,
            @RequestBody LifecycleRequest request) {
        return lifecycleService.triggerEvent(tradeId, request.getEventType())
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{tradeId}")
    public List<LifecycleEvent> getEvents(@PathVariable String tradeId) {
        return lifecycleEventRepository.findByTradeIdOrderByTimestampDesc(tradeId);
    }

    @GetMapping
    public List<LifecycleEvent> getAllEvents() {
        return lifecycleEventRepository.findAll();
    }
}
