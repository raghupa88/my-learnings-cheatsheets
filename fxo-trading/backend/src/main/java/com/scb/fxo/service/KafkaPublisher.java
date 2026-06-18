package com.scb.fxo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publish(String topic, Object payload) {
        kafkaTemplate.send(topic, payload);
    }

    public void publish(String topic, String key, Object payload) {
        kafkaTemplate.send(topic, key, payload);
    }
}
