package com.scb.fxo.repository;

import com.scb.fxo.domain.GreeksSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GreeksSnapshotRepository extends JpaRepository<GreeksSnapshot, String> {
    List<GreeksSnapshot> findByTradeIdOrderByTimestampDesc(String tradeId);
    java.util.Optional<GreeksSnapshot> findTopByTradeIdOrderByTimestampDesc(String tradeId);
    List<GreeksSnapshot> findTop20ByTradeIdOrderByTimestampAsc(String tradeId);
}
