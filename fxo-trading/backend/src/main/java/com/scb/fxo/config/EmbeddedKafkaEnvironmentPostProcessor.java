package com.scb.fxo.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.EmbeddedKafkaZKBroker;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class EmbeddedKafkaEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static EmbeddedKafkaBroker broker;

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (!Arrays.asList(environment.getActiveProfiles()).contains("local")) {
            return;
        }
        if (broker == null) {
            broker = new EmbeddedKafkaZKBroker(1, true,
                    "fxo.rfq.created", "fxo.quote.returned", "fxo.greeks.updated", "fxo.lifecycle.event");
            try {
                broker.afterPropertiesSet();
            } catch (Exception e) {
                throw new RuntimeException("Failed to start embedded Kafka", e);
            }
            Runtime.getRuntime().addShutdownHook(new Thread(broker::destroy));
        }
        Map<String, Object> props = new HashMap<>();
        props.put("spring.kafka.bootstrap-servers", broker.getBrokersAsString());
        environment.getPropertySources().addFirst(new MapPropertySource("embeddedKafka", props));
    }
}
