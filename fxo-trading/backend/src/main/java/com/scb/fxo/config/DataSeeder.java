package com.scb.fxo.config;

import com.scb.fxo.domain.*;
import com.scb.fxo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final TradeRepository tradeRepository;
    private final RFQRepository rfqRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        Trade t1 = new Trade();
        t1.setRfqId("rfq-seed-1");
        t1.setType(TradeType.VANILLA_CALL);
        t1.setCurrencyPair("USD/INR");
        t1.setNotional(1_000_000.0);
        t1.setStrike(84.0);
        t1.setExpiry("2025-03-31");
        t1.setPremium(15000.0);
        t1.setStatus(TradeStatus.ACTIVE);
        t1.setUserId("U001");
        t1.setRole("SALES");
        t1.setCreatedAt(Instant.now());
        tradeRepository.save(t1);

        Trade t2 = new Trade();
        t2.setRfqId("rfq-seed-2");
        t2.setType(TradeType.VANILLA_PUT);
        t2.setCurrencyPair("EUR/USD");
        t2.setNotional(500_000.0);
        t2.setStrike(1.08);
        t2.setExpiry("2025-06-30");
        t2.setPremium(7500.0);
        t2.setStatus(TradeStatus.ACTIVE);
        t2.setUserId("U002");
        t2.setRole("TRADER");
        t2.setCreatedAt(Instant.now());
        tradeRepository.save(t2);

        Trade t3 = new Trade();
        t3.setRfqId("rfq-seed-3");
        t3.setType(TradeType.NDF);
        t3.setCurrencyPair("USD/INR");
        t3.setNotional(2_000_000.0);
        t3.setStrike(83.5);
        t3.setExpiry("2025-09-30");
        t3.setPremium(0.0);
        t3.setStatus(TradeStatus.ACTIVE);
        t3.setUserId("U003");
        t3.setRole("OPERATIONS");
        t3.setCreatedAt(Instant.now());
        tradeRepository.save(t3);

        RFQ r1 = new RFQ();
        r1.setRequestingUserId("U001");
        r1.setCurrencyPair("GBP/USD");
        r1.setNotional(750_000.0);
        r1.setType(TradeType.COLLAR);
        r1.setStatus(RFQStatus.QUOTED);
        r1.setBidRate(1.2588);
        r1.setOfferRate(1.2713);
        r1.setCreatedAt(Instant.now());
        rfqRepository.save(r1);

        RFQ r2 = new RFQ();
        r2.setRequestingUserId("U002");
        r2.setCurrencyPair("AUD/USD");
        r2.setNotional(300_000.0);
        r2.setType(TradeType.VANILLA_CALL);
        r2.setStatus(RFQStatus.QUOTED);
        r2.setBidRate(0.6497);
        r2.setOfferRate(0.6563);
        r2.setCreatedAt(Instant.now());
        rfqRepository.save(r2);
    }
}
