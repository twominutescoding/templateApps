# Dokumentacija - Integracijska Arhitektura Spring Boot Sustava (DIO 2)

## Nastavak...

# 3. IMPLEMENTACIJA SPRING BOOT SUČELJA

## 3.1 Kreiranje Kontrolera (Controllers)

### REST Controller za Sinkronu Integraciju

```java
package com.template.integration.controller;

import com.template.integration.dto.OrderDTO;
import com.template.integration.dto.ApiResponse;
import com.template.integration.service.OrderIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller za integraciju narudžbi
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/integration/orders")
@RequiredArgsConstructor
@Tag(name = "Order Integration", description = "APIs for order integration")
public class OrderIntegrationController {

    private final OrderIntegrationService orderIntegrationService;

    /**
     * Web servis - Prima narudžbu i sprema u TRC tablicu za asinkrinu obradu
     */
    @PostMapping("/submit")
    @Operation(summary = "Submit order for processing")
    public ResponseEntity<ApiResponse<String>> submitOrder(
            @Valid @RequestBody OrderDTO orderDTO) {

        log.info("Received order submission: orderNumber={}", orderDTO.getOrderNumber());

        try {
            String trcId = orderIntegrationService.submitOrderToTrc(orderDTO);

            log.info("Order submitted successfully. TRC ID: {}", trcId);

            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body(ApiResponse.success(
                            "Order submitted for processing",
                            trcId));

        } catch (Exception e) {
            log.error("Failed to submit order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to submit order"));
        }
    }

    /**
     * Provjera statusa obrade narudžbe
     */
    @GetMapping("/status/{trcId}")
    @Operation(summary = "Check order processing status")
    public ResponseEntity<ApiResponse<OrderStatusDTO>> checkStatus(
            @PathVariable String trcId) {

        log.debug("Checking status for TRC ID: {}", trcId);

        OrderStatusDTO status = orderIntegrationService.getOrderStatus(trcId);

        return ResponseEntity.ok(ApiResponse.success("Status retrieved", status));
    }

    /**
     * Sinkroni web servis - Prima i odmah procesira narudžbu
     */
    @PostMapping("/process-sync")
    @Operation(summary = "Process order synchronously")
    public ResponseEntity<ApiResponse<OrderProcessResultDTO>> processOrderSync(
            @Valid @RequestBody OrderDTO orderDTO) {

        log.info("Received sync order processing: orderNumber={}",
                 orderDTO.getOrderNumber());

        try {
            OrderProcessResultDTO result =
                orderIntegrationService.processOrderSynchronously(orderDTO);

            return ResponseEntity.ok(
                ApiResponse.success("Order processed successfully", result));

        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));

        } catch (Exception e) {
            log.error("Failed to process order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to process order"));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(
            ApiResponse.success("Service is healthy", "UP"));
    }
}
```

---

## 3.2 Servisni Sloj (Services)

### TrcPollingService - Polling TRC Tablica

```java
package com.template.integration.service;

import com.template.integration.entity.TrcOrder;
import com.template.integration.entity.TrcStatus;
import com.template.integration.repository.TrcOrdersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrcPollingService {

    private final TrcOrdersRepository trcOrdersRepository;
    private final TransformationService transformationService;
    private final SplitService splitService;
    private final StagingService stagingService;

    @Value("${integration.batch.size:100}")
    private int batchSize;

    @Value("${integration.retry.max-attempts:3}")
    private int maxRetryAttempts;

    /**
     * Glavni polling proces - čita NEW zapise iz TRC tablice
     */
    @Transactional
    public void pollAndProcess() {
        // Dohvati nove zapise
        List<TrcOrder> newRecords = trcOrdersRepository
                .findByStatusOrderByCreateDateAsc(TrcStatus.NEW)
                .stream()
                .limit(batchSize)
                .toList();

        if (newRecords.isEmpty()) {
            log.debug("No new TRC records to process");
            return;
        }

        log.info("Found {} new TRC records to process", newRecords.size());

        // Procesiranje
        for (TrcOrder trcOrder : newRecords) {
            try {
                processTrcRecord(trcOrder);
            } catch (Exception e) {
                log.error("Critical error processing TRC ID {}: {}",
                          trcOrder.getId(), e.getMessage(), e);
                // Nastavi sa sljedećim zapisom
            }
        }
    }

    /**
     * Procesiranje pojedinačnog TRC zapisa
     */
    @Transactional
    public void processTrcRecord(TrcOrder trcOrder) {
        log.info("Processing TRC record: ID={}, OrderNumber={}",
                 trcOrder.getId(), trcOrder.getOrderNumber());

        try {
            // 1. Postavi status na PROCESSING
            trcOrder.setStatus(TrcStatus.PROCESSING);
            trcOrder.setProcessDate(LocalDateTime.now());
            trcOrdersRepository.save(trcOrder);

            // 2. Transformacija podataka
            log.debug("Transforming data for TRC ID: {}", trcOrder.getId());
            TransformationResultDTO transformedData =
                transformationService.transform(trcOrder);

            // 3. Split logika - odredi ciljne sustave
            log.debug("Determining target systems for TRC ID: {}", trcOrder.getId());
            List<String> targetSystems = splitService.determineTargets(trcOrder);
            log.info("Target systems for TRC ID {}: {}", trcOrder.getId(), targetSystems);

            // 4. Upis u STG tablice za svaki ciljni sustav
            for (String targetSystem : targetSystems) {
                log.debug("Writing to staging for system: {}", targetSystem);
                stagingService.writeToStaging(trcOrder.getId(),
                                               transformedData,
                                               targetSystem);
            }

            // 5. Označi kao COMPLETED
            trcOrder.setStatus(TrcStatus.COMPLETED);
            trcOrder.setCompleteDate(LocalDateTime.now());
            trcOrder.setErrorMessage(null);
            trcOrdersRepository.save(trcOrder);

            log.info("Successfully completed TRC record ID: {}", trcOrder.getId());

        } catch (TransformationException e) {
            handleTransformationError(trcOrder, e);
        } catch (SplitException e) {
            handleSplitError(trcOrder, e);
        } catch (StagingException e) {
            handleStagingError(trcOrder, e);
        } catch (Exception e) {
            handleGeneralError(trcOrder, e);
        }
    }

    /**
     * Retry neuspjelih zapisa
     */
    @Transactional
    public void retryFailedRecords() {
        List<TrcOrder> retryRecords = trcOrdersRepository
                .findByStatusOrderByProcessDateAsc(TrcStatus.RETRY)
                .stream()
                .limit(batchSize)
                .toList();

        if (retryRecords.isEmpty()) {
            log.debug("No records to retry");
            return;
        }

        log.info("Retrying {} failed records", retryRecords.size());

        for (TrcOrder record : retryRecords) {
            // Resetiraj status na NEW za ponovnu obradu
            record.setStatus(TrcStatus.NEW);
            trcOrdersRepository.save(record);
        }
    }

    /**
     * Čišćenje starih završenih zapisa
     */
    @Transactional
    public void cleanupOldRecords() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);

        long deletedCount = trcOrdersRepository
                .deleteByStatusAndCompleteDateBefore(TrcStatus.COMPLETED, cutoffDate);

        log.info("Cleaned up {} old completed records", deletedCount);
    }

    // Error handling methods
    private void handleTransformationError(TrcOrder trcOrder, TransformationException e) {
        log.error("Transformation error for TRC ID {}: {}",
                  trcOrder.getId(), e.getMessage());
        markForRetryOrError(trcOrder, "Transformation error: " + e.getMessage());
    }

    private void handleSplitError(TrcOrder trcOrder, SplitException e) {
        log.error("Split logic error for TRC ID {}: {}",
                  trcOrder.getId(), e.getMessage());
        markForRetryOrError(trcOrder, "Split error: " + e.getMessage());
    }

    private void handleStagingError(TrcOrder trcOrder, StagingException e) {
        log.error("Staging error for TRC ID {}: {}",
                  trcOrder.getId(), e.getMessage());
        markForRetryOrError(trcOrder, "Staging error: " + e.getMessage());
    }

    private void handleGeneralError(TrcOrder trcOrder, Exception e) {
        log.error("General error processing TRC ID {}: {}",
                  trcOrder.getId(), e.getMessage(), e);
        markForRetryOrError(trcOrder, "Error: " + e.getMessage());
    }

    private void markForRetryOrError(TrcOrder trcOrder, String errorMessage) {
        trcOrder.setRetryCount(trcOrder.getRetryCount() + 1);

        if (trcOrder.getRetryCount() >= maxRetryAttempts) {
            trcOrder.setStatus(TrcStatus.ERROR);
            trcOrder.setErrorMessage(errorMessage +
                    " (Max retry attempts reached: " + maxRetryAttempts + ")");
            log.error("TRC record {} moved to ERROR status after {} attempts",
                      trcOrder.getId(), maxRetryAttempts);
        } else {
            trcOrder.setStatus(TrcStatus.RETRY);
            trcOrder.setErrorMessage(errorMessage);
            log.warn("TRC record {} marked for RETRY (attempt {})",
                     trcOrder.getId(), trcOrder.getRetryCount());
        }

        trcOrdersRepository.save(trcOrder);
    }
}
```

### TransformationService

```java
package com.template.integration.service;

import com.template.integration.entity.TrcOrder;
import com.template.integration.dto.TransformationResultDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.CallableStatement;
import java.sql.Connection;

@Service
@Slf4j
@RequiredArgsConstructor
public class TransformationService {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Transformira podatke iz TRC formata u format za ciljni sustav
     * Može koristiti DB procedure ili Java logiku
     */
    public TransformationResultDTO transform(TrcOrder trcOrder)
            throws TransformationException {

        log.debug("Starting transformation for TRC ID: {}", trcOrder.getId());

        try {
            // Opcija 1: Poziv database procedure (TAFR - Transform and Forward)
            if (trcOrder.getSourceSystem().startsWith("LEGACY_")) {
                return transformUsingDbProcedure(trcOrder);
            }

            // Opcija 2: Java transformacija
            return transformInJava(trcOrder);

        } catch (Exception e) {
            throw new TransformationException(
                "Failed to transform TRC ID " + trcOrder.getId() + ": " + e.getMessage(), e);
        }
    }

    /**
     * Transformacija pomoću Oracle DB procedure
     */
    private TransformationResultDTO transformUsingDbProcedure(TrcOrder trcOrder)
            throws Exception {

        log.debug("Using DB procedure transformation");

        return jdbcTemplate.execute((Connection conn) -> {
            String sql = "{ call PKG_TRANSFORM_ORDERS.TRANSFORM_FOR_SYSTEM_A(?, ?, ?) }";

            try (CallableStatement stmt = conn.prepareCall(sql)) {
                // IN parametar
                stmt.setLong(1, trcOrder.getId());

                // OUT parametri
                stmt.registerOutParameter(2, java.sql.Types.CLOB); // transformed_data
                stmt.registerOutParameter(3, java.sql.Types.VARCHAR); // status

                stmt.execute();

                String transformedData = stmt.getString(2);
                String status = stmt.getString(3);

                if (!"SUCCESS".equals(status)) {
                    throw new TransformationException("DB procedure failed: " + status);
                }

                return TransformationResultDTO.builder()
                        .transformedData(transformedData)
                        .transformationType("DB_PROCEDURE")
                        .build();
            }
        });
    }

    /**
     * Java transformacija
     */
    private TransformationResultDTO transformInJava(TrcOrder trcOrder) throws Exception {
        log.debug("Using Java transformation");

        // Parse JSON iz orderData
        OrderDataDTO sourceData = objectMapper.readValue(
            trcOrder.getOrderData(),
            OrderDataDTO.class
        );

        // Business transformation logic
        TransformedOrderDTO targetData = TransformedOrderDTO.builder()
                .orderId(sourceData.getOrderNumber())
                .customerCode(sourceData.getCustomerId())
                .orderDate(sourceData.getOrderDate())
                .totalAmount(sourceData.getAmount())
                .items(transformItems(sourceData.getItems()))
                .build();

        // Convert back to JSON
        String transformedJson = objectMapper.writeValueAsString(targetData);

        return TransformationResultDTO.builder()
                .transformedData(transformedJson)
                .transformationType("JAVA")
                .build();
    }

    private List<TransformedItemDTO> transformItems(List<SourceItemDTO> sourceItems) {
        return sourceItems.stream()
                .map(item -> TransformedItemDTO.builder()
                        .productCode(item.getProductId())
                        .quantity(item.getQty())
                        .unitPrice(item.getPrice())
                        .build())
                .toList();
    }
}
```

### SplitService - Distribucija Podataka

```java
package com.template.integration.service;

import com.template.integration.entity.TrcOrder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Array;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SplitService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Određuje ciljne sustave na temelju split logike
     * Može koristiti DB procedure ili Java logiku
     */
    public List<String> determineTargets(TrcOrder trcOrder) throws SplitException {

        log.debug("Determining targets for TRC ID: {}", trcOrder.getId());

        try {
            // Ako je TARGET_SYSTEMS već definiran u TRC zapisu
            if (trcOrder.getTargetSystems() != null &&
                !trcOrder.getTargetSystems().isEmpty()) {
                return Arrays.asList(trcOrder.getTargetSystems().split(","));
            }

            // Inače pozovi split logiku
            return determinateTargetsUsingDbProcedure(trcOrder);

        } catch (Exception e) {
            throw new SplitException(
                "Failed to determine targets for TRC ID " + trcOrder.getId(), e);
        }
    }

    /**
     * Split logika pomoću Oracle DB procedure
     */
    private List<String> determinateTargetsUsingDbProcedure(TrcOrder trcOrder)
            throws Exception {

        log.debug("Using DB procedure for split logic");

        return jdbcTemplate.execute((Connection conn) -> {
            String sql = "{ call PKG_SPLIT_ORDERS.DETERMINE_TARGETS(?, ?) }";

            try (CallableStatement stmt = conn.prepareCall(sql)) {
                // IN parametar
                stmt.setLong(1, trcOrder.getId());

                // OUT parametar - array of target systems
                stmt.registerOutParameter(2, java.sql.Types.ARRAY, "VARCHAR_ARRAY");

                stmt.execute();

                Array targetsArray = stmt.getArray(2);
                String[] targets = (String[]) targetsArray.getArray();

                return Arrays.asList(targets);
            }
        });
    }
}
```

### StagingService - Upis u STG Tablice

```java
package com.template.integration.service;

import com.template.integration.entity.StgOrder;
import com.template.integration.repository.StgOrdersRepository;
import com.template.integration.dto.TransformationResultDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class StagingService {

    private final StgOrdersRepository stgOrdersRepository;

    /**
     * Sprema transformirane podatke u STG tablicu za ciljni sustav
     */
    @Transactional
    public void writeToStaging(Long trcId,
                               TransformationResultDTO transformedData,
                               String targetSystem) throws StagingException {

        log.info("Writing to staging for TRC ID: {}, Target: {}",
                 trcId, targetSystem);

        try {
            StgOrder stgOrder = new StgOrder();
            stgOrder.setTrcId(trcId);
            stgOrder.setTargetSystem(targetSystem);
            stgOrder.setTransformedData(transformedData.getTransformedData());
            stgOrder.setStatus("READY");
            stgOrder.setCreateDate(LocalDateTime.now());

            stgOrdersRepository.save(stgOrder);

            log.debug("Successfully written to staging: TRC ID {}, Target {}",
                      trcId, targetSystem);

        } catch (Exception e) {
            throw new StagingException(
                "Failed to write to staging for TRC ID " + trcId +
                ", Target: " + targetSystem, e);
        }
    }
}
```

---

## 3.3 Repozitoriji i Pristup Bazi (Repositories, JPA/Hibernate)

### TrcOrdersRepository

```java
package com.template.integration.repository;

import com.template.integration.entity.TrcOrder;
import com.template.integration.entity.TrcStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrcOrdersRepository extends JpaRepository<TrcOrder, Long> {

    /**
     * Dohvati sve zapise po statusu
     */
    List<TrcOrder> findByStatusOrderByCreateDateAsc(TrcStatus status);

    /**
     * Dohvati zapise po statusu i izvoru
     */
    List<TrcOrder> findByStatusAndSourceSystemOrderByCreateDateAsc(
        TrcStatus status, String sourceSystem);

    /**
     * Broji zapise po statusu
     */
    long countByStatus(TrcStatus status);

    /**
     * Broji zapise sa greškama
     */
    @Query("SELECT COUNT(t) FROM TrcOrder t WHERE t.status = 'ERROR' " +
           "AND t.createDate >= :since")
    long countErrorsSince(@Param("since") LocalDateTime since);

    /**
     * Briši stare završene zapise
     */
    @Modifying
    @Query("DELETE FROM TrcOrder t WHERE t.status = :status " +
           "AND t.completeDate < :before")
    long deleteByStatusAndCompleteDateBefore(
        @Param("status") TrcStatus status,
        @Param("before") LocalDateTime before);

    /**
     * Custom query za zapise koji čekaju duže od određenog vremena
     */
    @Query("SELECT t FROM TrcOrder t WHERE t.status = 'PROCESSING' " +
           "AND t.processDate < :threshold")
    List<TrcOrder> findStuckProcessingRecords(
        @Param("threshold") LocalDateTime threshold);
}
```

### StgOrdersRepository

```java
package com.template.integration.repository;

import com.template.integration.entity.StgOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StgOrdersRepository extends JpaRepository<StgOrder, Long> {

    /**
     * Dohvati STG zapise za ciljni sustav
     */
    List<StgOrder> findByTargetSystemAndStatusOrderByCreateDateAsc(
        String targetSystem, String status);

    /**
     * Dohvati STG zapise za TRC ID
     */
    List<StgOrder> findByTrcIdOrderByCreateDateAsc(Long trcId);

    /**
     * Broji READY zapise po sustavu
     */
    @Query("SELECT s.targetSystem, COUNT(s) FROM StgOrder s " +
           "WHERE s.status = 'READY' GROUP BY s.targetSystem")
    List<Object[]> countReadyRecordsBySystem();
}
```

---

## 3.4 DTO i Mapiranje Podataka

### OrderDTO - Request DTO

```java
package com.template.integration.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {

    @NotBlank(message = "Order number is required")
    private String orderNumber;

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotNull(message = "Order date is required")
    private LocalDate orderDate;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private BigDecimal totalAmount;

    private String sourceSystem;

    private List<String> targetSystems;

    @NotNull(message = "Order items are required")
    private List<OrderItemDTO> items;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class OrderItemDTO {

    @NotBlank(message = "Product ID is required")
    private String productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;
}
```

### ApiResponse - Generic Response Wrapper

```java
package com.template.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String errorCode;

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String errorCode, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
```

---

## 3.5 Validacija Korisničkih Unosa

### Bean Validation

```java
package com.template.integration.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderDTO {

    @NotBlank(message = "Order number is required")
    @Size(min = 5, max = 50, message = "Order number must be between 5 and 50 characters")
    @Pattern(regexp = "^ORD[0-9]{7}$", message = "Order number must match format ORDxxxxxxx")
    private String orderNumber;

    @NotBlank(message = "Customer ID is required")
    @Size(max = 20, message = "Customer ID max 20 characters")
    private String customerId;

    @NotNull(message = "Order date is required")
    @PastOrPresent(message = "Order date cannot be in the future")
    private LocalDate orderDate;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    @DecimalMin(value = "0.01", message = "Minimum amount is 0.01")
    @DecimalMax(value = "1000000.00", message = "Maximum amount is 1,000,000")
    private BigDecimal totalAmount;

    @Email(message = "Invalid email format")
    private String customerEmail;
}
```

### Custom Validator

```java
package com.template.integration.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ValidTargetSystemsValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidTargetSystems {

    String message() default "Invalid target systems";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

// Validator implementation
@Component
public class ValidTargetSystemsValidator
        implements ConstraintValidator<ValidTargetSystems, List<String>> {

    @Autowired
    private ConfigurationService configurationService;

    @Override
    public boolean isValid(List<String> targetSystems,
                           ConstraintValidatorContext context) {

        if (targetSystems == null || targetSystems.isEmpty()) {
            return true; // Optional field
        }

        // Provjeri da li su svi sustavi validni
        for (String system : targetSystems) {
            if (!configurationService.isValidTargetSystem(system)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    "Invalid target system: " + system)
                    .addConstraintViolation();
                return false;
            }
        }

        return true;
    }
}
```

---

## 3.6 Obrada Iznimki i Vraćanje HTTP Statusa

### Custom Exceptions

```java
package com.template.integration.exception;

public class TransformationException extends RuntimeException {
    public TransformationException(String message) {
        super(message);
    }

    public TransformationException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class SplitException extends RuntimeException {
    public SplitException(String message) {
        super(message);
    }

    public SplitException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class StagingException extends RuntimeException {
    public StagingException(String message) {
        super(message);
    }

    public StagingException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

### Global Exception Handler

```java
package com.template.integration.exception;

import com.template.integration.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Validation errors (400 Bad Request)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation error: {}", errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Validation failed")
                        .data(errors)
                        .errorCode("VALIDATION_ERROR")
                        .build());
    }

    /**
     * Resource not found (404)
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
            ResourceNotFoundException ex) {

        log.warn("Resource not found: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("NOT_FOUND", ex.getMessage()));
    }

    /**
     * Business logic exceptions (422 Unprocessable Entity)
     */
    @ExceptionHandler({TransformationException.class,
                       SplitException.class,
                       StagingException.class})
    public ResponseEntity<ApiResponse<Void>> handleBusinessExceptions(
            RuntimeException ex) {

        log.error("Business logic error: {}", ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.error("BUSINESS_ERROR", ex.getMessage()));
    }

    /**
     * Generic exception handler (500 Internal Server Error)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex) {

        log.error("Unexpected error occurred", ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("INTERNAL_ERROR",
                        "An unexpected error occurred. Please contact support."));
    }
}
```

### HTTP Status Mapping

| Status Code | Opis | Kada koristiti |
|------------|------|----------------|
| **200 OK** | Uspješan request | GET, PUT uspješno |
| **201 Created** | Resurs kreiran | POST uspješno kreirao resurs |
| **202 Accepted** | Prihvaćeno za obradu | Asinkrona obrada započeta |
| **204 No Content** | Uspješno, nema sadržaja | DELETE uspješno |
| **400 Bad Request** | Neispravni podaci | Validation error |
| **401 Unauthorized** | Nije autentificiran | Missing/invalid token |
| **403 Forbidden** | Nema prava pristupa | Autentificiran ali nema dozvolu |
| **404 Not Found** | Resurs ne postoji | GET na nepostojeći resurs |
| **409 Conflict** | Konflikt resursa | Duplicate entry |
| **422 Unprocessable Entity** | Business logic error | Validation passed, ali business rules failed |
| **500 Internal Server Error** | Greška servera | Neočekivana greška |
| **503 Service Unavailable** | Servis nedostupan | Maintenance mode, preopterećenje |

---

*Nastavlja se u DIO 3...*
