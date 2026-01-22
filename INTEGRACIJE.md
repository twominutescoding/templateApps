# Dokumentacija - Integracijska Arhitektura Spring Boot Sustava

## Verzija: 1.0
## Datum: Siječanj 2026

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
- Biti cloud-native spremni (Kubernetes, Docker)

---

## 1.2 Tehnološki Okvir

### Backend Stack

| Komponenta | Tehnologija | Verzija | Opis |
|------------|-------------|---------|------|
| **Framework** | Spring Boot | 3.4.0+ / 4.0.1 | Glavni backend framework |
| **Programski jezik** | Java | 17+ / 25 | |
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
- **CI/CD**: Jenkins / GitLab CI (opciono)

### Napredne Opcije (Za Budućnost)

- **Kontejnerizacija**: Docker (opciono)
- **Orkestracija**: Kubernetes (opciono)
- **Cloud**: AWS/Azure/GCP (opciono)

---

# 2. PREGLED SUSTAVA

## 2.1 Vrste Sučelja

### 2.1.1 Web Servisi (REST API)

**Karakteristike:**
- Sinkrona komunikacija
- Request-Response model
- JSON format
- HTTP protokol (HTTPS u produkciji)

**Use Case Primjer:**

```
[Klijentska Aplikacija]
    ↓ HTTP POST /api/orders
[Spring Boot REST Controller]
    ↓ Validacija
[Service Layer]
    ↓ Business Logic
[Repository Layer]
    ↓ SQL INSERT
[Oracle Database]
```

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

**Use Case Primjer:**

```
[Legacy Sustav]
    ↓ INSERT INTO TRC_ORDERS
[TRC_ORDERS tablica] (status = 'NEW')
    ↓ Polling (Scheduled Job)
[Spring Boot Scheduler] (svakih 30s)
    ↓ SELECT * WHERE status='NEW'
    ↓ UPDATE status='PROCESSING'
[Service Layer]
    ↓ Transformacija podataka
    ↓ Business rules
    ↓ Split logika (ako potrebno)
[Database Procedure SPLIT & TAFR]
    ↓ INSERT INTO STG_ORDERS_SYSTEM_A
    ↓ INSERT INTO STG_ORDERS_SYSTEM_B
[STG tablice] (status = 'READY')
    ↓ UPDATE TRC status='COMPLETED'
[Ciljni sustavi čitaju STG tablice]
```

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
                │   TRC_* tablice        │
                │   (Tracing tables)     │
                │   - TRC_ORDERS         │
                │   - TRC_INVOICES       │
                │   - status: NEW        │
                └────────┬───────────────┘
                         │
                         ↓ POLLING (Scheduled)
        ┌────────────────────────────────────────┐
        │  SPRING BOOT INTEGRATION SERVICE       │
        │  ┌──────────────────────────────────┐  │
        │  │  @Scheduled Polling Service      │  │
        │  │  - Čita TRC tablice              │  │
        │  │  - Postavlja status=PROCESSING   │  │
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
        │  │  - Određivanje ciljnih sustava   │  │
        │  │  - Distribuiranje poruka         │  │
        │  │  - DB Procedure (SPLIT & TAFR)   │  │
        │  └──────────────┬───────────────────┘  │
        │                 ↓                       │
        │  ┌──────────────────────────────────┐  │
        │  │  Staging Service                 │  │
        │  │  - Upis u STG tablice            │  │
        │  │  - Update TRC status=COMPLETED   │  │
        │  └──────────────────────────────────┘  │
        └────────────┬───────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        │                           │
        ↓                           ↓
┌───────────────┐          ┌───────────────┐
│ STG_* tablica │          │ STG_* tablica │
│ Sustav A      │          │ Sustav B      │
│ status: READY │          │ status: READY │
└───────┬───────┘          └───────┬───────┘
        │                          │
        ↓                          ↓
┌───────────────┐          ┌───────────────┐
│  Ciljni       │          │  Ciljni       │
│  Sustav A     │          │  Sustav B     │
└───────────────┘          └───────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     WEB SERVICE INTEGRACIJE                          │
└─────────────────────────────────────────────────────────────────────┘

[Vanjski sustav]
    ↓ HTTP POST /api/v1/orders
[Spring Boot REST Controller]
    ↓
[Service Layer] → [Database] → [Response]
    ↓
[Vanjski sustav prima JSON response]
```

### Komponente Arhitekture

1. **TRC (Tracing) tablice** - Ulazne tablice za asinkronu komunikaciju
2. **Spring Boot Scheduler** - Polling mehanizam za čitanje TRC tablica
3. **Transformation Service** - Transformacija podataka
4. **Split Service** - Distribucija podataka na više sustava
5. **Database Procedures** - SPLIT & TAFR (Transform and Forward) logika
6. **STG (Staging) tablice** - Izlazne tablice za ciljne sustave
7. **REST Controllers** - Sinkrona komunikacija
8. **Configuration Database** - Konfiguracija sučelja i pravila

---

## 2.3 Komponente i Njihova Uloga

### 2.3.1 Baza Podataka (Oracle)

**TRC Tablice - Struktura**

```sql
CREATE TABLE TRC_ORDERS (
    ID                NUMBER PRIMARY KEY,
    ORDER_NUMBER      VARCHAR2(50) NOT NULL,
    CUSTOMER_ID       VARCHAR2(20),
    ORDER_DATA        CLOB, -- JSON ili XML
    SOURCE_SYSTEM     VARCHAR2(50),
    TARGET_SYSTEMS    VARCHAR2(200), -- Comma separated lista
    STATUS            VARCHAR2(20) DEFAULT 'NEW',
    ERROR_MESSAGE     VARCHAR2(4000),
    RETRY_COUNT       NUMBER DEFAULT 0,
    CREATE_DATE       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PROCESS_DATE      TIMESTAMP,
    COMPLETE_DATE     TIMESTAMP
);

-- Status vrijednosti: NEW, PROCESSING, COMPLETED, ERROR, RETRY
```

**STG Tablice - Struktura**

```sql
CREATE TABLE STG_ORDERS_SYSTEM_A (
    ID                NUMBER PRIMARY KEY,
    TRC_ID            NUMBER REFERENCES TRC_ORDERS(ID),
    ORDER_NUMBER      VARCHAR2(50) NOT NULL,
    CUSTOMER_ID       VARCHAR2(20),
    TRANSFORMED_DATA  CLOB, -- Transformirani podatci za Sustav A
    STATUS            VARCHAR2(20) DEFAULT 'READY',
    PROCESS_STATUS    VARCHAR2(20),
    ERROR_MESSAGE     VARCHAR2(4000),
    CREATE_DATE       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    READ_DATE         TIMESTAMP,
    PROCESS_DATE      TIMESTAMP
);

-- Status vrijednosti: READY, PROCESSING, COMPLETED, ERROR
```

**Konfiguracija Sučelja**

```sql
CREATE TABLE CONFIG_INTERFACE (
    INTERFACE_CODE    VARCHAR2(50) PRIMARY KEY,
    INTERFACE_NAME    VARCHAR2(200),
    INTERFACE_TYPE    VARCHAR2(20), -- 'TRC_STG' ili 'WEBSERVICE'
    SOURCE_TABLE      VARCHAR2(100),
    TARGET_TABLE      VARCHAR2(100),
    ENABLED           CHAR(1) DEFAULT 'Y',
    POLL_INTERVAL     NUMBER, -- u sekundama
    BATCH_SIZE        NUMBER DEFAULT 100,
    RETRY_ATTEMPTS    NUMBER DEFAULT 3,
    TRANSFORMATION    VARCHAR2(200), -- Naziv transformation procedure
    SPLIT_LOGIC       VARCHAR2(200), -- Naziv split procedure
    DESCRIPTION       VARCHAR2(4000),
    CREATE_DATE       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3.2 Spring Boot Aplikacija

**Struktura Projekta**

```
auth-service/
business-app-backend/
integration-service/          ← NOVI PROJEKT ZA INTEGRACIJE
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

**1. TRC-STG Obrada**

```java
@Transactional
public void processTrcRecord(TrcOrder trcOrder) {
    try {
        // 1. Postavi status na PROCESSING
        trcOrder.setStatus(TrcStatus.PROCESSING);
        trcOrder.setProcessDate(new Date());
        trcOrdersRepository.save(trcOrder);

        // 2. Transformacija
        TransformationResultDTO result = transformationService.transform(trcOrder);

        // 3. Split logika
        List<String> targetSystems = splitService.determineTargets(trcOrder);

        // 4. Upis u STG tablice
        for (String system : targetSystems) {
            stagingService.writeToStaging(result, system);
        }

        // 5. Uspješno - postavi status COMPLETED
        trcOrder.setStatus(TrcStatus.COMPLETED);
        trcOrder.setCompleteDate(new Date());
        trcOrdersRepository.save(trcOrder);

        log.info("Successfully processed TRC record ID: {}", trcOrder.getId());

    } catch (TransformationException e) {
        handleTransformationError(trcOrder, e);
    } catch (Exception e) {
        handleGeneralError(trcOrder, e);
    }
}

private void handleTransformationError(TrcOrder trcOrder, TransformationException e) {
    trcOrder.setRetryCount(trcOrder.getRetryCount() + 1);

    if (trcOrder.getRetryCount() >= maxRetryAttempts) {
        trcOrder.setStatus(TrcStatus.ERROR);
        trcOrder.setErrorMessage("Max retry attempts reached: " + e.getMessage());
        log.error("TRC record {} moved to ERROR after {} attempts",
                  trcOrder.getId(), maxRetryAttempts);
    } else {
        trcOrder.setStatus(TrcStatus.RETRY);
        trcOrder.setErrorMessage(e.getMessage());
        log.warn("TRC record {} marked for RETRY (attempt {})",
                 trcOrder.getId(), trcOrder.getRetryCount());
    }

    trcOrdersRepository.save(trcOrder);
}
```

**2. REST API Error Handling**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            "NOT_FOUND",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        ErrorResponse error = new ErrorResponse(
            "VALIDATION_ERROR",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_ERROR",
            "An unexpected error occurred",
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
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
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Log file configuration
logging.file.name=logs/integration-service.log
logging.file.max-size=10MB
logging.file.max-history=30
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %logger{36} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

**Log Levels**

| Level | Upotreba |
|-------|----------|
| **ERROR** | Kritične greške koje zahtijevaju intervenciju |
| **WARN** | Potencijalni problemi, retry pokušaji |
| **INFO** | Normalan tijek programa (start, stop, processed records) |
| **DEBUG** | Detalji o procesima (DEV/TEST) |
| **TRACE** | SQL upiti, detaljni podatci (samo DEV) |

**Primjeri Logiranja**

```java
@Service
@Slf4j
public class TrcPollingService {

    @Scheduled(fixedDelayString = "${integration.polling.interval}")
    public void pollTrcTables() {
        log.info("Starting TRC polling cycle");

        List<TrcOrder> newRecords = trcOrdersRepository.findByStatus(TrcStatus.NEW);
        log.info("Found {} new records to process", newRecords.size());

        for (TrcOrder record : newRecords) {
            try {
                log.debug("Processing TRC record: ID={}, OrderNumber={}",
                          record.getId(), record.getOrderNumber());
                processRecord(record);
                log.info("Successfully processed TRC ID: {}", record.getId());
            } catch (Exception e) {
                log.error("Failed to process TRC ID: {}. Error: {}",
                          record.getId(), e.getMessage(), e);
            }
        }

        log.info("TRC polling cycle completed. Processed: {}", newRecords.size());
    }
}
```

### Monitoring i Alarmiranje

**Health Check Endpoint**

```java
@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @Autowired
    private TrcOrdersRepository trcRepository;

    @GetMapping("/status")
    public ResponseEntity<HealthStatus> getHealthStatus() {
        HealthStatus status = new HealthStatus();

        // Provjeri broj ERROR zapisa
        long errorCount = trcRepository.countByStatus(TrcStatus.ERROR);
        status.setErrorRecords(errorCount);

        // Provjeri broj zapisa u obradi
        long processingCount = trcRepository.countByStatus(TrcStatus.PROCESSING);
        status.setProcessingRecords(processingCount);

        // Provjeri broj zapisa koji čekaju obradu
        long pendingCount = trcRepository.countByStatus(TrcStatus.NEW);
        status.setPendingRecords(pendingCount);

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
INSERT INTO CONFIG_INTERFACE VALUES (
    'ORD_TO_SYSTEM_A',
    'Orders Integration to System A',
    'TRC_STG',
    'TRC_ORDERS',
    'STG_ORDERS_SYSTEM_A',
    'Y', -- enabled
    30,  -- poll every 30 seconds
    100, -- batch size
    3,   -- retry attempts
    'PKG_TRANSFORM_ORDERS.TRANSFORM_FOR_SYSTEM_A',
    'PKG_SPLIT_ORDERS.DETERMINE_TARGETS',
    'Integration for order synchronization',
    SYSDATE
);
```

**Spring Boot - Reading Configuration**

```java
@Entity
@Table(name = "CONFIG_INTERFACE")
public class ConfigInterface {

    @Id
    @Column(name = "INTERFACE_CODE")
    private String interfaceCode;

    @Column(name = "INTERFACE_NAME")
    private String interfaceName;

    @Column(name = "INTERFACE_TYPE")
    private String interfaceType;

    @Column(name = "SOURCE_TABLE")
    private String sourceTable;

    @Column(name = "TARGET_TABLE")
    private String targetTable;

    @Column(name = "ENABLED")
    private String enabled;

    @Column(name = "POLL_INTERVAL")
    private Integer pollInterval;

    @Column(name = "BATCH_SIZE")
    private Integer batchSize;

    @Column(name = "RETRY_ATTEMPTS")
    private Integer retryAttempts;

    @Column(name = "TRANSFORMATION")
    private String transformation;

    @Column(name = "SPLIT_LOGIC")
    private String splitLogic;

    // getters/setters
}

@Service
public class ConfigurationService {

    @Autowired
    private ConfigInterfaceRepository configRepository;

    @Cacheable("interfaceConfigs")
    public ConfigInterface getConfig(String interfaceCode) {
        return configRepository.findById(interfaceCode)
            .orElseThrow(() -> new ConfigNotFoundException(interfaceCode));
    }

    public boolean isInterfaceEnabled(String interfaceCode) {
        ConfigInterface config = getConfig(interfaceCode);
        return "Y".equals(config.getEnabled());
    }
}
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

# Logging
logging.level.root=INFO
logging.level.com.template.integration=INFO
```

---

## 2.6 Raspored Izvođenja (Scheduling)

### Spring Boot Scheduler Configuration

**Enable Scheduling**

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

**Fixed Delay Strategy**

```java
@Service
@Slf4j
public class IntegrationScheduler {

    @Autowired
    private TrcPollingService trcPollingService;

    @Autowired
    private ConfigurationService configurationService;

    /**
     * Poll TRC_ORDERS table every 30 seconds
     */
    @Scheduled(fixedDelayString = "${integration.polling.interval:30000}")
    public void pollTrcOrders() {
        if (!configurationService.isInterfaceEnabled("ORD_TO_SYSTEM_A")) {
            log.debug("Interface ORD_TO_SYSTEM_A is disabled, skipping");
            return;
        }

        log.info("Starting TRC_ORDERS polling");
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

*Nastavlja se u sljedećem dijelu dokumentacije...*
