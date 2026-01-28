# Kompletna Dokumentacija Integracijskog Sustava

## Verzija: 1.0 | Datum: Siječanj 2026

---

# SADRŽAJ

1. [UVOD](#1-uvod)
   - 1.1 [Pregled – Integracijske potrebe](#11-pregled--integracijske-potrebe)
   - 1.2 [Tehnološki okvir](#12-tehnološki-okvir)
2. [PREGLED SUSTAVA](#2-pregled-sustava)
   - 2.1 [Vrste sučelja](#21-vrste-sučelja)
   - 2.2 [Arhitektura sustava](#22-arhitektura-sustava)
   - 2.3 [Komponente i njihova uloga](#23-komponente-i-njihova-uloga)
   - 2.4 [Upravljanje greškama i logging](#24-upravljanje-greškama-i-koncept-nadzora)
   - 2.5 [Konfiguriranje sučelja](#25-konfiguriranje-sučelja)
   - 2.6 [Raspored izvođenja (scheduling)](#26-raspored-izvođenja-scheduling)
3. [IMPLEMENTACIJA SPRING BOOT SUČELJA](#3-implementacija-spring-boot-sučelja)
   - 3.1 [Kreiranje kontrolera](#31-kreiranje-kontrolera-controllers)
   - 3.2 [Servisni sloj](#32-servisni-sloj-services)
   - 3.3 [Repozitoriji i pristup bazi](#33-repozitoriji-i-pristup-bazi)
   - 3.4 [DTO i mapiranje podataka](#34-dto-i-mapiranje-podataka)
   - 3.5 [Validacija korisničkih unosa](#35-validacija-korisničkih-unosa)
   - 3.6 [Obrada iznimki](#36-obrada-iznimki-i-vraćanje-http-statusa)
4. [DODACI](#4-dodaci)
   - 4.1 [Konvencije nazivanja](#41-konvencije-nazivanja-i-strukture-koda)
   - 4.2 [Okoline (DEV/TEST/PROD)](#42-okoline-devtest-prod)
   - 4.3 [Implementacija - Tomcat Deployment](#43-implementacija---produkcijska-okolina)
   - 4.4 [Testiranje](#44-testiranje)
   - 4.5 [Dokumentacija](#45-dokumentacija)
   - 4.6 [Održavanje sustava](#46-održavanje-sustava-i-nadogradnja)
5. [SQL SKRIPTE](#5-sql-skripte)
   - 5.1 [TRC tablice](#51-trc-tracing-tablice)
   - 5.2 [STG tablice](#52-stg-staging-tablice)
   - 5.3 [Config tablice](#53-config-tablice)
   - 5.4 [Napomena o Transformaciji i Split Logici](#54-napomena-o-transformaciji-i-split-logici)
   - 5.5 [Testni podatci i monitoring](#55-testni-podatci-i-monitoring)

---

# 1. UVOD

## 1.1 Pregled – Integracijske Potrebe

### Kontekst

U postojećem sustavu integracije između aplikacija ostvarene su putem **Oracle Service Bus (OSB)** koji koristi dva glavna mehanizma:

1. **Web servisi (REST/SOAP)** - Sinkroni pozivi između sustava
2. **TRC-STG tablični model** - Asinkrona komunikacija putem baze podataka

### TRC-STG Model Rada

**Postojeći OSB pristup:**

```
Legacy Sustav → TRC tablica → OSB Consumer → Transformacija → Split → STG tablice → Ciljni sustavi
```

**Proces:**
1. Legacy sustav upisuje podatke u **TRC (Tracing)** tablicu u izvoru
2. OSB ima **subscriber/consumer** koji:
   - Čita podatke iz TRC tablice
   - Označava status kao "pročitano"
   - Transformira podatke prema potrebama ciljnog sustava
   - Splita podatke ako ih treba poslati na više sustava
3. OSB upisuje transformirane podatke u **STG (Staging)** tablice ciljnih sustava
4. Ciljni sustavi čitaju podatke iz svojih STG tablica i obrađuju ih

### Cilj Nove Arhitekture

Zamijeniti OSB funkcionalnost sa **Spring Boot mikroservisima** koji će:

- Održati isti TRC-STG pristup gdje je potrebna asinkrona komunikacija
- Pružiti REST API za sinkrone integracije
- Omogućiti lakše održavanje, testiranje i skaliranje
- Pružiti bolju vidljivost (logging, monitoring)

---

## 1.2 Tehnološki Okvir

### Backend Stack

| Komponenta | Tehnologija | Verzija | Opis |
|------------|-------------|---------|------|
| **Framework** | Spring Boot | 4.0.1 | Glavni backend framework |
| **Programski jezik** | Java | 17+ | LTS verzija |
| **ORM** | Hibernate (JPA) | 6.x | Pristup bazi podataka |
| **Baza podataka** | Oracle Database | 11g+ | Produkcijska baza |
| | H2 Database | - | Razvojna baza (in-memory) |
| **Security** | Spring Security | 6.x | Autentikacija i autorizacija |
| **API dokumentacija** | SpringDoc OpenAPI | 2.x | Swagger UI |
| **Scheduling** | Spring Scheduler | - | Cron jobs za polling |
| **Komunikacija** | REST (JSON) | - | Web servisi |
| **Build tool** | Maven | 3.9+ | |
| **Logging** | SLF4J + Logback | - | Centralizirano logiranje |

### Infrastruktura (Produkcija)

- **Application Server**: Apache Tomcat 10.x (standalone)
- **Database Server**: Oracle Database 11g+
- **Load Balancer**: Apache HTTP Server + mod_jk (ili hardware LB)
- **Monitoring**: JMX + Spring Boot Actuator
- **Backup**: RMAN (Oracle) + File system backup

---

# 2. PREGLED SUSTAVA

## 2.1 Vrste Sučelja

### 2.1.1 Web Servisi (REST API)

**Karakteristike:**
- Sinkrona komunikacija
- Request-Response model
- JSON format
- HTTP protokol (HTTPS u produkciji)

**Tipični scenariji:**
- Upit za trenutne podatke (npr. trenutna cijena dionice)
- CRUD operacije koje zahtijevaju trenutni odgovor
- Transakcijske operacije gdje je potrebna potvrda

### 2.1.2 TRC-STG Tablični Model

**Karakteristike:**
- Asinkrona komunikacija
- Decouplani sustavi
- Baza podataka kao message broker
- Retry mehanizam

**Tipični scenariji:**
- Batch obrada velikih količina podataka
- Integracije gdje ciljni sustav nije uvijek dostupan
- Potreba za audit trail-om
- Distribuirana obrada preko više sustava

---

## 2.2 Arhitektura Sustava

### Dijagram Arhitekture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         IZVORNI SUSTAV                               │
│  (Legacy aplikacija, vanjski sustav, ručni unos)                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ↓
                ┌────────────────────────┐
                │   *_TRC tablice        │
                │   (Tracing tables)     │
                │   - RECEIPT_TRC        │
                │   - RECEIPT_DETAILS_TRC│
                │   - ROW_STATUS: N      │
                └────────┬───────────────┘
                         │
                         ↓ POLLING (Scheduled)
        ┌────────────────────────────────────────┐
        │  SPRING BOOT INTEGRATION SERVICE       │
        │  ┌──────────────────────────────────┐  │
        │  │  @Scheduled Polling Service      │  │
        │  │  - Čita *_TRC tablice            │  │
        │  │  - Postavlja ROW_STATUS='P'      │  │
        │  └──────────────┬───────────────────┘  │
        │                 ↓                       │
        │  ┌──────────────────────────────────┐  │
        │  │  Transformation Service          │  │
        │  │  - Mapiranje podataka            │  │
        │  │  - Validacija                    │  │
        │  │  - Business rules                │  │
        │  └──────────────┬───────────────────┘  │
        │                 ↓                       │
        │  ┌──────────────────────────────────┐  │
        │  │  Split Service                   │  │
        │  │  - Parsiranje DEST_UNIT polja    │  │
        │  │  - Određivanje ciljnih sustava   │  │
        │  │  - Multi-datasource routing      │  │
        │  └──────────────┬───────────────────┘  │
        │                 ↓                       │
        │  ┌──────────────────────────────────┐  │
        │  │  Staging Service                 │  │
        │  │  - Upis u *_STG tablice          │  │
        │  │  - Update ROW_STATUS='P'         │  │
        │  └──────────────────────────────────┘  │
        └────────────┬───────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        │                           │
        ↓                           ↓
┌───────────────┐          ┌───────────────┐
│ PRODUCTS_STG  │          │ ORDERS_STG    │
│ CODES_STG     │          │ (drugi sustav)│
│ ROW_STATUS: N │          │ ROW_STATUS: N │
└───────┬───────┘          └───────┬───────┘
        │                          │
        ↓                          ↓
┌───────────────┐          ┌───────────────┐
│  Ciljni       │          │  Ciljni       │
│  Sustav A     │          │  Sustav B     │
└───────────────┘          └───────────────┘
```

### Komponente Arhitekture

1. **TRC (Tracing) tablice** - Ulazne tablice za asinkronu komunikaciju (s `DEST_UNIT` poljem)
2. **Spring Boot Scheduler** - Polling mehanizam za čitanje TRC tablica
3. **Transformation Service** - Transformacija podataka putem DTO-a (Java)
4. **Split Service** - Parsiranje `DEST_UNIT` polja i distribucija na ciljne sustave (Java)
5. **Destination Resolver** - Određivanje datasource-a na temelju ciljnog sustava
6. **Multi-Datasource Configuration** - Konfiguracija više datasource-a za različite sustave
7. **STG (Staging) tablice** - Izlazne tablice za ciljne sustave
8. **REST Controllers** - Sinkrona komunikacija
9. **Configuration Database** - Konfiguracija sučelja i pravila

---

## 2.3 Komponente i Njihova Uloga

### 2.3.1 Baza Podataka (Oracle)

**TRC Tablice - Struktura (sufiks konvencija: *_TRC)**

```sql
CREATE TABLE "SWISSLOG_INT"."ORDERS_TRC" (
    "ROW_NUMBER"              NUMBER(19,0) NOT NULL ENABLE,  -- PK (sekvenca)
    "CONTROL_STATUS"          VARCHAR2(1 BYTE),              -- N/M/D/U
    -- Business polja
    "ORDER_NUMBER"            VARCHAR2(50 BYTE) NOT NULL,
    "CUSTOMER_ID"             VARCHAR2(20 BYTE),
    "ORDER_DATA"              CLOB,                          -- JSON ili XML
    "SOURCE_SYSTEM"           VARCHAR2(50 BYTE),
    -- Split destination polje (CSV format)
    "DEST_UNIT"               VARCHAR2(200 BYTE),            -- "All", "WMS", "ORD", "WMS, ORD"
    -- Tehnička polja
    "ROW_STATUS"              VARCHAR2(1 BYTE),              -- N/P/E/S
    "ROW_STATUS_CODE"         VARCHAR2(3 BYTE),              -- HTTP status kod
    "ROW_ERROR_DESCRIPTION"   VARCHAR2(4000 BYTE),
    "ROW_UPDATE_DATETIME"     TIMESTAMP(6),
    "ROW_UPDATE_USER"         VARCHAR2(100 BYTE),
    "ROW_CREATE_DATETIME"     TIMESTAMP(6),
    "ROW_CREATE_USER"         VARCHAR2(100 BYTE),
    CONSTRAINT "PK_ORDERS_TRC" PRIMARY KEY ("ROW_NUMBER")
);

-- CONTROL_STATUS: N=NEW, M=MODIFIED, D=DELETED, U=UNMODIFIED
-- ROW_STATUS: N=NEW (čeka obradu), P=PROCESSED, E=ERROR, S=SKIPPED
```

### 2.3.2 Spring Boot Aplikacija

**Struktura Projekta**

```
integration-service/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/template/integration/
│   │   │       ├── IntegrationServiceApplication.java
│   │   │       ├── config/
│   │   │       │   ├── DatabaseConfig.java
│   │   │       │   ├── SchedulerConfig.java
│   │   │       │   └── RestTemplateConfig.java
│   │   │       ├── controller/
│   │   │       │   ├── OrderIntegrationController.java
│   │   │       │   └── HealthCheckController.java
│   │   │       ├── service/
│   │   │       │   ├── TrcPollingService.java
│   │   │       │   ├── TransformationService.java
│   │   │       │   ├── SplitService.java
│   │   │       │   └── StagingService.java
│   │   │       ├── repository/
│   │   │       │   ├── TrcOrdersRepository.java
│   │   │       │   ├── StgOrdersRepository.java
│   │   │       │   └── ConfigInterfaceRepository.java
│   │   │       ├── entity/
│   │   │       │   ├── TrcOrder.java
│   │   │       │   ├── StgOrder.java
│   │   │       │   └── ConfigInterface.java
│   │   │       ├── dto/
│   │   │       │   ├── OrderDTO.java
│   │   │       │   └── TransformationResultDTO.java
│   │   │       ├── scheduler/
│   │   │       │   └── IntegrationScheduler.java
│   │   │       └── exception/
│   │   │           ├── TransformationException.java
│   │   │           └── GlobalExceptionHandler.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-test.properties
│   │       └── application-prod.properties
│   └── test/
└── pom.xml
```

---

## 2.4 Upravljanje Greškama i Koncept Nadzora

### Error Handling Strategija

```java
/**
 * ROW_STATUS vrijednosti:
 * N = NEW (novi zapis, čeka obradu)
 * P = PROCESSED (uspješno obrađeno)
 * E = ERROR (greška u obradi)
 * S = SKIPPED (preskočeno, npr. UNMODIFIED zapis)
 */
public enum RowStatus {
    N, P, E, S
}

@Transactional
public void processTrcRecord(TrcOrder trcOrder) {
    try {
        // 1. Postavi ROW_STATUS na 'P' (Processing/Processed će biti na kraju)
        // Za vrijeme obrade možemo koristiti pomoćno polje ili ostaviti 'N'
        trcOrder.setRowUpdateDatetime(LocalDateTime.now());
        trcOrdersRepository.save(trcOrder);

        // 2. Transformacija (Java/DTO)
        TransformationResultDTO result = transformationService.transform(trcOrder);

        // 3. Split logika - parsiranje DEST_UNIT polja
        List<String> targetSystems = splitService.parseDestinationUnits(trcOrder.getDestUnit());

        // 4. Upis u STG tablice za svaki ciljni sustav
        for (String system : targetSystems) {
            stagingService.writeToStaging(result, system);
        }

        // 5. Uspješno - postavi ROW_STATUS='P', ROW_STATUS_CODE='200'
        trcOrder.setRowStatus(RowStatus.P);
        trcOrder.setRowStatusCode("200");
        trcOrder.setRowUpdateDatetime(LocalDateTime.now());
        trcOrdersRepository.save(trcOrder);

    } catch (TransformationException e) {
        handleTransformationError(trcOrder, e);
    } catch (Exception e) {
        handleGeneralError(trcOrder, e);
    }
}

private void handleTransformationError(TrcOrder trcOrder, TransformationException e) {
    // Greška - postavi ROW_STATUS='E', ROW_STATUS_CODE='500'
    trcOrder.setRowStatus(RowStatus.E);
    trcOrder.setRowStatusCode("500");
    trcOrder.setRowErrorDescription(e.getMessage());
    trcOrder.setRowUpdateDatetime(LocalDateTime.now());
    trcOrdersRepository.save(trcOrder);
}
```

### Logging Strategija

**application.properties**

```properties
# Logging Configuration
logging.level.root=INFO
logging.level.com.template.integration=DEBUG
logging.level.org.springframework.jdbc.core=DEBUG
logging.level.org.hibernate.SQL=DEBUG

# Log file configuration
logging.file.name=logs/integration-service.log
logging.file.max-size=10MB
logging.file.max-history=30
```

**Log Levels**

| Level | Upotreba |
|-------|----------|
| **ERROR** | Kritične greške koje zahtijevaju intervenciju |
| **WARN** | Potencijalni problemi, retry pokušaji |
| **INFO** | Normalan tijek programa (start, stop, processed records) |
| **DEBUG** | Detalji o procesima (DEV/TEST) |
| **TRACE** | SQL upiti, detaljni podatci (samo DEV) |

### Health Check Endpoint

```java
@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @Autowired
    private TrcOrdersRepository trcRepository;

    @GetMapping("/status")
    public ResponseEntity<HealthStatus> getHealthStatus() {
        HealthStatus status = new HealthStatus();

        // ROW_STATUS: N=NEW, P=PROCESSED, E=ERROR, S=SKIPPED
        long errorCount = trcRepository.countByRowStatus(RowStatus.E);
        status.setErrorRecords(errorCount);

        long processedCount = trcRepository.countByRowStatus(RowStatus.P);
        status.setProcessedRecords(processedCount);

        long pendingCount = trcRepository.countByRowStatus(RowStatus.N);
        status.setPendingRecords(pendingCount);

        long skippedCount = trcRepository.countByRowStatus(RowStatus.S);
        status.setSkippedRecords(skippedCount);

        status.setStatus(errorCount > 100 ? "UNHEALTHY" : "HEALTHY");

        return ResponseEntity.ok(status);
    }
}
```

---

## 2.5 Konfiguriranje Sučelja

### Dinamička Konfiguracija iz Baze

**CONFIG_INTERFACE Tablica**

```sql
INSERT INTO SWISSLOG_INT.CONFIG_INTERFACE VALUES (
    'ORD_TO_SYSTEM_A',
    'Orders Integration to System A',
    'TRC_STG',
    'ORDERS_TRC',                           -- Sufiks konvencija: *_TRC
    'ORDERS_STG',                           -- Sufiks konvencija: *_STG
    'Y', -- enabled
    30,  -- poll every 30 seconds
    100, -- batch size
    3,   -- retry attempts
    'JAVA:DefaultTransformationStrategy',   -- Transformacija u Javi
    NULL,                                   -- Split logika koristi DEST_UNIT polje
    'Integration for order synchronization',
    SYSDATE
);
```

### Properties File Hierarchy

**application.properties** (Default)

```properties
# Application
spring.application.name=integration-service
server.port=8092

# Database
spring.datasource.url=jdbc:h2:mem:integrationdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop

# Integration defaults
integration.polling.interval=30000
integration.batch.size=100
integration.retry.max-attempts=3
```

**application-prod.properties**

```properties
# Oracle Database
spring.datasource.url=jdbc:oracle:thin:@${DB_HOST}:${DB_PORT}:${DB_SID}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
spring.jpa.show-sql=false

# Integration
integration.polling.interval=30000
integration.batch.size=500
integration.retry.max-attempts=5
```

---

## 2.6 Raspored Izvođenja (Scheduling)

### Spring Boot Scheduler Configuration

```java
@Configuration
@EnableScheduling
public class SchedulerConfig {

    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(10);
        scheduler.setThreadNamePrefix("integration-scheduler-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(60);
        return scheduler;
    }
}
```

### Polling Implementation

```java
@Service
@Slf4j
public class IntegrationScheduler {

    @Autowired
    private TrcPollingService trcPollingService;

    /**
     * Poll *_TRC tablice every 30 seconds
     */
    @Scheduled(fixedDelayString = "${integration.polling.interval:30000}")
    public void pollTrcTables() {
        log.info("Starting *_TRC tables polling");
        trcPollingService.pollAndProcess();
    }

    /**
     * Retry failed records every 5 minutes
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void retryFailedRecords() {
        log.info("Starting retry of failed records");
        trcPollingService.retryFailedRecords();
    }

    /**
     * Cleanup old completed records daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldRecords() {
        log.info("Starting cleanup of old records");
        trcPollingService.cleanupOldRecords();
    }
}
```

**Cron Expression Examples**

| Expression | Meaning |
|------------|---------|
| `0 */5 * * * *` | Every 5 minutes |
| `0 0 * * * *` | Every hour |
| `0 0 2 * * *` | Every day at 2 AM |
| `0 0 9-17 * * MON-FRI` | Every hour from 9-5 PM on weekdays |

---

# 3. IMPLEMENTACIJA SPRING BOOT SUČELJA

## 3.1 Kreiranje Kontrolera (Controllers)

### REST Controller za Sinkronu Integraciju

```java
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
                    .body(ApiResponse.success("Order submitted for processing", trcId));

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

        OrderStatusDTO status = orderIntegrationService.getOrderStatus(trcId);
        return ResponseEntity.ok(ApiResponse.success("Status retrieved", status));
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Service is healthy", "UP"));
    }
}
```

---

## 3.2 Servisni Sloj (Services)

### TrcPollingService - Polling TRC Tablica

```java
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

    /**
     * Glavni polling proces - čita zapise s ROW_STATUS='N' (NEW) iz TRC tablice
     */
    @Transactional
    public void pollAndProcess() {
        // ROW_STATUS='N' znači novi zapis koji čeka obradu
        List<TrcOrder> newRecords = trcOrdersRepository
                .findByRowStatusOrderByRowCreateDatetimeAsc(RowStatus.N)
                .stream()
                .limit(batchSize)
                .toList();

        if (newRecords.isEmpty()) {
            log.debug("No new TRC records to process");
            return;
        }

        log.info("Found {} new TRC records to process", newRecords.size());

        for (TrcOrder trcOrder : newRecords) {
            try {
                processTrcRecord(trcOrder);
            } catch (Exception e) {
                log.error("Critical error processing TRC ROW_NUMBER {}: {}",
                          trcOrder.getRowNumber(), e.getMessage(), e);
            }
        }
    }

    /**
     * Procesiranje pojedinačnog TRC zapisa
     *
     * ROW_STATUS vrijednosti:
     * N = NEW (novi, čeka obradu)
     * P = PROCESSED (uspješno obrađeno)
     * E = ERROR (greška)
     * S = SKIPPED (preskočeno)
     */
    @Transactional
    public void processTrcRecord(TrcOrder trcOrder) {
        log.info("Processing TRC record: ROW_NUMBER={}, OrderNumber={}",
                 trcOrder.getRowNumber(), trcOrder.getOrderNumber());

        try {
            // 1. Ažuriraj ROW_UPDATE_DATETIME
            trcOrder.setRowUpdateDatetime(LocalDateTime.now());
            trcOrder.setRowUpdateUser("INTEGRATION_SERVICE");
            trcOrdersRepository.save(trcOrder);

            // 2. Transformacija podataka (Java/DTO)
            TransformationResultDTO transformedData =
                transformationService.transform(trcOrder);

            // 3. Split logika - parsira DEST_UNIT polje i određuje ciljne sustave
            List<String> targetSystems = splitService.parseDestinationUnits(trcOrder.getDestUnit());

            // 4. Upis u STG tablice za svaki ciljni sustav (multi-datasource)
            for (String targetSystem : targetSystems) {
                stagingService.writeToStaging(trcOrder.getRowNumber(),
                                               transformedData,
                                               targetSystem);
            }

            // 5. Uspješno - postavi ROW_STATUS='P', ROW_STATUS_CODE='200'
            trcOrder.setRowStatus(RowStatus.P);
            trcOrder.setRowStatusCode("200");
            trcOrder.setRowUpdateDatetime(LocalDateTime.now());
            trcOrdersRepository.save(trcOrder);

            log.info("Successfully processed TRC ROW_NUMBER: {}", trcOrder.getRowNumber());

        } catch (TransformationException e) {
            handleError(trcOrder, "500", "Transformation error: " + e.getMessage());
        } catch (Exception e) {
            handleError(trcOrder, "500", "Error: " + e.getMessage());
        }
    }

    private void handleError(TrcOrder trcOrder, String statusCode, String errorMessage) {
        // Greška - postavi ROW_STATUS='E'
        trcOrder.setRowStatus(RowStatus.E);
        trcOrder.setRowStatusCode(statusCode);
        trcOrder.setRowErrorDescription(errorMessage);
        trcOrder.setRowUpdateDatetime(LocalDateTime.now());
        trcOrder.setRowUpdateUser("INTEGRATION_SERVICE");
        trcOrdersRepository.save(trcOrder);

        log.error("TRC ROW_NUMBER {} moved to ERROR status: {}",
                  trcOrder.getRowNumber(), errorMessage);
    }
}
```

### TransformationService

Transformacija se radi **isključivo u Javi** putem DTO-a. Nema poziva database procedura.

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class TransformationService {

    private final ObjectMapper objectMapper;
    private final List<TransformationStrategy> transformationStrategies;

    /**
     * Transformira podatke iz TRC formata u format za ciljni sustav
     * Transformacija se radi isključivo u Javi putem DTO-a
     */
    public TransformationResultDTO transform(TrcOrder trcOrder)
            throws TransformationException {

        try {
            log.info("Transforming TRC record: ID={}", trcOrder.getId());

            // Odaberi odgovarajuću strategiju transformacije
            TransformationStrategy strategy = findStrategy(trcOrder.getSourceSystem());

            // Transformiraj u DTO
            return strategy.transform(trcOrder);

        } catch (Exception e) {
            throw new TransformationException(
                "Failed to transform TRC ID " + trcOrder.getId(), e);
        }
    }

    private TransformationStrategy findStrategy(String sourceSystem) {
        return transformationStrategies.stream()
                .filter(s -> s.supports(sourceSystem))
                .findFirst()
                .orElse(new DefaultTransformationStrategy());
    }
}

/**
 * Strategija za transformaciju - omogućuje različite transformacije za različite izvore
 */
public interface TransformationStrategy {
    boolean supports(String sourceSystem);
    TransformationResultDTO transform(TrcOrder trcOrder);
}

/**
 * Default strategija - koristi se ako nije pronađena specifična
 */
@Component
public class DefaultTransformationStrategy implements TransformationStrategy {

    @Override
    public boolean supports(String sourceSystem) {
        return true; // Fallback za sve
    }

    @Override
    public TransformationResultDTO transform(TrcOrder trcOrder) {
        return TransformationResultDTO.builder()
                .orderId(trcOrder.getOrderNumber())
                .customerId(trcOrder.getCustomerId())
                .orderDate(trcOrder.getOrderDate())
                .sourceSystem(trcOrder.getSourceSystem())
                .transformedAt(LocalDateTime.now())
                .build();
    }
}

/**
 * Primjer specifične strategije za LEGACY sustav
 */
@Component
public class LegacyTransformationStrategy implements TransformationStrategy {

    @Override
    public boolean supports(String sourceSystem) {
        return sourceSystem != null && sourceSystem.startsWith("LEGACY_");
    }

    @Override
    public TransformationResultDTO transform(TrcOrder trcOrder) {
        // Specifična transformacija za LEGACY sustave
        return TransformationResultDTO.builder()
                .orderId(formatLegacyOrderId(trcOrder.getOrderNumber()))
                .customerId(trcOrder.getCustomerId())
                .orderDate(trcOrder.getOrderDate())
                .sourceSystem("TRANSFORMED_" + trcOrder.getSourceSystem())
                .transformedAt(LocalDateTime.now())
                .additionalData(Map.of("legacyFormat", true))
                .build();
    }

    private String formatLegacyOrderId(String orderNumber) {
        // Legacy transformacija formata
        return "LEG-" + orderNumber.replaceAll("[^0-9]", "");
    }
}
```

### TransformationResultDTO

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransformationResultDTO {

    private String orderId;
    private String customerId;
    private LocalDate orderDate;
    private BigDecimal totalAmount;
    private String sourceSystem;
    private LocalDateTime transformedAt;
    private List<TransformedItemDTO> items;
    private Map<String, Object> additionalData;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransformedItemDTO {

    private String itemCode;
    private String itemName;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private String uom; // Unit of Measure
}
```

### SplitService - Parsiranje DEST_UNIT Polja

Split logika se radi **isključivo u Javi** parsiranjem `DEST_UNIT` polja iz TRC tablice.

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class SplitService {

    private final DestinationResolver destinationResolver;

    // Registrirani sustavi u aplikaciji
    private static final Set<String> REGISTERED_SYSTEMS = Set.of(
        "WMS", "ORD", "SAP", "ERP", "CRM"
    );

    /**
     * Parsira DEST_UNIT polje i vraća listu ciljnih sustava
     *
     * @param destUnit CSV string sa sustavima (npr. "All", "WMS", "WMS, ORD")
     * @return Lista ciljnih sustava
     */
    public List<String> parseDestinationUnits(String destUnit) {
        if (destUnit == null || destUnit.isBlank()) {
            log.warn("DEST_UNIT is empty, defaulting to 'All'");
            return new ArrayList<>(REGISTERED_SYSTEMS);
        }

        String trimmed = destUnit.trim().toUpperCase();

        // "All" znači slanje na sve registrirane sustave
        if ("ALL".equals(trimmed)) {
            log.info("DEST_UNIT='All', routing to all systems: {}", REGISTERED_SYSTEMS);
            return new ArrayList<>(REGISTERED_SYSTEMS);
        }

        // Parsiranje CSV formata: "WMS, ORD" -> ["WMS", "ORD"]
        List<String> targets = Arrays.stream(trimmed.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .filter(this::isValidSystem)
                .distinct()
                .collect(Collectors.toList());

        if (targets.isEmpty()) {
            log.warn("No valid systems found in DEST_UNIT='{}', defaulting to 'All'", destUnit);
            return new ArrayList<>(REGISTERED_SYSTEMS);
        }

        log.info("DEST_UNIT='{}', routing to systems: {}", destUnit, targets);
        return targets;
    }

    /**
     * Provjerava je li sustav registriran
     */
    private boolean isValidSystem(String system) {
        boolean valid = REGISTERED_SYSTEMS.contains(system);
        if (!valid) {
            log.warn("Unknown system '{}' in DEST_UNIT, ignoring", system);
        }
        return valid;
    }

    /**
     * Vraća DataSource za ciljni sustav
     */
    public DataSource getDataSourceForSystem(String targetSystem) {
        return destinationResolver.resolveDataSource(targetSystem);
    }
}
```

### DestinationResolver - Multi-Datasource Routing

Klasa koja određuje koji datasource koristiti na temelju ciljnog sustava.

```java
@Component
@Slf4j
public class DestinationResolver {

    private final Map<String, DataSource> dataSources;

    public DestinationResolver(
            @Qualifier("wmsDataSource") DataSource wmsDataSource,
            @Qualifier("orderingDataSource") DataSource orderingDataSource,
            @Qualifier("sapDataSource") DataSource sapDataSource,
            @Qualifier("defaultDataSource") DataSource defaultDataSource) {

        this.dataSources = Map.of(
            "WMS", wmsDataSource,
            "ORD", orderingDataSource,
            "SAP", sapDataSource,
            "DEFAULT", defaultDataSource
        );
    }

    /**
     * Vraća DataSource za ciljni sustav
     *
     * @param targetSystem Kod sustava (WMS, ORD, SAP, itd.)
     * @return DataSource za taj sustav
     */
    public DataSource resolveDataSource(String targetSystem) {
        DataSource ds = dataSources.get(targetSystem.toUpperCase());

        if (ds == null) {
            log.warn("No DataSource configured for system '{}', using DEFAULT", targetSystem);
            return dataSources.get("DEFAULT");
        }

        log.debug("Resolved DataSource for system '{}'", targetSystem);
        return ds;
    }

    /**
     * Vraća JdbcTemplate za ciljni sustav
     */
    public JdbcTemplate getJdbcTemplate(String targetSystem) {
        return new JdbcTemplate(resolveDataSource(targetSystem));
    }

    /**
     * Provjerava je li sustav dostupan
     */
    public boolean isSystemAvailable(String targetSystem) {
        try {
            DataSource ds = resolveDataSource(targetSystem);
            try (Connection conn = ds.getConnection()) {
                return conn.isValid(5); // 5 sekundi timeout
            }
        } catch (SQLException e) {
            log.error("System '{}' is not available: {}", targetSystem, e.getMessage());
            return false;
        }
    }
}
```

### Multi-Datasource Configuration

```java
@Configuration
public class MultiDataSourceConfig {

    // ============ WMS DataSource ============
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.wms")
    public DataSourceProperties wmsDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "wmsDataSource")
    public DataSource wmsDataSource() {
        return wmsDataSourceProperties()
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    // ============ ORDERING DataSource ============
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.ordering")
    public DataSourceProperties orderingDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "orderingDataSource")
    public DataSource orderingDataSource() {
        return orderingDataSourceProperties()
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    // ============ SAP DataSource ============
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.sap")
    public DataSourceProperties sapDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "sapDataSource")
    public DataSource sapDataSource() {
        return sapDataSourceProperties()
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    // ============ DEFAULT DataSource ============
    @Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.default")
    public DataSourceProperties defaultDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "defaultDataSource")
    @Primary
    public DataSource defaultDataSource() {
        return defaultDataSourceProperties()
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }
}
```

### JPA EntityManagerFactory konfiguracija za Multi-Datasource

Za korištenje JPA s više datasource-a, potrebno je konfigurirati zasebne `EntityManagerFactory` i `TransactionManager` bean-ove za svaki datasource.

```java
@Configuration
@EnableJpaRepositories(
    basePackages = "com.template.integration.repository.wms",
    entityManagerFactoryRef = "wmsEntityManagerFactory",
    transactionManagerRef = "wmsTransactionManager"
)
public class WmsJpaConfig {

    @Autowired
    @Qualifier("wmsDataSource")
    private DataSource wmsDataSource;

    @Bean(name = "wmsEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean wmsEntityManagerFactory(
            EntityManagerFactoryBuilder builder) {
        return builder
                .dataSource(wmsDataSource)
                .packages("com.template.integration.entity.stg")  // STG entiteti
                .persistenceUnit("wms")
                .properties(jpaProperties())
                .build();
    }

    @Bean(name = "wmsTransactionManager")
    public PlatformTransactionManager wmsTransactionManager(
            @Qualifier("wmsEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    private Map<String, Object> jpaProperties() {
        Map<String, Object> props = new HashMap<>();
        props.put("hibernate.dialect", "org.hibernate.dialect.OracleDialect");
        props.put("hibernate.hbm2ddl.auto", "validate");
        props.put("hibernate.show_sql", false);
        return props;
    }
}

@Configuration
@EnableJpaRepositories(
    basePackages = "com.template.integration.repository.ordering",
    entityManagerFactoryRef = "orderingEntityManagerFactory",
    transactionManagerRef = "orderingTransactionManager"
)
public class OrderingJpaConfig {

    @Autowired
    @Qualifier("orderingDataSource")
    private DataSource orderingDataSource;

    @Bean(name = "orderingEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean orderingEntityManagerFactory(
            EntityManagerFactoryBuilder builder) {
        return builder
                .dataSource(orderingDataSource)
                .packages("com.template.integration.entity.stg")
                .persistenceUnit("ordering")
                .properties(jpaProperties())
                .build();
    }

    @Bean(name = "orderingTransactionManager")
    public PlatformTransactionManager orderingTransactionManager(
            @Qualifier("orderingEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    private Map<String, Object> jpaProperties() {
        Map<String, Object> props = new HashMap<>();
        props.put("hibernate.dialect", "org.hibernate.dialect.OracleDialect");
        props.put("hibernate.hbm2ddl.auto", "validate");
        props.put("hibernate.show_sql", false);
        return props;
    }
}

// Default JPA Config (za TRC tablice - source)
@Configuration
@EnableJpaRepositories(
    basePackages = "com.template.integration.repository.trc",
    entityManagerFactoryRef = "defaultEntityManagerFactory",
    transactionManagerRef = "defaultTransactionManager"
)
public class DefaultJpaConfig {

    @Autowired
    @Qualifier("defaultDataSource")
    private DataSource defaultDataSource;

    @Primary
    @Bean(name = "defaultEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean defaultEntityManagerFactory(
            EntityManagerFactoryBuilder builder) {
        return builder
                .dataSource(defaultDataSource)
                .packages("com.template.integration.entity.trc")  // TRC entiteti
                .persistenceUnit("default")
                .properties(jpaProperties())
                .build();
    }

    @Primary
    @Bean(name = "defaultTransactionManager")
    public PlatformTransactionManager defaultTransactionManager(
            @Qualifier("defaultEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    private Map<String, Object> jpaProperties() {
        Map<String, Object> props = new HashMap<>();
        props.put("hibernate.dialect", "org.hibernate.dialect.OracleDialect");
        props.put("hibernate.hbm2ddl.auto", "validate");
        props.put("hibernate.show_sql", true);
        return props;
    }
}
```

### DestinationResolver - JPA verzija

```java
@Component
@Slf4j
public class DestinationResolver {

    private final Map<String, EntityManagerFactory> entityManagerFactories;

    public DestinationResolver(
            @Qualifier("wmsEntityManagerFactory") EntityManagerFactory wmsEmf,
            @Qualifier("orderingEntityManagerFactory") EntityManagerFactory orderingEmf,
            @Qualifier("defaultEntityManagerFactory") EntityManagerFactory defaultEmf) {

        this.entityManagerFactories = Map.of(
            "WMS", wmsEmf,
            "ORD", orderingEmf,
            "DEFAULT", defaultEmf
        );
    }

    /**
     * Vraća EntityManager za ciljni sustav
     */
    public EntityManager getEntityManager(String targetSystem) {
        EntityManagerFactory emf = entityManagerFactories.get(targetSystem.toUpperCase());

        if (emf == null) {
            log.warn("No EntityManagerFactory for system '{}', using DEFAULT", targetSystem);
            emf = entityManagerFactories.get("DEFAULT");
        }

        return emf.createEntityManager();
    }

    /**
     * Vraća EntityManagerFactory za ciljni sustav
     */
    public EntityManagerFactory getEntityManagerFactory(String targetSystem) {
        EntityManagerFactory emf = entityManagerFactories.get(targetSystem.toUpperCase());

        if (emf == null) {
            log.warn("No EntityManagerFactory for system '{}', using DEFAULT", targetSystem);
            return entityManagerFactories.get("DEFAULT");
        }

        return emf;
    }
}
```

### application.properties - Multi-Datasource

```properties
# ============ DEFAULT DataSource (Source - TRC tablice) ============
spring.datasource.default.url=jdbc:oracle:thin:@${DB_HOST}:${DB_PORT}:${DB_SID}
spring.datasource.default.username=${DB_USERNAME}
spring.datasource.default.password=${DB_PASSWORD}
spring.datasource.default.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.default.hikari.maximum-pool-size=20
spring.datasource.default.hikari.minimum-idle=5

# ============ WMS DataSource ============
spring.datasource.wms.url=jdbc:oracle:thin:@${WMS_DB_HOST}:${WMS_DB_PORT}:${WMS_DB_SID}
spring.datasource.wms.username=${WMS_DB_USERNAME}
spring.datasource.wms.password=${WMS_DB_PASSWORD}
spring.datasource.wms.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.wms.hikari.maximum-pool-size=10
spring.datasource.wms.hikari.minimum-idle=2

# ============ ORDERING DataSource ============
spring.datasource.ordering.url=jdbc:oracle:thin:@${ORD_DB_HOST}:${ORD_DB_PORT}:${ORD_DB_SID}
spring.datasource.ordering.username=${ORD_DB_USERNAME}
spring.datasource.ordering.password=${ORD_DB_PASSWORD}
spring.datasource.ordering.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.ordering.hikari.maximum-pool-size=10
spring.datasource.ordering.hikari.minimum-idle=2

# ============ SAP DataSource ============
spring.datasource.sap.url=jdbc:oracle:thin:@${SAP_DB_HOST}:${SAP_DB_PORT}:${SAP_DB_SID}
spring.datasource.sap.username=${SAP_DB_USERNAME}
spring.datasource.sap.password=${SAP_DB_PASSWORD}
spring.datasource.sap.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.sap.hikari.maximum-pool-size=10
spring.datasource.sap.hikari.minimum-idle=2
```

### STG Entity - JPA Entitet

```java
@Entity
@Table(name = "PRODUCTS_STG", schema = "SWISSLOG_INT")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductsStg {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "products_stg_seq")
    @SequenceGenerator(name = "products_stg_seq",
                       sequenceName = "SWISSLOG_INT.PRODUCTS_STG_SEQ",
                       allocationSize = 1)
    @Column(name = "ROW_NUMBER")
    private Long rowNumber;

    @Column(name = "CONTROL_STATUS", length = 1)
    private String controlStatus;

    @Column(name = "PRODUCT_ID", length = 30)
    private String productId;

    @Column(name = "PRODUCT_NAME", length = 200)
    private String productName;

    @Column(name = "CATEGORY", length = 50)
    private String category;

    @Column(name = "UNIT_OF_MEASURE", length = 10)
    private String unitOfMeasure;

    // Tehnička polja
    @Enumerated(EnumType.STRING)
    @Column(name = "ROW_STATUS", length = 1)
    private RowStatus rowStatus;

    @Column(name = "ROW_STATUS_CODE", length = 3)
    private String rowStatusCode;

    @Column(name = "ROW_ERROR_DESCRIPTION", length = 4000)
    private String rowErrorDescription;

    @Column(name = "ROW_CREATE_DATETIME")
    private LocalDateTime rowCreateDatetime;

    @Column(name = "ROW_CREATE_USER", length = 100)
    private String rowCreateUser;

    @Column(name = "ROW_UPDATE_DATETIME")
    private LocalDateTime rowUpdateDatetime;

    @Column(name = "ROW_UPDATE_USER", length = 100)
    private String rowUpdateUser;

    @PrePersist
    protected void onCreate() {
        rowCreateDatetime = LocalDateTime.now();
        rowCreateUser = "INTEGRATION_SERVICE";
        if (controlStatus == null) controlStatus = "N";
        if (rowStatus == null) rowStatus = RowStatus.N;
    }

    @PreUpdate
    protected void onUpdate() {
        rowUpdateDatetime = LocalDateTime.now();
        rowUpdateUser = "INTEGRATION_SERVICE";
    }
}
```

### STG Repository - Po Sustavu

```java
// WMS Repository
package com.template.integration.repository.wms;

@Repository
public interface WmsProductsStgRepository extends JpaRepository<ProductsStg, Long> {

    List<ProductsStg> findByRowStatus(RowStatus rowStatus);

    long countByRowStatus(RowStatus rowStatus);
}

// ORDERING Repository
package com.template.integration.repository.ordering;

@Repository
public interface OrderingProductsStgRepository extends JpaRepository<ProductsStg, Long> {

    List<ProductsStg> findByRowStatus(RowStatus rowStatus);

    long countByRowStatus(RowStatus rowStatus);
}
```

### StagingService - JPA verzija s Multi-Datasource

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class StagingService {

    private final DestinationResolver destinationResolver;

    // Repozitoriji za svaki sustav
    private final WmsProductsStgRepository wmsRepository;
    private final OrderingProductsStgRepository orderingRepository;

    /**
     * Upisuje transformirane podatke u STG tablicu ciljnog sustava
     * Koristi JPA i odgovarajući Repository na temelju targetSystem
     */
    public void writeToStaging(Long trcRowNumber, TransformationResultDTO data, String targetSystem) {
        log.info("Writing to staging for system '{}', TRC ROW_NUMBER: {}", targetSystem, trcRowNumber);

        // Kreiraj STG entitet iz transformiranih podataka
        ProductsStg stgEntity = ProductsStg.builder()
                .controlStatus("N")
                .productId(data.getOrderId())
                .productName(data.getCustomerId())
                .rowStatus(RowStatus.N)
                .build();

        // Spremi u odgovarajući repository na temelju ciljnog sustava
        saveToTargetSystem(stgEntity, targetSystem);

        log.info("Successfully written to {} staging table via JPA", targetSystem);
    }

    /**
     * Batch upis u STG tablice korištenjem JPA
     */
    public void writeToStagingBatch(List<TransformationResultDTO> dataList, String targetSystem) {
        log.info("Batch writing {} records to staging for system '{}' via JPA",
                 dataList.size(), targetSystem);

        List<ProductsStg> entities = dataList.stream()
                .map(data -> ProductsStg.builder()
                        .controlStatus("N")
                        .productId(data.getOrderId())
                        .productName(data.getCustomerId())
                        .rowStatus(RowStatus.N)
                        .build())
                .collect(Collectors.toList());

        saveAllToTargetSystem(entities, targetSystem);

        log.info("Successfully batch written {} records to {} staging via JPA",
                 dataList.size(), targetSystem);
    }

    private void saveToTargetSystem(ProductsStg entity, String targetSystem) {
        switch (targetSystem.toUpperCase()) {
            case "WMS" -> wmsRepository.save(entity);
            case "ORD" -> orderingRepository.save(entity);
            default -> {
                log.warn("Unknown target system '{}', using WMS as default", targetSystem);
                wmsRepository.save(entity);
            }
        }
    }

    private void saveAllToTargetSystem(List<ProductsStg> entities, String targetSystem) {
        switch (targetSystem.toUpperCase()) {
            case "WMS" -> wmsRepository.saveAll(entities);
            case "ORD" -> orderingRepository.saveAll(entities);
            default -> {
                log.warn("Unknown target system '{}', using WMS as default", targetSystem);
                wmsRepository.saveAll(entities);
            }
        }
    }
}
```

### Alternativa: Dinamički EntityManager pristup

Ako ne želite imati zasebne repozitorije za svaki sustav, možete koristiti dinamički `EntityManager`:

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class DynamicStagingService {

    private final DestinationResolver destinationResolver;

    /**
     * Upisuje u STG tablicu korištenjem dinamički odabranog EntityManager-a
     */
    public void writeToStaging(Long trcRowNumber, TransformationResultDTO data, String targetSystem) {
        log.info("Writing to staging for system '{}', TRC ROW_NUMBER: {}", targetSystem, trcRowNumber);

        EntityManager em = destinationResolver.getEntityManager(targetSystem);
        EntityTransaction tx = em.getTransaction();

        try {
            tx.begin();

            ProductsStg stgEntity = ProductsStg.builder()
                    .controlStatus("N")
                    .productId(data.getOrderId())
                    .productName(data.getCustomerId())
                    .rowStatus(RowStatus.N)
                    .rowCreateDatetime(LocalDateTime.now())
                    .rowCreateUser("INTEGRATION_SERVICE")
                    .build();

            em.persist(stgEntity);
            tx.commit();

            log.info("Successfully written to {} staging table, ROW_NUMBER: {}",
                     targetSystem, stgEntity.getRowNumber());

        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            log.error("Failed to write to {} staging: {}", targetSystem, e.getMessage());
            throw new StagingException("Failed to write to staging", e);
        } finally {
            em.close();
        }
    }

    /**
     * Batch upis korištenjem dinamičkog EntityManager-a
     */
    public void writeToStagingBatch(List<TransformationResultDTO> dataList, String targetSystem) {
        log.info("Batch writing {} records to {} staging", dataList.size(), targetSystem);

        EntityManager em = destinationResolver.getEntityManager(targetSystem);
        EntityTransaction tx = em.getTransaction();

        try {
            tx.begin();

            int batchSize = 50;
            for (int i = 0; i < dataList.size(); i++) {
                TransformationResultDTO data = dataList.get(i);

                ProductsStg stgEntity = ProductsStg.builder()
                        .controlStatus("N")
                        .productId(data.getOrderId())
                        .productName(data.getCustomerId())
                        .rowStatus(RowStatus.N)
                        .rowCreateDatetime(LocalDateTime.now())
                        .rowCreateUser("INTEGRATION_SERVICE")
                        .build();

                em.persist(stgEntity);

                // Flush and clear batch for memory optimization
                if (i > 0 && i % batchSize == 0) {
                    em.flush();
                    em.clear();
                }
            }

            tx.commit();
            log.info("Successfully batch written {} records to {} staging", dataList.size(), targetSystem);

        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            log.error("Failed batch write to {} staging: {}", targetSystem, e.getMessage());
            throw new StagingException("Failed batch write to staging", e);
        } finally {
            em.close();
        }
    }
}
```

---

## 3.3 Repozitoriji i Pristup Bazi

### TrcOrdersRepository

```java
@Repository
public interface TrcOrdersRepository extends JpaRepository<TrcOrder, Long> {

    // ROW_STATUS: N=NEW, P=PROCESSED, E=ERROR, S=SKIPPED
    List<TrcOrder> findByRowStatusOrderByRowCreateDatetimeAsc(RowStatus rowStatus);

    long countByRowStatus(RowStatus rowStatus);

    @Modifying
    @Query("DELETE FROM TrcOrder t WHERE t.rowStatus = :rowStatus " +
           "AND t.rowUpdateDatetime < :before")
    long deleteByRowStatusAndRowUpdateDatetimeBefore(
        @Param("rowStatus") RowStatus rowStatus,
        @Param("before") LocalDateTime before);

    // Pronađi zapise koji su dugo u obradi (potencijalno zaglavljeni)
    @Query("SELECT t FROM TrcOrder t WHERE t.rowStatus = 'N' " +
           "AND t.rowCreateDatetime < :threshold")
    List<TrcOrder> findStuckRecords(@Param("threshold") LocalDateTime threshold);
}
```

---

## 3.4 DTO i Mapiranje Podataka

### OrderDTO - Request DTO

```java
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
```

### ApiResponse - Generic Response Wrapper

```java
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
}
```

---

## 3.5 Validacija Korisničkih Unosa

### Bean Validation

```java
@Data
public class OrderDTO {

    @NotBlank(message = "Order number is required")
    @Size(min = 5, max = 50, message = "Order number must be between 5 and 50 characters")
    @Pattern(regexp = "^ORD[0-9]{7}$", message = "Order number must match format ORDxxxxxxx")
    private String orderNumber;

    @NotNull(message = "Order date is required")
    @PastOrPresent(message = "Order date cannot be in the future")
    private LocalDate orderDate;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    @DecimalMin(value = "0.01", message = "Minimum amount is 0.01")
    @DecimalMax(value = "1000000.00", message = "Maximum amount is 1,000,000")
    private BigDecimal totalAmount;
}
```

---

## 3.6 Obrada Iznimki i Vraćanje HTTP Statusa

### Global Exception Handler

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Validation failed")
                        .data(errors)
                        .errorCode("VALIDATION_ERROR")
                        .build());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
            ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
```

### HTTP Status Mapping

| Status Code | Opis | Kada koristiti |
|------------|------|----------------|
| **200 OK** | Uspješan request | GET, PUT uspješno |
| **201 Created** | Resurs kreiran | POST uspješno kreirao resurs |
| **202 Accepted** | Prihvaćeno za obradu | Asinkrona obrada započeta |
| **400 Bad Request** | Neispravni podaci | Validation error |
| **404 Not Found** | Resurs ne postoji | GET na nepostojeći resurs |
| **422 Unprocessable Entity** | Business logic error | Validation passed, ali business rules failed |
| **500 Internal Server Error** | Greška servera | Neočekivana greška |

---

# 4. DODACI

## 4.1 Konvencije Nazivanja i Strukture Koda

### 4.1.1 Imenovanje Paketa

```
com.template.integration
├── config              - Konfiguracije (DB, Security, Scheduler)
├── controller          - REST kontroleri
├── service             - Business logika
├── repository          - Data Access Layer
├── entity              - JPA entiteti
├── dto                 - Data Transfer Objects
├── exception           - Custom exceptioni
├── scheduler           - Scheduled taskovi
├── validator           - Custom validatori
└── util                - Helper klase
```

### 4.1.2 Imenovanje Klasa

| Tip | Konvencija | Primjer |
|-----|-----------|---------|
| **Controller** | `<Resource>Controller` | `OrderIntegrationController` |
| **Service** | `<Resource>Service` | `TrcPollingService` |
| **Repository** | `<Entity>Repository` | `TrcOrdersRepository` |
| **Entity** | `<TableName>` bez prefiksa | `TrcOrder`, `StgOrder` |
| **DTO** | `<Resource>DTO` | `OrderDTO`, `OrderStatusDTO` |
| **Exception** | `<Type>Exception` | `TransformationException` |

### 4.1.3 Imenovanje Tablica i Kolona

**Tablice (sufiks konvencija):**
- `<ENTITY>_TRC` - Tracing tablice (npr. `RECEIPT_TRC`, `ORDER_TRC`)
- `<ENTITY>_STG` - Staging tablice (npr. `PRODUCTS_STG`, `CODES_STG`)
- `CONFIG_<TYPE>` - Konfiguracijske tablice

**Tehnička polja (zajednička za sve tablice):**
- `ROW_NUMBER` - Primary key (sekvenca)
- `CONTROL_STATUS` - Status kontrole (N/M/D/U)
- `ROW_STATUS` - Status obrade (N/P/E/S)
- `ROW_STATUS_CODE` - HTTP status kod
- `ROW_ERROR_DESCRIPTION` - Opis greške
- `ROW_CREATE_DATETIME`, `ROW_CREATE_USER` - Audit polja kreiranja
- `ROW_UPDATE_DATETIME`, `ROW_UPDATE_USER` - Audit polja ažuriranja

**Business polja:**
- UPPERCASE s underscore: `RECEIPT_ID`, `SUPPLIER_ID`, `BARCODE`
- Foreign key: `ROW_NUMBER` (referencira master tablicu)

---

## 4.2 Okoline (DEV/TEST, PROD)

### 4.2.1 Spring Profiles

#### application-dev.properties

```properties
# H2 In-Memory Database
spring.datasource.url=jdbc:h2:mem:integrationdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# H2 Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Integration settings
integration.polling.interval=60000
integration.batch.size=10
```

#### application-prod.properties

```properties
# Oracle Database
spring.datasource.url=jdbc:oracle:thin:@${DB_HOST}:${DB_PORT}:${DB_SID}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# Connection pool
spring.datasource.hikari.maximum-pool-size=50
spring.datasource.hikari.minimum-idle=10

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Integration settings
integration.polling.interval=30000
integration.batch.size=500
integration.retry.max-attempts=5

# Logging
logging.level.root=WARN
logging.level.com.template.integration=INFO
```

### 4.2.2 Environment Variables

**Linux (setenv.sh):**

```bash
#!/bin/bash
export DB_USERNAME=integration_user
export DB_PASSWORD=secure_password_here
export SPRING_PROFILES_ACTIVE=prod
export CATALINA_OPTS="$CATALINA_OPTS -Xms512m -Xmx2048m"
export CATALINA_OPTS="$CATALINA_OPTS -Dspring.profiles.active=prod"
```

**Windows (setenv.bat):**

```batch
@echo off
set DB_USERNAME=integration_user
set DB_PASSWORD=secure_password_here
set SPRING_PROFILES_ACTIVE=prod
set CATALINA_OPTS=%CATALINA_OPTS% -Xms512m -Xmx2048m
set CATALINA_OPTS=%CATALINA_OPTS% -Dspring.profiles.active=prod
```

---

## 4.3 Implementacija - Produkcijska Okolina

### 4.3.1 Apache Tomcat Deployment (PRIMARNO)

#### A. Priprema WAR File-a

**pom.xml:**

```xml
<packaging>war</packaging>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-tomcat</artifactId>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

**Application Class:**

```java
@SpringBootApplication
@EnableScheduling
public class IntegrationServiceApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(IntegrationServiceApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(IntegrationServiceApplication.class, args);
    }
}
```

**Build WAR:**

```bash
mvn clean package -DskipTests
# Rezultat: target/integration-service.war
```

#### B. Deployment

```bash
# Copy WAR file
sudo cp target/integration-service.war /opt/tomcat/webapps/

# Restart Tomcat
sudo systemctl restart tomcat

# Verify
curl http://localhost:8080/integration-service/api/health/status
```

#### C. Systemd Service

```ini
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment="JAVA_HOME=/usr/lib/jvm/java-17-openjdk"
Environment="CATALINA_HOME=/opt/tomcat"
ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh
RestartSec=10
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 4.4 Testiranje

### 4.4.1 Unit Testiranje

```bash
mvn test
mvn test -Dtest=TrcPollingServiceTest
```

### 4.4.2 Integracijsko Testiranje

```bash
mvn test -Dtest="**/*IntegrationTest.java"
mvn test -Dspring.profiles.active=test
```

### 4.4.3 Test Coverage

**Cilj:** Minimalno 80% code coverage

```bash
mvn clean test jacoco:report
# Report: target/site/jacoco/index.html
```

---

## 4.5 Dokumentacija

### 4.5.1 Swagger / OpenAPI

```
Development: http://localhost:8092/swagger-ui.html
Production:  https://server/integration-service/swagger-ui.html
```

### 4.5.2 Tipovi Dokumentacije

| Tip | Opis | Format |
|-----|------|--------|
| **MD** | Metodička dokumentacija | Markdown/Word |
| **TD** | Tehnička dokumentacija | Markdown + Swagger |
| **FD** | Funkcionalna dokumentacija | Word |
| **KDK** | Komentari u kodu | JavaDoc, SQL komentari |

---

## 4.6 Održavanje Sustava i Nadogradnja

### 4.6.1 Monitoring

**Actuator Endpoints:**

```
/actuator/health
/actuator/info
/actuator/metrics
```

**JMX Monitoring:**

```bash
jconsole tomcat-server:9090
```

### 4.6.2 Verzioniranje

**Semantic Versioning:** `MAJOR.MINOR.PATCH`

**Release Checklist:**
- [ ] Code review completed
- [ ] Tests passing (>80% coverage)
- [ ] Database scripts prepared
- [ ] Documentation updated
- [ ] WAR file built and tested
- [ ] Rollback plan prepared

---

# 5. SQL SKRIPTE

## 5.1 TRC (Tracing) Tablice

Sufiks `_TRC` označava ulazne tablice (Tracing) - podatci koje prima integracijski servis.

### Primjer: RECEIPT_TRC (Master tablica)

```sql
CREATE TABLE "SWISSLOG_INT"."RECEIPT_TRC" (
    "ROW_NUMBER"              NUMBER(19,0) NOT NULL ENABLE,
    "CONTROL_STATUS"          VARCHAR2(1 BYTE),
    -- Business polja
    "RECEIPT_ID"              VARCHAR2(30 BYTE),
    "RECEIPT_DATE"            DATE,
    "SUPPLIER_ID"             VARCHAR2(20 BYTE),
    "WAREHOUSE_ID"            VARCHAR2(20 BYTE),
    -- Split destination polje (CSV format)
    "DEST_UNIT"               VARCHAR2(200 BYTE),  -- "All", "WMS", "ORD", "WMS, ORD", itd.
    -- Tehnička polja
    "ROW_STATUS"              VARCHAR2(1 BYTE),
    "ROW_STATUS_CODE"         VARCHAR2(3 BYTE),
    "ROW_ERROR_DESCRIPTION"   VARCHAR2(4000 BYTE),
    "ROW_UPDATE_DATETIME"     TIMESTAMP(6),
    "ROW_UPDATE_USER"         VARCHAR2(100 BYTE),
    "ROW_CREATE_DATETIME"     TIMESTAMP(6),
    "ROW_CREATE_USER"         VARCHAR2(100 BYTE),
    CONSTRAINT "PK_RECEIPT_TRC" PRIMARY KEY ("ROW_NUMBER")
);

-- DEST_UNIT vrijednosti:
-- "All"       - Slanje na sve registrirane sustave (WMS, ORDERING, SAP, itd.)
-- "WMS"       - Samo WMS sustav
-- "ORD"       - Samo ORDERING sustav
-- "WMS, ORD"  - WMS i ORDERING sustavi
-- "SAP, WMS"  - SAP i WMS sustavi
```

### Primjer: RECEIPT_DETAILS_TRC (Detail tablica)

```sql
CREATE TABLE "SWISSLOG_INT"."RECEIPT_DETAILS_TRC" (
    "ROW_NUMBER"              NUMBER(19,0) NOT NULL ENABLE,
    "CONTROL_STATUS"          VARCHAR2(1 BYTE),
    -- Business polja
    "LINE_NO"                 NUMBER(10,0),
    "ITEM"                    VARCHAR2(30 BYTE),
    "QUANTITY"                NUMBER(20,4),
    "CONTAINER_ID"            VARCHAR2(20 BYTE),
    "EXPIRY_DATE"             DATE,
    "LOT_NBR"                 VARCHAR2(30 BYTE),
    "ORIGIN_COUNTRY_ID"       VARCHAR2(20 BYTE),
    "VARIETY"                 VARCHAR2(100 BYTE),
    "CLASS"                   VARCHAR2(20 BYTE),
    -- Tehnička polja
    "ROW_STATUS"              VARCHAR2(1 BYTE),
    "ROW_STATUS_CODE"         VARCHAR2(3 BYTE),
    "ROW_ERROR_DESCRIPTION"   VARCHAR2(4000 BYTE),
    "ROW_UPDATE_DATETIME"     TIMESTAMP(6),
    "ROW_UPDATE_USER"         VARCHAR2(100 BYTE),
    "ROW_CREATE_DATETIME"     TIMESTAMP(6),
    "ROW_CREATE_USER"         VARCHAR2(100 BYTE),
    CONSTRAINT "PK_RECEIPT_DETAILS_TRC" PRIMARY KEY ("ROW_NUMBER"),
    CONSTRAINT "FK_RECEIPT_DETAILS_TRC" FOREIGN KEY ("ROW_NUMBER")
        REFERENCES "SWISSLOG_INT"."RECEIPT_TRC" ("ROW_NUMBER") ENABLE
);
```

### Indeksi za TRC tablice

```sql
CREATE INDEX IDX_RECEIPT_TRC_STATUS ON SWISSLOG_INT.RECEIPT_TRC(ROW_STATUS);
CREATE INDEX IDX_RECEIPT_TRC_CONTROL ON SWISSLOG_INT.RECEIPT_TRC(CONTROL_STATUS);
CREATE INDEX IDX_RECEIPT_TRC_CREATE ON SWISSLOG_INT.RECEIPT_TRC(ROW_CREATE_DATETIME);
```

---

## 5.2 STG (Staging) Tablice

Sufiks `_STG` označava izlazne tablice (Staging) - podatci koje integracijski servis šalje ciljnim sustavima.

### Primjer: PRODUCTS_STG (Master tablica)

```sql
CREATE TABLE "SWISSLOG_INT"."PRODUCTS_STG" (
    "ROW_NUMBER"              NUMBER(19,0) NOT NULL ENABLE,
    "CONTROL_STATUS"          VARCHAR2(1 BYTE),
    -- Business polja
    "PRODUCT_ID"              VARCHAR2(30 BYTE),
    "PRODUCT_NAME"            VARCHAR2(200 BYTE),
    "CATEGORY"                VARCHAR2(50 BYTE),
    "UNIT_OF_MEASURE"         VARCHAR2(10 BYTE),
    -- Tehnička polja
    "ROW_STATUS"              VARCHAR2(1 BYTE),
    "ROW_STATUS_CODE"         VARCHAR2(3 BYTE),
    "ROW_ERROR_DESCRIPTION"   VARCHAR2(4000 BYTE),
    "ROW_UPDATE_DATETIME"     TIMESTAMP(6),
    "ROW_UPDATE_USER"         VARCHAR2(100 BYTE),
    "ROW_CREATE_DATETIME"     TIMESTAMP(6),
    "ROW_CREATE_USER"         VARCHAR2(100 BYTE),
    CONSTRAINT "PK_PRODUCTS_STG" PRIMARY KEY ("ROW_NUMBER")
);
```

### Primjer: CODES_STG (Detail tablica)

```sql
CREATE TABLE "SWISSLOG_INT"."CODES_STG" (
    "ROW_NUMBER"              NUMBER(19,0) NOT NULL ENABLE,
    "CONTROL_STATUS"          VARCHAR2(1 BYTE),
    -- Business polja
    "BARCODE"                 VARCHAR2(30 BYTE),
    "BARCODE_TYPE"            VARCHAR2(10 BYTE),
    "BARCODE_PREFIX"          NUMBER(10,0),
    "BARCODE_FORMAT_ID"       VARCHAR2(1 BYTE),
    "PRIMARY_BARCODE_IND"     VARCHAR2(1 BYTE),
    -- Tehnička polja
    "ROW_STATUS"              VARCHAR2(1 BYTE),
    "ROW_STATUS_CODE"         VARCHAR2(3 BYTE),
    "ROW_ERROR_DESCRIPTION"   VARCHAR2(4000 BYTE),
    "ROW_UPDATE_DATETIME"     TIMESTAMP(6),
    "ROW_UPDATE_USER"         VARCHAR2(100 BYTE),
    "ROW_CREATE_DATETIME"     TIMESTAMP(6),
    "ROW_CREATE_USER"         VARCHAR2(100 BYTE),
    CONSTRAINT "PK_CODES_STG" PRIMARY KEY ("ROW_NUMBER"),
    CONSTRAINT "FK_CODES_STG_ROW_NUMBER" FOREIGN KEY ("ROW_NUMBER")
        REFERENCES "SWISSLOG_INT"."PRODUCTS_STG" ("ROW_NUMBER") ENABLE
);
```

---

## 5.3 Config Tablice

### CONFIG_INTERFACE

```sql
CREATE TABLE "SWISSLOG_INT"."CONFIG_INTERFACE" (
    "INTERFACE_CODE"      VARCHAR2(50 BYTE) PRIMARY KEY,
    "INTERFACE_NAME"      VARCHAR2(200 BYTE) NOT NULL,
    "INTERFACE_TYPE"      VARCHAR2(20 BYTE) NOT NULL,
    "SOURCE_TABLE"        VARCHAR2(100 BYTE),
    "TARGET_TABLE"        VARCHAR2(100 BYTE),
    "ENABLED"             VARCHAR2(1 BYTE) DEFAULT 'Y' NOT NULL,
    "POLL_INTERVAL"       NUMBER(10),
    "BATCH_SIZE"          NUMBER(10) DEFAULT 100,
    "RETRY_ATTEMPTS"      NUMBER(2) DEFAULT 3,
    "TRANSFORMATION"      VARCHAR2(200 BYTE),
    "SPLIT_LOGIC"         VARCHAR2(200 BYTE),
    "DESCRIPTION"         VARCHAR2(4000 BYTE),
    "ROW_CREATE_DATETIME" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ROW_CREATE_USER"     VARCHAR2(100 BYTE),
    CONSTRAINT CONFIG_INT_TYPE_CHK CHECK (INTERFACE_TYPE IN ('TRC_STG', 'WEBSERVICE')),
    CONSTRAINT CONFIG_INT_ENABLED_CHK CHECK (ENABLED IN ('Y', 'N'))
);

-- Testni podatci
INSERT INTO SWISSLOG_INT.CONFIG_INTERFACE (
    INTERFACE_CODE, INTERFACE_NAME, INTERFACE_TYPE,
    SOURCE_TABLE, TARGET_TABLE, ENABLED,
    POLL_INTERVAL, BATCH_SIZE, RETRY_ATTEMPTS,
    TRANSFORMATION, DESCRIPTION, ROW_CREATE_USER
) VALUES (
    'RECEIPT_TO_WMS', 'Receipt Integration to WMS', 'TRC_STG',
    'RECEIPT_TRC', 'PRODUCTS_STG', 'Y',
    30, 100, 3,
    'JAVA:DefaultTransformationStrategy',  -- Transformacija u Javi, ne u DB proceduri
    'Integracija prijema robe za WMS sustav',
    'SYSTEM'
);

COMMIT;
```

---

## 5.4 Napomena o Transformaciji i Split Logici

> **VAŽNO:** Transformacija i Split logika se rade **isključivo u Javi**, ne u Oracle procedurama.

### Transformacija (Java)

Transformacija se implementira putem:
- `TransformationService` - glavni servis za transformaciju
- `TransformationStrategy` interface - omogućuje različite strategije za različite izvore
- DTO klase - definiraju format transformiranih podataka

Pogledajte sekciju **3.2 Servisni Sloj** za potpunu implementaciju.

### Split Logika (Java)

Split logika koristi `DEST_UNIT` polje iz TRC tablica:
- `SplitService` - parsira `DEST_UNIT` polje (CSV format)
- `DestinationResolver` - određuje DataSource na temelju ciljnog sustava
- `MultiDataSourceConfig` - konfiguracija više datasource-a

**DEST_UNIT vrijednosti:**
| Vrijednost | Opis |
|------------|------|
| `All` | Slanje na sve registrirane sustave |
| `WMS` | Samo WMS sustav |
| `ORD` | Samo ORDERING sustav |
| `WMS, ORD` | WMS i ORDERING sustavi |
| `SAP, WMS` | SAP i WMS sustavi |

Pogledajte sekciju **3.2 Servisni Sloj** za potpunu implementaciju.

---

## 5.5 Testni Podatci i Monitoring

### Insert Testnih Podataka

```sql
-- Insert u RECEIPT_TRC (master)
INSERT INTO SWISSLOG_INT.RECEIPT_TRC (
    ROW_NUMBER, CONTROL_STATUS, RECEIPT_ID, RECEIPT_DATE,
    SUPPLIER_ID, WAREHOUSE_ID, ROW_STATUS,
    ROW_CREATE_DATETIME, ROW_CREATE_USER
) VALUES (
    SWISSLOG_INT.RECEIPT_TRC_SEQ.NEXTVAL,
    'N', 'RCP0001234', SYSDATE,
    'SUP001', 'WH01', 'N',
    CURRENT_TIMESTAMP, 'TEST_USER'
);

-- Insert u RECEIPT_DETAILS_TRC (detail)
INSERT INTO SWISSLOG_INT.RECEIPT_DETAILS_TRC (
    ROW_NUMBER, CONTROL_STATUS, LINE_NO, ITEM,
    QUANTITY, CONTAINER_ID, LOT_NBR, ROW_STATUS,
    ROW_CREATE_DATETIME, ROW_CREATE_USER
) VALUES (
    SWISSLOG_INT.RECEIPT_TRC_SEQ.CURRVAL,
    'N', 1, 'ITEM001',
    100, 'CONT001', 'LOT2026001', 'N',
    CURRENT_TIMESTAMP, 'TEST_USER'
);

COMMIT;
```

### Monitoring Queries

```sql
-- Broji zapise po ROW_STATUS (TRC tablice)
SELECT ROW_STATUS, COUNT(*) as count
FROM SWISSLOG_INT.RECEIPT_TRC
GROUP BY ROW_STATUS
ORDER BY ROW_STATUS;

-- Zapisi sa greškama
SELECT ROW_NUMBER, RECEIPT_ID, ROW_STATUS, ROW_STATUS_CODE,
       ROW_ERROR_DESCRIPTION, ROW_CREATE_DATETIME
FROM SWISSLOG_INT.RECEIPT_TRC
WHERE ROW_STATUS = 'E'
ORDER BY ROW_CREATE_DATETIME DESC;

-- Zapisi koji dugo čekaju obradu
SELECT ROW_NUMBER, RECEIPT_ID, ROW_STATUS,
       ROUND((SYSDATE - CAST(ROW_CREATE_DATETIME AS DATE)) * 24, 2) as hours_waiting
FROM SWISSLOG_INT.RECEIPT_TRC
WHERE ROW_STATUS = 'N'
AND ROW_CREATE_DATETIME < SYSTIMESTAMP - INTERVAL '1' HOUR;

-- STG tablice - novi zapisi spremni za čitanje
SELECT 'PRODUCTS_STG' as table_name, COUNT(*) as new_count
FROM SWISSLOG_INT.PRODUCTS_STG WHERE ROW_STATUS = 'N'
UNION ALL
SELECT 'CODES_STG', COUNT(*) FROM SWISSLOG_INT.CODES_STG WHERE ROW_STATUS = 'N';

-- Statistika po CONTROL_STATUS
SELECT CONTROL_STATUS,
       DECODE(CONTROL_STATUS, 'N', 'NEW', 'M', 'MODIFIED',
              'D', 'DELETED', 'U', 'UNMODIFIED', CONTROL_STATUS) as status_desc,
       COUNT(*) as count
FROM SWISSLOG_INT.RECEIPT_TRC
GROUP BY CONTROL_STATUS
ORDER BY CONTROL_STATUS;
```

### Grant Permissions

```sql
-- Grants za integration service korisnika
-- NAPOMENA: Oracle packages se ne koriste - transformacija i split su u Javi

GRANT SELECT, INSERT, UPDATE, DELETE ON SWISSLOG_INT.RECEIPT_TRC TO integration_service_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON SWISSLOG_INT.RECEIPT_DETAILS_TRC TO integration_service_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON SWISSLOG_INT.PRODUCTS_STG TO integration_service_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON SWISSLOG_INT.CODES_STG TO integration_service_user;
GRANT SELECT ON SWISSLOG_INT.CONFIG_INTERFACE TO integration_service_user;
GRANT SELECT ON SWISSLOG_INT.RECEIPT_TRC_SEQ TO integration_service_user;
GRANT SELECT ON SWISSLOG_INT.PRODUCTS_STG_SEQ TO integration_service_user;
```

---

# KLJUČNI KONCEPTI

## Tehnička polja (zajednička za TRC i STG)

| Polje | Tip | Opis |
|-------|-----|------|
| **ROW_NUMBER** | NUMBER(19) | Primarni ključ - sekvenca |
| **CONTROL_STATUS** | VARCHAR2(1) | Status kontrole zapisa |
| **ROW_STATUS** | VARCHAR2(1) | Status obrade zapisa |
| **ROW_STATUS_CODE** | VARCHAR2(3) | HTTP status kod |
| **ROW_ERROR_DESCRIPTION** | VARCHAR2(4000) | Opis greške |
| **ROW_CREATE_DATETIME** | TIMESTAMP | Datum i vrijeme kreiranja |
| **ROW_CREATE_USER** | VARCHAR2(100) | Korisnik koji je kreirao |
| **ROW_UPDATE_DATETIME** | TIMESTAMP | Datum i vrijeme ažuriranja |
| **ROW_UPDATE_USER** | VARCHAR2(100) | Korisnik koji je ažurirao |

## CONTROL_STATUS vrijednosti

| Status | Opis |
|--------|------|
| **N** | NEW - Novi zapis |
| **M** | MODIFIED - Izmijenjeni zapis |
| **D** | DELETED - Obrisani zapis |
| **U** | UNMODIFIED - Neizmijenjeni zapis |

## ROW_STATUS vrijednosti

| Status | Opis |
|--------|------|
| **N** | NEW - Novi zapis, čeka obradu |
| **P** | PROCESSED - Uspješno obrađeno |
| **E** | ERROR - Greška u obradi |
| **S** | SKIPPED - Preskočeno (npr. UNMODIFIED zapis) |

## Konvencija imenovanja tablica

| Sufiks | Tip | Primjer | Opis |
|--------|-----|---------|------|
| **_TRC** | Tracing | `RECEIPT_TRC`, `RECEIPT_DETAILS_TRC` | Ulazne tablice - podatci od izvornog sustava |
| **_STG** | Staging | `PRODUCTS_STG`, `CODES_STG` | Izlazne tablice - podatci za ciljni sustav |

## Master-Detail veze

Tablice koriste `ROW_NUMBER` kao primarni i strani ključ:

```
RECEIPT_TRC (Master)
    └── RECEIPT_DETAILS_TRC (Detail) - FK na RECEIPT_TRC.ROW_NUMBER

PRODUCTS_STG (Master)
    └── CODES_STG (Detail) - FK na PRODUCTS_STG.ROW_NUMBER
```

## Transformacija i Split (Java)

Transformacija i split logika se rade **isključivo u Javi**:

1. **Transformacija** - Putem `TransformationService` i DTO klasa
   - Različite strategije za različite izvorne sustave
   - Mapiranje podataka iz TRC formata u format za ciljni sustav

2. **Split logika** - Putem `SplitService` i `DEST_UNIT` polja
   - Parsiranje CSV vrijednosti iz `DEST_UNIT` polja
   - Određivanje ciljnih sustava (WMS, ORD, SAP, itd.)

3. **Multi-datasource routing** - Putem `DestinationResolver`
   - Određivanje datasource-a na temelju ciljnog sustava
   - Upis u STG tablice odgovarajuće baze

## DEST_UNIT Polje

Polje u TRC tablicama koje određuje ciljne sustave (CSV format):

| Vrijednost | Značenje |
|------------|----------|
| `All` | Svi registrirani sustavi |
| `WMS` | Samo WMS |
| `ORD` | Samo ORDERING |
| `WMS, ORD` | WMS i ORDERING |
| `SAP, WMS, ORD` | SAP, WMS i ORDERING |

---

# ZAKLJUČAK

Ovaj dokument opisuje implementaciju i deployment Spring Boot integracijskog sustava na tradicionalnoj infrastrukturi sa Oracle bazom podataka i Apache Tomcat serverima.

**Ključne karakteristike:**

1. **TRC-STG Model** - Asinkrona komunikacija putem baze podataka
2. **REST API** - Sinkrona komunikacija za real-time zahtjeve
3. **Scheduler** - Polling mehanizam za obradu TRC zapisa
4. **Java-only Transformacija** - Transformacija podataka putem DTO-a u Javi
5. **DEST_UNIT Split Logika** - Parsiranje CSV polja za određivanje ciljnih sustava
6. **Multi-Datasource** - Podrška za više datasource-a (WMS, ORD, SAP, itd.)
7. **Tomcat Deployment** - WAR file deployment na production servere
8. **Oracle Database** - Glavna baza podataka (bez stored procedures za transformaciju)
9. **Monitoring** - JMX, Actuator, Health checks
10. **High Availability** - Load balancing, backup/recovery

---

**Verzija dokumenta:** 1.0
**Datum:** Siječanj 2026
**Održavanje:** IT Department
