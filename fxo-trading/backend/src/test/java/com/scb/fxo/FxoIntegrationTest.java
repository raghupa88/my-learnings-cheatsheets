package com.scb.fxo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scb.fxo.domain.TradeType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@EmbeddedKafka(
    partitions = 1,
    topics = {"fxo.rfq.created", "fxo.quote.returned", "fxo.greeks.updated", "fxo.lifecycle.event", "fxo.trade.booked"}
)
class FxoIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    // ── Auth ───────────────────────────────────────────────────────────────

    @Test
    void login_knownUser_returns200() throws Exception {
        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"U001\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("U001"))
            .andExpect(jsonPath("$.role").value("SALES"));
    }

    @Test
    void login_unknownUser_returns401() throws Exception {
        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"userId\":\"UNKNOWN\"}"))
            .andExpect(status().isUnauthorized());
    }

    // ── Users ──────────────────────────────────────────────────────────────

    @Test
    void getUsers_returns4Personas() throws Exception {
        mvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(4))
            .andExpect(jsonPath("$[*].role", hasItems("SALES", "TRADER", "OPERATIONS", "RISK")));
    }

    // ── RFQ ────────────────────────────────────────────────────────────────

    @Test
    void createRFQ_validRequest_returns201WithPendingStatus() throws Exception {
        var body = Map.of(
            "requestingUserId", "U001",
            "currencyPair", "USD/INR",
            "notional", 1_000_000,
            "type", "VANILLA_CALL"
        );

        mvc.perform(post("/api/rfq")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.status").value("PENDING"))
            .andExpect(jsonPath("$.currencyPair").value("USD/INR"));
    }

    @Test
    void getAllRFQs_afterSeed_returnsSeededData() throws Exception {
        mvc.perform(get("/api/rfq"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    // ── Trades ─────────────────────────────────────────────────────────────

    @Test
    void bookTrade_validRequest_returnsActiveTradeWithId() throws Exception {
        var body = Map.of(
            "type", "VANILLA_CALL",
            "currencyPair", "EUR/USD",
            "notional", 500_000,
            "strike", 1.085,
            "expiry", "2026-12-31",
            "premium", 7500,
            "userId", "U002",
            "role", "TRADER"
        );

        mvc.perform(post("/api/trade")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.currencyPair").value("EUR/USD"));
    }

    @Test
    void getTrades_forSpecificUser_returnsFilteredList() throws Exception {
        mvc.perform(get("/api/trades?userId=U002"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getTrades_allTrades_returnsSeededTrades() throws Exception {
        mvc.perform(get("/api/trades"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(3)));
    }

    // ── Lifecycle ──────────────────────────────────────────────────────────

    @Test
    void triggerConfirm_onExistingTrade_returnsEvent() throws Exception {
        // Get a seeded trade id
        String tradesJson = mvc.perform(get("/api/trades"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        var trades = mapper.readTree(tradesJson);
        String tradeId = trades.get(0).get("id").asText();

        mvc.perform(post("/api/lifecycle/" + tradeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"eventType\":\"CONFIRMED\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tradeId").value(tradeId))
            .andExpect(jsonPath("$.eventType").value("CONFIRMED"))
            .andExpect(jsonPath("$.payload").isNotEmpty());
    }

    @Test
    void triggerLifecycle_onNonExistentTrade_returns404() throws Exception {
        mvc.perform(post("/api/lifecycle/nonexistent-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"eventType\":\"SETTLED\"}"))
            .andExpect(status().isNotFound());
    }

    // ── Actuator ───────────────────────────────────────────────────────────

    @Test
    void actuatorHealth_returns200() throws Exception {
        mvc.perform(get("/actuator/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
    }
}
