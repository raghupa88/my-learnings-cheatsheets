package com.scb.fxo.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic rfqCreatedTopic() {
        return TopicBuilder.name("fxo.rfq.created").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic quoteReturnedTopic() {
        return TopicBuilder.name("fxo.quote.returned").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic greeksUpdatedTopic() {
        return TopicBuilder.name("fxo.greeks.updated").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic lifecycleEventTopic() {
        return TopicBuilder.name("fxo.lifecycle.event").partitions(1).replicas(1).build();
    }
}
