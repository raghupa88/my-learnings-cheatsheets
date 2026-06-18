package com.scb.fxo.repository;

import com.scb.fxo.domain.LifecycleEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LifecycleEventRepository extends JpaRepository<LifecycleEvent, String> {
    List<LifecycleEvent> findByTradeId(String tradeId);
    List<LifecycleEvent> findByTradeIdOrderByTimestampDesc(String tradeId);
}
