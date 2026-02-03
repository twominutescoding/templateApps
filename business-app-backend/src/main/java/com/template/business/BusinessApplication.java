package com.template.business;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class BusinessApplication {

    public static void main(String[] args) {
        SpringApplication.run(BusinessApplication.class, args);
    }
}
