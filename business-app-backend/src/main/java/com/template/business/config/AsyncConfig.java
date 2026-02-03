package com.template.business.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async configuration for application operations.
 * Provides thread pool executors for async tasks like remote logging.
 */
@Slf4j
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Thread pool executor for async logging operations.
     * Used by AppLogger to send logs to auth-service without blocking.
     */
    @Bean(name = "appLogExecutor")
    public Executor appLogExecutor() {
        log.info("Creating appLogExecutor thread pool");

        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("AppLog-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();

        log.info("appLogExecutor configured: corePoolSize={}, maxPoolSize={}, queueCapacity={}",
                executor.getCorePoolSize(), executor.getMaxPoolSize(), executor.getQueueCapacity());

        return executor;
    }
}
