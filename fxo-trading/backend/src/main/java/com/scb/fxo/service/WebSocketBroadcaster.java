package com.scb.fxo.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(topics = "fxo.quote.returned", groupId = "ws-broadcaster-quotes")
    public void broadcastQuote(Object payload) {
        messagingTemplate.convertAndSend("/topic/quotes", payload);
    }

    @KafkaListener(topics = "fxo.greeks.updated", groupId = "ws-broadcaster-greeks")
    public void broadcastGreeks(Object payload) {
        messagingTemplate.convertAndSend("/topic/greeks", payload);
    }

    @KafkaListener(topics = "fxo.lifecycle.event", groupId = "ws-broadcaster-lifecycle")
    public void broadcastLifecycle(Object payload) {
        messagingTemplate.convertAndSend("/topic/lifecycle", payload);
    }
}
