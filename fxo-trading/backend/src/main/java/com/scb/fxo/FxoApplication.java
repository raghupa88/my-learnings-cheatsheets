package com.scb.fxo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FxoApplication {
    public static void main(String[] args) {
        SpringApplication.run(FxoApplication.class, args);
    }
}
