package com.template.business.auth.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async configuration for application logging.
 * Provides a thread pool executor for async log operations.
 */
@Slf4j
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Thread pool executor for async logging operations.
     * Configured with reasonable defaults for logging workload.
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
