package com.scb.fxo.repository;

import com.scb.fxo.domain.Trade;
import com.scb.fxo.domain.TradeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, String> {
    List<Trade> findByUserId(String userId);
    List<Trade> findByStatus(TradeStatus status);
}
