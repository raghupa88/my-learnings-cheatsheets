package com.scb.fxo.controller;

import com.scb.fxo.domain.GreeksSnapshot;
import com.scb.fxo.repository.GreeksSnapshotRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/greeks")
public class GreeksController {

    private final GreeksSnapshotRepository greeksSnapshotRepository;

    public GreeksController(GreeksSnapshotRepository greeksSnapshotRepository) {
        this.greeksSnapshotRepository = greeksSnapshotRepository;
    }

    @GetMapping("/{tradeId}")
    public ResponseEntity<GreeksSnapshot> getLatestGreeks(@PathVariable String tradeId) {
        return greeksSnapshotRepository.findTopByTradeIdOrderByTimestampDesc(tradeId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history/{tradeId}")
    public List<GreeksSnapshot> getGreeksHistory(@PathVariable String tradeId) {
        return greeksSnapshotRepository.findTop20ByTradeIdOrderByTimestampAsc(tradeId);
    }
}
