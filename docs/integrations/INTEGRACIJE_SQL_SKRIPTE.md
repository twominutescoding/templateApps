# SQL Skripte i Database Setup - Integracijski Sustav

## Sadržaj
1. Kreiranje TRC (Tracing) tablica
2. Kreiranje STG (Staging) tablica
3. Kreiranje Config tablica
4. Kreiranje sekvenci i triggera
5. Oracle Package za transformaciju (TAFR)
6. Oracle Package za split logiku
7. Testni podatci

---

## 1. TRC (Tracing) Tablice

### TRC_ORDERS - Primjer Tracing Tablice

```sql
-- Drop ako postoji
DROP TABLE TRC_ORDERS CASCADE CONSTRAINTS;
DROP SEQUENCE TRC_ORDERS_SEQ;

-- Kreiranje sekvence
CREATE SEQUENCE TRC_ORDERS_SEQ
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- Kreiranje tablice
CREATE TABLE TRC_ORDERS (
    ID                  NUMBER(19) PRIMARY KEY,
    ORDER_NUMBER        VARCHAR2(50) NOT NULL,
    CUSTOMER_ID         VARCHAR2(20),
    ORDER_DATA          CLOB,               -- JSON ili XML podatci narudžbe
    SOURCE_SYSTEM       VARCHAR2(50) NOT NULL,
    TARGET_SYSTEMS      VARCHAR2(200),      -- Comma separated lista ciljnih sustava
    STATUS              VARCHAR2(20) DEFAULT 'NEW' NOT NULL,
    ERROR_MESSAGE       VARCHAR2(4000),
    RETRY_COUNT         NUMBER(2) DEFAULT 0,
    CREATE_DATE         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATE_USER         VARCHAR2(100),
    PROCESS_DATE        TIMESTAMP,
    COMPLETE_DATE       TIMESTAMP,
    CONSTRAINT TRC_ORDERS_STATUS_CHK CHECK (STATUS IN ('NEW', 'PROCESSING', 'COMPLETED', 'ERROR', 'RETRY'))
);

-- Indeksi za brže pretraživanje
CREATE INDEX IDX_TRC_ORDERS_STATUS ON TRC_ORDERS(STATUS);
CREATE INDEX IDX_TRC_ORDERS_CREATE ON TRC_ORDERS(CREATE_DATE);
CREATE INDEX IDX_TRC_ORDERS_SOURCE ON TRC_ORDERS(SOURCE_SYSTEM);
CREATE UNIQUE INDEX IDX_TRC_ORDERS_NUMBER ON TRC_ORDERS(ORDER_NUMBER, SOURCE_SYSTEM);

-- Komentari
COMMENT ON TABLE TRC_ORDERS IS 'Tracing tablica za narudžbe - ulazna točka za integraciju';
COMMENT ON COLUMN TRC_ORDERS.ID IS 'Primary key - generirano iz sekvence';
COMMENT ON COLUMN TRC_ORDERS.ORDER_DATA IS 'JSON ili XML podaci narudžbe u izvornom formatu';
COMMENT ON COLUMN TRC_ORDERS.STATUS IS 'Status obrade: NEW, PROCESSING, COMPLETED, ERROR, RETRY';
COMMENT ON COLUMN TRC_ORDERS.TARGET_SYSTEMS IS 'Comma separated lista ciljnih sustava (npr. SYSTEM_A,SYSTEM_B)';

-- Trigger za automatsko popunjavanje ID-a
CREATE OR REPLACE TRIGGER TRC_ORDERS_BIR
BEFORE INSERT ON TRC_ORDERS
FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT TRC_ORDERS_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;

    IF :NEW.CREATE_DATE IS NULL THEN
        :NEW.CREATE_DATE := CURRENT_TIMESTAMP;
    END IF;
END;
/
```

### TRC_INVOICES - Primjer za Fakture

```sql
DROP TABLE TRC_INVOICES CASCADE CONSTRAINTS;
DROP SEQUENCE TRC_INVOICES_SEQ;

CREATE SEQUENCE TRC_INVOICES_SEQ START WITH 1 INCREMENT BY 1;

CREATE TABLE TRC_INVOICES (
    ID                  NUMBER(19) PRIMARY KEY,
    INVOICE_NUMBER      VARCHAR2(50) NOT NULL,
    INVOICE_DATE        DATE NOT NULL,
    CUSTOMER_ID         VARCHAR2(20),
    TOTAL_AMOUNT        NUMBER(15,2),
    INVOICE_DATA        CLOB,               -- JSON podatci fakture
    SOURCE_SYSTEM       VARCHAR2(50) NOT NULL,
    TARGET_SYSTEMS      VARCHAR2(200),
    STATUS              VARCHAR2(20) DEFAULT 'NEW' NOT NULL,
    ERROR_MESSAGE       VARCHAR2(4000),
    RETRY_COUNT         NUMBER(2) DEFAULT 0,
    CREATE_DATE         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATE_USER         VARCHAR2(100),
    PROCESS_DATE        TIMESTAMP,
    COMPLETE_DATE       TIMESTAMP,
    CONSTRAINT TRC_INVOICES_STATUS_CHK CHECK (STATUS IN ('NEW', 'PROCESSING', 'COMPLETED', 'ERROR', 'RETRY'))
);

CREATE INDEX IDX_TRC_INVOICES_STATUS ON TRC_INVOICES(STATUS);
CREATE INDEX IDX_TRC_INVOICES_CREATE ON TRC_INVOICES(CREATE_DATE);
CREATE UNIQUE INDEX IDX_TRC_INVOICES_NUMBER ON TRC_INVOICES(INVOICE_NUMBER, SOURCE_SYSTEM);

CREATE OR REPLACE TRIGGER TRC_INVOICES_BIR
BEFORE INSERT ON TRC_INVOICES
FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT TRC_INVOICES_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
    IF :NEW.CREATE_DATE IS NULL THEN
        :NEW.CREATE_DATE := CURRENT_TIMESTAMP;
    END IF;
END;
/
```

---

## 2. STG (Staging) Tablice

### STG_ORDERS_SYSTEM_A - Staging za Sustav A

```sql
DROP TABLE STG_ORDERS_SYSTEM_A CASCADE CONSTRAINTS;
DROP SEQUENCE STG_ORDERS_SYSTEM_A_SEQ;

CREATE SEQUENCE STG_ORDERS_SYSTEM_A_SEQ START WITH 1 INCREMENT BY 1;

CREATE TABLE STG_ORDERS_SYSTEM_A (
    ID                  NUMBER(19) PRIMARY KEY,
    TRC_ID              NUMBER(19) NOT NULL,
    ORDER_NUMBER        VARCHAR2(50) NOT NULL,
    CUSTOMER_ID         VARCHAR2(20),
    TRANSFORMED_DATA    CLOB,               -- Transformirani podatci za Sustav A
    TARGET_SYSTEM       VARCHAR2(50) DEFAULT 'SYSTEM_A',
    STATUS              VARCHAR2(20) DEFAULT 'READY' NOT NULL,
    PROCESS_STATUS      VARCHAR2(20),       -- Status obrade od strane Sustava A
    ERROR_MESSAGE       VARCHAR2(4000),
    CREATE_DATE         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    READ_DATE           TIMESTAMP,          -- Kada je Sustav A pročitao podatke
    PROCESS_DATE        TIMESTAMP,          -- Kada je Sustav A obradio podatke
    CONSTRAINT STG_ORDERS_SYS_A_STATUS_CHK CHECK (STATUS IN ('READY', 'PROCESSING', 'COMPLETED', 'ERROR')),
    CONSTRAINT STG_ORDERS_SYS_A_TRC_FK FOREIGN KEY (TRC_ID) REFERENCES TRC_ORDERS(ID)
);

CREATE INDEX IDX_STG_ORDERS_SYS_A_STATUS ON STG_ORDERS_SYSTEM_A(STATUS);
CREATE INDEX IDX_STG_ORDERS_SYS_A_TRC ON STG_ORDERS_SYSTEM_A(TRC_ID);
CREATE INDEX IDX_STG_ORDERS_SYS_A_CREATE ON STG_ORDERS_SYSTEM_A(CREATE_DATE);

COMMENT ON TABLE STG_ORDERS_SYSTEM_A IS 'Staging tablica za narudžbe - odredište Sustav A';
COMMENT ON COLUMN STG_ORDERS_SYSTEM_A.TRANSFORMED_DATA IS 'JSON podatci transformirani u format za Sustav A';
COMMENT ON COLUMN STG_ORDERS_SYSTEM_A.STATUS IS 'READY - spremno za čitanje, PROCESSING - u obradi, COMPLETED - obrađeno';

CREATE OR REPLACE TRIGGER STG_ORDERS_SYS_A_BIR
BEFORE INSERT ON STG_ORDERS_SYSTEM_A
FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT STG_ORDERS_SYSTEM_A_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
    IF :NEW.CREATE_DATE IS NULL THEN
        :NEW.CREATE_DATE := CURRENT_TIMESTAMP;
    END IF;
END;
/
```

### STG_ORDERS_SYSTEM_B - Staging za Sustav B

```sql
DROP TABLE STG_ORDERS_SYSTEM_B CASCADE CONSTRAINTS;
DROP SEQUENCE STG_ORDERS_SYSTEM_B_SEQ;

CREATE SEQUENCE STG_ORDERS_SYSTEM_B_SEQ START WITH 1 INCREMENT BY 1;

CREATE TABLE STG_ORDERS_SYSTEM_B (
    ID                  NUMBER(19) PRIMARY KEY,
    TRC_ID              NUMBER(19) NOT NULL,
    ORDER_NUMBER        VARCHAR2(50) NOT NULL,
    CUSTOMER_CODE       VARCHAR2(30),       -- Različito polje od Sustava A
    ORDER_DETAILS       CLOB,               -- Transformirani podatci za Sustav B
    TARGET_SYSTEM       VARCHAR2(50) DEFAULT 'SYSTEM_B',
    STATUS              VARCHAR2(20) DEFAULT 'READY' NOT NULL,
    PROCESS_STATUS      VARCHAR2(20),
    ERROR_MESSAGE       VARCHAR2(4000),
    CREATE_DATE         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    READ_DATE           TIMESTAMP,
    PROCESS_DATE        TIMESTAMP,
    CONSTRAINT STG_ORDERS_SYS_B_STATUS_CHK CHECK (STATUS IN ('READY', 'PROCESSING', 'COMPLETED', 'ERROR')),
    CONSTRAINT STG_ORDERS_SYS_B_TRC_FK FOREIGN KEY (TRC_ID) REFERENCES TRC_ORDERS(ID)
);

CREATE INDEX IDX_STG_ORDERS_SYS_B_STATUS ON STG_ORDERS_SYSTEM_B(STATUS);
CREATE INDEX IDX_STG_ORDERS_SYS_B_TRC ON STG_ORDERS_SYSTEM_B(TRC_ID);

CREATE OR REPLACE TRIGGER STG_ORDERS_SYS_B_BIR
BEFORE INSERT ON STG_ORDERS_SYSTEM_B
FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT STG_ORDERS_SYSTEM_B_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
    IF :NEW.CREATE_DATE IS NULL THEN
        :NEW.CREATE_DATE := CURRENT_TIMESTAMP;
    END IF;
END;
/
```

---

## 3. Config Tablice

### CONFIG_INTERFACE - Konfiguracija Sučelja

```sql
DROP TABLE CONFIG_INTERFACE CASCADE CONSTRAINTS;

CREATE TABLE CONFIG_INTERFACE (
    INTERFACE_CODE      VARCHAR2(50) PRIMARY KEY,
    INTERFACE_NAME      VARCHAR2(200) NOT NULL,
    INTERFACE_TYPE      VARCHAR2(20) NOT NULL,     -- 'TRC_STG' ili 'WEBSERVICE'
    SOURCE_TABLE        VARCHAR2(100),             -- TRC tablica
    TARGET_TABLE        VARCHAR2(100),             -- STG tablica
    ENABLED             CHAR(1) DEFAULT 'Y' NOT NULL,
    POLL_INTERVAL       NUMBER(10),                -- Interval pollinga u sekundama
    BATCH_SIZE          NUMBER(10) DEFAULT 100,
    RETRY_ATTEMPTS      NUMBER(2) DEFAULT 3,
    TRANSFORMATION      VARCHAR2(200),             -- Naziv transformation procedure
    SPLIT_LOGIC         VARCHAR2(200),             -- Naziv split procedure
    DESCRIPTION         VARCHAR2(4000),
    CREATE_DATE         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATE_USER         VARCHAR2(100),
    MODIFY_DATE         TIMESTAMP,
    MODIFY_USER         VARCHAR2(100),
    CONSTRAINT CONFIG_INT_TYPE_CHK CHECK (INTERFACE_TYPE IN ('TRC_STG', 'WEBSERVICE')),
    CONSTRAINT CONFIG_INT_ENABLED_CHK CHECK (ENABLED IN ('Y', 'N'))
);

COMMENT ON TABLE CONFIG_INTERFACE IS 'Konfiguracija integracijskih sučelja';

-- Testni podatci
INSERT INTO CONFIG_INTERFACE (
    INTERFACE_CODE, INTERFACE_NAME, INTERFACE_TYPE,
    SOURCE_TABLE, TARGET_TABLE, ENABLED,
    POLL_INTERVAL, BATCH_SIZE, RETRY_ATTEMPTS,
    TRANSFORMATION, SPLIT_LOGIC, DESCRIPTION
) VALUES (
    'ORD_TO_SYSTEM_A',
    'Orders Integration to System A',
    'TRC_STG',
    'TRC_ORDERS',
    'STG_ORDERS_SYSTEM_A',
    'Y',
    30,
    100,
    3,
    'PKG_TRANSFORM_ORDERS.TRANSFORM_FOR_SYSTEM_A',
    'PKG_SPLIT_ORDERS.DETERMINE_TARGETS',
    'Integracija narudžbi za Sustav A - automatska transformacija i slanje podataka'
);

INSERT INTO CONFIG_INTERFACE (
    INTERFACE_CODE, INTERFACE_NAME, INTERFACE_TYPE,
    SOURCE_TABLE, TARGET_TABLE, ENABLED,
    POLL_INTERVAL, BATCH_SIZE, RETRY_ATTEMPTS,
    TRANSFORMATION, SPLIT_LOGIC, DESCRIPTION
) VALUES (
    'ORD_TO_SYSTEM_B',
    'Orders Integration to System B',
    'TRC_STG',
    'TRC_ORDERS',
    'STG_ORDERS_SYSTEM_B',
    'Y',
    30,
    100,
    3,
    'PKG_TRANSFORM_ORDERS.TRANSFORM_FOR_SYSTEM_B',
    'PKG_SPLIT_ORDERS.DETERMINE_TARGETS',
    'Integracija narudžbi za Sustav B - automatska transformacija i slanje podataka'
);

COMMIT;
```

### CONFIG_TARGET_SYSTEMS - Ciljni Sustavi

```sql
DROP TABLE CONFIG_TARGET_SYSTEMS CASCADE CONSTRAINTS;

CREATE TABLE CONFIG_TARGET_SYSTEMS (
    SYSTEM_CODE         VARCHAR2(50) PRIMARY KEY,
    SYSTEM_NAME         VARCHAR2(200) NOT NULL,
    SYSTEM_TYPE         VARCHAR2(50),              -- 'INTERNAL', 'EXTERNAL'
    STG_TABLE           VARCHAR2(100),             -- Naziv STG tablice
    ENABLED             CHAR(1) DEFAULT 'Y' NOT NULL,
    ENDPOINT_URL        VARCHAR2(500),             -- Opciono - za web servis integracije
    DESCRIPTION         VARCHAR2(4000),
    CREATE_DATE         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT CONFIG_SYS_ENABLED_CHK CHECK (ENABLED IN ('Y', 'N'))
);

-- Testni podatci
INSERT INTO CONFIG_TARGET_SYSTEMS (SYSTEM_CODE, SYSTEM_NAME, SYSTEM_TYPE, STG_TABLE, ENABLED, DESCRIPTION)
VALUES ('SYSTEM_A', 'Internal Business System A', 'INTERNAL', 'STG_ORDERS_SYSTEM_A', 'Y', 'Interni sustav za obradu narudžbi');

INSERT INTO CONFIG_TARGET_SYSTEMS (SYSTEM_CODE, SYSTEM_NAME, SYSTEM_TYPE, STG_TABLE, ENABLED, DESCRIPTION)
VALUES ('SYSTEM_B', 'External Partner System B', 'EXTERNAL', 'STG_ORDERS_SYSTEM_B', 'Y', 'Vanjski sustav poslovnog partnera');

COMMIT;
```

---

## 4. Oracle Package - Transformacija (TAFR)

### PKG_TRANSFORM_ORDERS - Transform and Forward

```sql
CREATE OR REPLACE PACKAGE PKG_TRANSFORM_ORDERS AS
    /*
    Package: PKG_TRANSFORM_ORDERS
    Opis: Transformacija podataka narudžbi za različite ciljne sustave (TAFR - Transform And Forward)
    Autor: IT Department
    Datum: 2026-01-21
    Verzija: 1.0

    Procedura prima TRC_ID, transformira podatke iz TRC tablice u format
    odgovarajući za ciljni sustav i vraća transformirane podatke kao CLOB (JSON).
    */

    -- Transformacija za Sustav A
    /*
    Procedura: TRANSFORM_FOR_SYSTEM_A
    Opis: Transformira narudžbu iz TRC formata u format za Sustav A

    Sustav A očekuje JSON format:
    {
        "orderId": "ORD0001234",
        "customerCode": "CUST001",
        "orderDate": "2026-01-21",
        "items": [
            {"productCode": "PROD001", "quantity": 2, "unitPrice": 150.00}
        ],
        "totalAmount": 300.00
    }

    Parametri:
        p_trc_id IN NUMBER - ID zapisa iz TRC_ORDERS tablice
        p_transformed_data OUT CLOB - Transformirani JSON podatci
        p_status OUT VARCHAR2 - Status: 'SUCCESS' ili 'ERROR: poruka'
    */
    PROCEDURE TRANSFORM_FOR_SYSTEM_A(
        p_trc_id IN NUMBER,
        p_transformed_data OUT CLOB,
        p_status OUT VARCHAR2
    );

    -- Transformacija za Sustav B
    /*
    Procedura: TRANSFORM_FOR_SYSTEM_B
    Opis: Transformira narudžbu iz TRC formata u format za Sustav B

    Sustav B očekuje drugačiji JSON format:
    {
        "orderNumber": "ORD0001234",
        "client": {"id": "CUST001", "name": "Customer Name"},
        "date": "21.01.2026",
        "lineItems": [...],
        "sum": 300.00
    }

    Parametri: isto kao TRANSFORM_FOR_SYSTEM_A
    */
    PROCEDURE TRANSFORM_FOR_SYSTEM_B(
        p_trc_id IN NUMBER,
        p_transformed_data OUT CLOB,
        p_status OUT VARCHAR2
    );

END PKG_TRANSFORM_ORDERS;
/

CREATE OR REPLACE PACKAGE BODY PKG_TRANSFORM_ORDERS AS

    -- Helper funkcija za validaciju JSON-a
    FUNCTION IS_VALID_JSON(p_json CLOB) RETURN BOOLEAN IS
        v_valid BOOLEAN;
    BEGIN
        -- U Oracle 12c+, može se koristiti JSON_TABLE ili IS JSON
        -- Ovdje jednostavna provjera
        IF p_json IS NULL OR LENGTH(p_json) = 0 THEN
            RETURN FALSE;
        END IF;

        RETURN TRUE;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN FALSE;
    END IS_VALID_JSON;

    PROCEDURE TRANSFORM_FOR_SYSTEM_A(
        p_trc_id IN NUMBER,
        p_transformed_data OUT CLOB,
        p_status OUT VARCHAR2
    ) IS
        v_order_data CLOB;
        v_order_number VARCHAR2(50);
        v_customer_id VARCHAR2(20);
        v_source_system VARCHAR2(50);

        v_transformed_json CLOB;
    BEGIN
        -- Dohvati podatke iz TRC tablice
        SELECT order_number, customer_id, order_data, source_system
        INTO v_order_number, v_customer_id, v_order_data, v_source_system
        FROM TRC_ORDERS
        WHERE id = p_trc_id
        AND status = 'PROCESSING';

        -- Validacija ulaznih podataka
        IF NOT IS_VALID_JSON(v_order_data) THEN
            p_status := 'ERROR: Invalid JSON in source data';
            RETURN;
        END IF;

        /*
        TRANSFORMACIJA LOGIKA

        Ovdje ide business logika za transformaciju podataka:
        - Parsiranje JSON-a iz TRC tablice
        - Mapiranje polja prema specifikaciji Sustava A
        - Obrada specijalnih slučajeva
        - Validacija transformiranih podataka
        - Kreiranje JSON-a za Sustav A

        Primjer (pojednostavljeno):
        */

        -- Kreiraj JSON za Sustav A koristeći JSON_OBJECT (Oracle 12c+)
        SELECT JSON_OBJECT(
            'orderId' VALUE v_order_number,
            'customerCode' VALUE v_customer_id,
            'orderDate' VALUE TO_CHAR(SYSDATE, 'YYYY-MM-DD'),
            'sourceSystem' VALUE v_source_system,
            'totalAmount' VALUE 0,  -- Izračunaj iz order_data
            'status' VALUE 'NEW'
        )
        INTO v_transformed_json
        FROM DUAL;

        -- Postavi izlazne parametre
        p_transformed_data := v_transformed_json;
        p_status := 'SUCCESS';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_status := 'ERROR: TRC record not found or not in PROCESSING status';
            p_transformed_data := NULL;
        WHEN OTHERS THEN
            p_status := 'ERROR: ' || SQLERRM;
            p_transformed_data := NULL;
    END TRANSFORM_FOR_SYSTEM_A;

    PROCEDURE TRANSFORM_FOR_SYSTEM_B(
        p_trc_id IN NUMBER,
        p_transformed_data OUT CLOB,
        p_status OUT VARCHAR2
    ) IS
        v_order_data CLOB;
        v_order_number VARCHAR2(50);
        v_customer_id VARCHAR2(20);
        v_transformed_json CLOB;
    BEGIN
        -- Dohvati podatke
        SELECT order_number, customer_id, order_data
        INTO v_order_number, v_customer_id, v_order_data
        FROM TRC_ORDERS
        WHERE id = p_trc_id
        AND status = 'PROCESSING';

        -- Validacija
        IF NOT IS_VALID_JSON(v_order_data) THEN
            p_status := 'ERROR: Invalid JSON in source data';
            RETURN;
        END IF;

        /*
        TRANSFORMACIJA ZA SUSTAV B

        Sustav B ima drugačiji format od Sustava A:
        - Drugačija imena polja
        - Drugačiji format datuma
        - Dodatna polja
        */

        SELECT JSON_OBJECT(
            'orderNumber' VALUE v_order_number,
            'clientId' VALUE v_customer_id,
            'date' VALUE TO_CHAR(SYSDATE, 'DD.MM.YYYY'),  -- Različiti format datuma
            'status' VALUE 'PENDING'
        )
        INTO v_transformed_json
        FROM DUAL;

        p_transformed_data := v_transformed_json;
        p_status := 'SUCCESS';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_status := 'ERROR: TRC record not found or not in PROCESSING status';
            p_transformed_data := NULL;
        WHEN OTHERS THEN
            p_status := 'ERROR: ' || SQLERRM;
            p_transformed_data := NULL;
    END TRANSFORM_FOR_SYSTEM_B;

END PKG_TRANSFORM_ORDERS;
/
```

---

## 5. Oracle Package - Split Logika

### PKG_SPLIT_ORDERS - Određivanje Ciljnih Sustava

```sql
CREATE OR REPLACE PACKAGE PKG_SPLIT_ORDERS AS
    /*
    Package: PKG_SPLIT_ORDERS
    Opis: Logika za određivanje ciljnih sustava na temelju business pravila
    Autor: IT Department
    Datum: 2026-01-21
    Verzija: 1.0

    Package određuje na koje ciljne sustave treba poslati podatke
    iz TRC tablice na temelju business logike.
    */

    -- Type za array stringova
    TYPE t_string_array IS TABLE OF VARCHAR2(50);

    /*
    Procedura: DETERMINE_TARGETS
    Opis: Određuje ciljne sustave za narudžbu

    Business pravila:
    - Ako je customer_id počinje sa "INT", šalje se samo na SYSTEM_A (interni)
    - Ako je customer_id počinje sa "EXT", šalje se samo na SYSTEM_B (vanjski)
    - Ako je total_amount > 10000, šalje se na oba sustava
    - Ako je source_system = "LEGACY", šalje se na oba sustava

    Parametri:
        p_trc_id IN NUMBER - ID zapisa iz TRC_ORDERS
        p_target_systems OUT t_string_array - Array ciljnih sustava
    */
    PROCEDURE DETERMINE_TARGETS(
        p_trc_id IN NUMBER,
        p_target_systems OUT t_string_array
    );

END PKG_SPLIT_ORDERS;
/

CREATE OR REPLACE PACKAGE BODY PKG_SPLIT_ORDERS AS

    PROCEDURE DETERMINE_TARGETS(
        p_trc_id IN NUMBER,
        p_target_systems OUT t_string_array
    ) IS
        v_customer_id VARCHAR2(20);
        v_source_system VARCHAR2(50);
        v_order_data CLOB;
        v_total_amount NUMBER;

        v_targets t_string_array := t_string_array();
    BEGIN
        -- Dohvati podatke iz TRC tablice
        SELECT customer_id, source_system, order_data
        INTO v_customer_id, v_source_system, v_order_data
        FROM TRC_ORDERS
        WHERE id = p_trc_id;

        -- Izvuci total_amount iz JSON-a (pojednostavljeno)
        -- U realnom scenariju, parsirati JSON i izvući vrijednost
        v_total_amount := 0;  -- Placeholder

        /*
        BUSINESS PRAVILA ZA SPLIT
        */

        -- Pravilo 1: Legacy sustav -> oba sustava
        IF v_source_system = 'LEGACY_SYSTEM' THEN
            v_targets.EXTEND;
            v_targets(v_targets.COUNT) := 'SYSTEM_A';
            v_targets.EXTEND;
            v_targets(v_targets.COUNT) := 'SYSTEM_B';

        -- Pravilo 2: Interni kupci -> samo SYSTEM_A
        ELSIF v_customer_id LIKE 'INT%' THEN
            v_targets.EXTEND;
            v_targets(v_targets.COUNT) := 'SYSTEM_A';

        -- Pravilo 3: Vanjski kupci -> samo SYSTEM_B
        ELSIF v_customer_id LIKE 'EXT%' THEN
            v_targets.EXTEND;
            v_targets(v_targets.COUNT) := 'SYSTEM_B';

        -- Pravilo 4: Velike narudžbe -> oba sustava
        ELSIF v_total_amount > 10000 THEN
            v_targets.EXTEND;
            v_targets(v_targets.COUNT) := 'SYSTEM_A';
            v_targets.EXTEND;
            v_targets(v_targets.COUNT) := 'SYSTEM_B';

        -- Default: samo SYSTEM_A
        ELSE
            v_targets.EXTEND;
            v_targets(v_targets.COUNT) := 'SYSTEM_A';
        END IF;

        -- Postavi izlazni parametar
        p_target_systems := v_targets;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            -- Ako TRC zapis ne postoji, vrati prazan array
            p_target_systems := t_string_array();
        WHEN OTHERS THEN
            -- U slučaju greške, vrati prazan array
            p_target_systems := t_string_array();
            RAISE;
    END DETERMINE_TARGETS;

END PKG_SPLIT_ORDERS;
/
```

---

## 6. Testni Podatci

### Insert Testnih Podataka u TRC Tablicu

```sql
-- Test 1: Jednostavna narudžba za SYSTEM_A
INSERT INTO TRC_ORDERS (
    ORDER_NUMBER, CUSTOMER_ID, SOURCE_SYSTEM, TARGET_SYSTEMS, STATUS,
    ORDER_DATA, CREATE_USER
) VALUES (
    'ORD0001234',
    'INT_CUST001',
    'EXTERNAL_API',
    'SYSTEM_A',
    'NEW',
    '{
        "orderNumber": "ORD0001234",
        "customerId": "INT_CUST001",
        "orderDate": "2026-01-21",
        "items": [
            {"productId": "PROD001", "quantity": 2, "price": 150.00},
            {"productId": "PROD002", "quantity": 1, "price": 200.00}
        ],
        "totalAmount": 500.00
    }',
    'TEST_USER'
);

-- Test 2: Narudžba za oba sustava (legacy)
INSERT INTO TRC_ORDERS (
    ORDER_NUMBER, CUSTOMER_ID, SOURCE_SYSTEM, TARGET_SYSTEMS, STATUS,
    ORDER_DATA, CREATE_USER
) VALUES (
    'ORD0001235',
    'CUST002',
    'LEGACY_SYSTEM',
    'SYSTEM_A,SYSTEM_B',
    'NEW',
    '{
        "orderNumber": "ORD0001235",
        "customerId": "CUST002",
        "orderDate": "2026-01-21",
        "items": [
            {"productId": "PROD003", "quantity": 5, "price": 100.00}
        ],
        "totalAmount": 500.00
    }',
    'LEGACY_USER'
);

-- Test 3: Vanjski kupac - samo SYSTEM_B
INSERT INTO TRC_ORDERS (
    ORDER_NUMBER, CUSTOMER_ID, SOURCE_SYSTEM, TARGET_SYSTEMS, STATUS,
    ORDER_DATA, CREATE_USER
) VALUES (
    'ORD0001236',
    'EXT_PARTNER_123',
    'PARTNER_PORTAL',
    'SYSTEM_B',
    'NEW',
    '{
        "orderNumber": "ORD0001236",
        "customerId": "EXT_PARTNER_123",
        "orderDate": "2026-01-21",
        "items": [
            {"productId": "PROD004", "quantity": 10, "price": 50.00}
        ],
        "totalAmount": 500.00
    }',
    'PARTNER_USER'
);

COMMIT;

-- Provjeri unos
SELECT id, order_number, customer_id, source_system, target_systems, status, create_date
FROM TRC_ORDERS
ORDER BY create_date DESC;
```

### Query za Monitoring

```sql
-- 1. Broji zapise po statusu
SELECT status, COUNT(*) as count
FROM TRC_ORDERS
GROUP BY status
ORDER BY status;

-- 2. Zapisi sa greškama
SELECT id, order_number, status, error_message, retry_count, create_date
FROM TRC_ORDERS
WHERE status = 'ERROR'
ORDER BY create_date DESC;

-- 3. Zapisi koji dugo čekaju obradu
SELECT id, order_number, status,
       ROUND((SYSDATE - create_date) * 24, 2) as hours_waiting
FROM TRC_ORDERS
WHERE status IN ('NEW', 'PROCESSING')
AND create_date < SYSDATE - INTERVAL '1' HOUR
ORDER BY create_date;

-- 4. Statistika po sustavu izvora
SELECT source_system,
       COUNT(*) as total,
       SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
       SUM(CASE WHEN status = 'ERROR' THEN 1 ELSE 0 END) as errors
FROM TRC_ORDERS
WHERE create_date >= TRUNC(SYSDATE)
GROUP BY source_system;

-- 5. Staging tablice - spremni zapisi
SELECT 'SYSTEM_A' as system, COUNT(*) as ready_count
FROM STG_ORDERS_SYSTEM_A
WHERE status = 'READY'
UNION ALL
SELECT 'SYSTEM_B' as system, COUNT(*) as ready_count
FROM STG_ORDERS_SYSTEM_B
WHERE status = 'READY';
```

---

## 7. Cleanup i Maintenance Skripte

### Archive i Delete Stare Zapise

```sql
-- Arhiviraj stare COMPLETED zapise (starije od 90 dana)
CREATE TABLE TRC_ORDERS_ARCHIVE AS
SELECT * FROM TRC_ORDERS WHERE 1=0;

-- Arhiviranje procedure
CREATE OR REPLACE PROCEDURE ARCHIVE_OLD_TRC_ORDERS(
    p_days_old IN NUMBER DEFAULT 90
) IS
    v_cutoff_date DATE;
    v_archived_count NUMBER := 0;
BEGIN
    v_cutoff_date := SYSDATE - p_days_old;

    -- Arhiviraj
    INSERT INTO TRC_ORDERS_ARCHIVE
    SELECT * FROM TRC_ORDERS
    WHERE status = 'COMPLETED'
    AND complete_date < v_cutoff_date;

    v_archived_count := SQL%ROWCOUNT;

    -- Briši iz glavne tablice
    DELETE FROM TRC_ORDERS
    WHERE status = 'COMPLETED'
    AND complete_date < v_cutoff_date;

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('Archived and deleted ' || v_archived_count || ' records');

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Pokretanje
BEGIN
    ARCHIVE_OLD_TRC_ORDERS(90);  -- Arhiviraj zapise starije od 90 dana
END;
/
```

### Reset ERROR Zapisa za Retry

```sql
-- Reset ERROR zapisa na RETRY status za ponovni pokušaj
UPDATE TRC_ORDERS
SET status = 'RETRY',
    error_message = error_message || ' [MANUAL RETRY]',
    retry_count = 0
WHERE status = 'ERROR'
AND id IN (
    -- Specifični ID-evi koje želite resetirati
    SELECT id FROM TRC_ORDERS WHERE status = 'ERROR' AND error_message LIKE '%timeout%'
);

COMMIT;
```

---

## GRANT Permissions

```sql
-- Grant permissions za integration service korisnika
GRANT SELECT, INSERT, UPDATE, DELETE ON TRC_ORDERS TO integration_service_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TRC_INVOICES TO integration_service_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON STG_ORDERS_SYSTEM_A TO integration_service_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON STG_ORDERS_SYSTEM_B TO integration_service_user;
GRANT SELECT ON CONFIG_INTERFACE TO integration_service_user;
GRANT SELECT ON CONFIG_TARGET_SYSTEMS TO integration_service_user;
GRANT EXECUTE ON PKG_TRANSFORM_ORDERS TO integration_service_user;
GRANT EXECUTE ON PKG_SPLIT_ORDERS TO integration_service_user;

-- Grant za sekvence
GRANT SELECT ON TRC_ORDERS_SEQ TO integration_service_user;
GRANT SELECT ON STG_ORDERS_SYSTEM_A_SEQ TO integration_service_user;
GRANT SELECT ON STG_ORDERS_SYSTEM_B_SEQ TO integration_service_user;
```

---

**Verzija:** 1.0
**Datum:** Siječanj 2026
**Održavanje:** IT Department
