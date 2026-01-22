# Dokumentacija - Integracijska Arhitektura Spring Boot Sustava (DIO 3) - AŽURIRANO

## Nastavak...

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
| **Config** | `<Topic>Config` | `DatabaseConfig` |

### 4.1.3 Imenovanje Metoda

```java
// Repository metode
findBy<Property>                    // findByStatus
findBy<Property>And<Property>       // findByStatusAndSourceSystem
countBy<Property>                   // countByStatus
deleteBy<Property>                  // deleteByStatus

// Service metode
get<Resource>                       // getOrderStatus
create<Resource>                    // createOrder
update<Resource>                    // updateOrder
delete<Resource>                    // deleteOrder
process<Action>                     // processOrder
transform<Resource>                 // transformOrder
```

### 4.1.4 Imenovanje Tablica i Kolona

**Tablice:**
- `TRC_<ENTITY>` - Tracing tablice (npr. `TRC_ORDERS`, `TRC_INVOICES`)
- `STG_<ENTITY>_<SYSTEM>` - Staging tablice (npr. `STG_ORDERS_SYSTEM_A`)
- `CONFIG_<TYPE>` - Konfiguracijske tablice

**Kolone:**
- UPPERCASE s underscore: `ORDER_NUMBER`, `CREATE_DATE`
- Primary key: `ID`
- Foreign key: `<TABLE>_ID` (npr. `TRC_ID`)
- Status kolone: `STATUS`, `PROCESS_STATUS`
- Datumi: `CREATE_DATE`, `PROCESS_DATE`, `COMPLETE_DATE`

### 4.1.5 Struktura SQL Procedura

```sql
CREATE OR REPLACE PACKAGE PKG_TRANSFORM_ORDERS AS
    /*
    Package: PKG_TRANSFORM_ORDERS
    Opis: Transformacija podataka narudžbi za različite sustave
    Autor: [Ime]
    Datum: [Datum]
    */

    -- TAFR (Transform and Forward) procedura za Sustav A
    /*
    Procedura: TRANSFORM_FOR_SYSTEM_A
    Opis: Transformira podatke iz TRC_ORDERS formata u format za System A
    Parametri:
        p_trc_id IN NUMBER - ID TRC zapisa
        p_transformed_data OUT CLOB - Transformirani JSON podatci
        p_status OUT VARCHAR2 - Status: SUCCESS ili ERROR
    */
    PROCEDURE TRANSFORM_FOR_SYSTEM_A(
        p_trc_id IN NUMBER,
        p_transformed_data OUT CLOB,
        p_status OUT VARCHAR2
    );

END PKG_TRANSFORM_ORDERS;
/
```

**NAPOMENA:** Opis paketa i procedura **NE IDE** u dokumentaciju (.doc), već u sam kod paketa kao komentar!

---

## 4.2 Okoline (DEV/TEST, PROD)

### 4.2.1 Spring Profiles

#### application.properties (default)

```properties
# Application
spring.application.name=integration-service
server.port=8092

# Default profile
spring.profiles.active=dev

# Common properties
spring.jpa.open-in-view=false
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.time-zone=Europe/Zagreb
```

#### application-dev.properties

```properties
# Development Environment

# H2 In-Memory Database
spring.datasource.url=jdbc:h2:mem:integrationdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Integration settings
integration.polling.interval=60000
integration.batch.size=10
integration.retry.max-attempts=3

# Logging
logging.level.root=INFO
logging.level.com.template.integration=DEBUG
logging.level.org.springframework.jdbc.core=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

#### application-test.properties

```properties
# Test Environment

# Oracle Database (Test)
spring.datasource.url=jdbc:oracle:thin:@test-db-server:1521:TESTDB
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# Connection pool
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.database-platform=org.hibernate.dialect.Oracle12cDialect
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Integration settings
integration.polling.interval=30000
integration.batch.size=50
integration.retry.max-attempts=3

# Logging
logging.level.root=INFO
logging.level.com.template.integration=DEBUG
logging.file.name=logs/integration-service-test.log
```

#### application-prod.properties

```properties
# Production Environment

# Oracle Database (Production)
spring.datasource.url=jdbc:oracle:thin:@prod-db-server:1521:PRODDB
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# Connection pool - production settings
spring.datasource.hikari.maximum-pool-size=50
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.database-platform=org.hibernate.dialect.Oracle12cDialect
spring.jpa.show-sql=false

# Integration settings
integration.polling.interval=30000
integration.batch.size=500
integration.retry.max-attempts=5

# Security (ako koristite HTTPS)
# server.ssl.enabled=true
# server.ssl.key-store=file:/path/to/keystore.jks
# server.ssl.key-store-password=${KEYSTORE_PASSWORD}
# server.ssl.key-store-type=JKS

# Logging
logging.level.root=WARN
logging.level.com.template.integration=INFO
logging.file.name=/var/log/integration-service/app.log
logging.file.max-size=50MB
logging.file.max-history=90
```

### 4.2.2 Environment Variables

**Linux/Unix (setenv.sh):**

```bash
#!/bin/bash
# setenv.sh - Tomcat environment variables

# Database credentials
export DB_USERNAME=integration_user
export DB_PASSWORD=secure_password_here

# Active profile
export SPRING_PROFILES_ACTIVE=prod

# JVM options
export CATALINA_OPTS="$CATALINA_OPTS -Xms512m -Xmx2048m"
export CATALINA_OPTS="$CATALINA_OPTS -XX:+UseG1GC"
export CATALINA_OPTS="$CATALINA_OPTS -XX:MaxGCPauseMillis=200"
export CATALINA_OPTS="$CATALINA_OPTS -Dspring.profiles.active=prod"
export CATALINA_OPTS="$CATALINA_OPTS -Dfile.encoding=UTF-8"

# Application specific
export CATALINA_OPTS="$CATALINA_OPTS -Dintegration.polling.interval=30000"
export CATALINA_OPTS="$CATALINA_OPTS -Dintegration.batch.size=500"
```

**Windows (setenv.bat):**

```batch
@echo off
rem setenv.bat - Tomcat environment variables

rem Database credentials
set DB_USERNAME=integration_user
set DB_PASSWORD=secure_password_here

rem Active profile
set SPRING_PROFILES_ACTIVE=prod

rem JVM options
set CATALINA_OPTS=%CATALINA_OPTS% -Xms512m -Xmx2048m
set CATALINA_OPTS=%CATALINA_OPTS% -XX:+UseG1GC
set CATALINA_OPTS=%CATALINA_OPTS% -XX:MaxGCPauseMillis=200
set CATALINA_OPTS=%CATALINA_OPTS% -Dspring.profiles.active=prod
set CATALINA_OPTS=%CATALINA_OPTS% -Dfile.encoding=UTF-8

rem Application specific
set CATALINA_OPTS=%CATALINA_OPTS% -Dintegration.polling.interval=30000
set CATALINA_OPTS=%CATALINA_OPTS% -Dintegration.batch.size=500
```

---

## 4.3 Implementacija - Produkcijska Okolina

### 4.3.1 Apache Tomcat Deployment (PRIMARNO)

Ovo je **primarni način** deploymenata na produkciji.

#### A. Priprema WAR File-a

**1. Ažuriraj pom.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.template</groupId>
    <artifactId>integration-service</artifactId>
    <version>1.0.0</version>
    <packaging>war</packaging> <!-- BITNO: WAR packaging -->

    <name>Integration Service</name>
    <description>Integration service for TRC-STG processing</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.0</version>
    </parent>

    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- BITNO: Embedded Tomcat kao provided -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
            <scope>provided</scope>
        </dependency>

        <!-- Oracle JDBC Driver -->
        <dependency>
            <groupId>com.oracle.database.jdbc</groupId>
            <artifactId>ojdbc8</artifactId>
            <version>21.9.0.0</version>
        </dependency>

        <!-- Swagger -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Test dependencies -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>integration-service</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

**2. Ažuriraj Application Class:**

```java
package com.template.integration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Application Class - konfigurirano za Tomcat deployment
 */
@SpringBootApplication
@EnableScheduling
public class IntegrationServiceApplication extends SpringBootServletInitializer {

    /**
     * BITNO: Override configure metode za Tomcat deployment
     */
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(IntegrationServiceApplication.class);
    }

    /**
     * Main metoda za standalone pokretanje (development)
     */
    public static void main(String[] args) {
        SpringApplication.run(IntegrationServiceApplication.class, args);
    }
}
```

**3. Build WAR file:**

```bash
# Navigate to project directory
cd integration-service

# Clean and build WAR
mvn clean package

# Skip tests if needed
mvn clean package -DskipTests

# Rezultat: target/integration-service.war
```

#### B. Tomcat Server Setup

**1. Tomcat Instalacija (ako već nije instaliran):**

```bash
# Linux - Download i extract
wget https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.17/bin/apache-tomcat-10.1.17.tar.gz
tar -xzf apache-tomcat-10.1.17.tar.gz
sudo mv apache-tomcat-10.1.17 /opt/tomcat

# Create tomcat user
sudo useradd -r -m -U -d /opt/tomcat -s /bin/false tomcat
sudo chown -R tomcat:tomcat /opt/tomcat

# Windows - Download zip i extract u C:\tomcat
```

**2. Konfiguracija Tomcat Environment Variables:**

Kreiraj `/opt/tomcat/bin/setenv.sh` (Linux) ili `C:\tomcat\bin\setenv.bat` (Windows):

**Linux - /opt/tomcat/bin/setenv.sh:**

```bash
#!/bin/bash

# Database configuration
export DB_USERNAME="integration_user"
export DB_PASSWORD="secure_password"

# Spring Profile
export SPRING_PROFILES_ACTIVE="prod"

# JVM Memory Settings
export CATALINA_OPTS="$CATALINA_OPTS -Xms1024m -Xmx4096m"

# GC Settings
export CATALINA_OPTS="$CATALINA_OPTS -XX:+UseG1GC"
export CATALINA_OPTS="$CATALINA_OPTS -XX:MaxGCPauseMillis=200"
export CATALINA_OPTS="$CATALINA_OPTS -XX:+UseStringDeduplication"

# System Properties
export CATALINA_OPTS="$CATALINA_OPTS -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE"
export CATALINA_OPTS="$CATALINA_OPTS -Dfile.encoding=UTF-8"
export CATALINA_OPTS="$CATALINA_OPTS -Duser.timezone=Europe/Zagreb"

# Application specific
export CATALINA_OPTS="$CATALINA_OPTS -Dintegration.polling.interval=30000"
export CATALINA_OPTS="$CATALINA_OPTS -Dintegration.batch.size=500"

# Logging
export CATALINA_OPTS="$CATALINA_OPTS -Dlogging.file.name=/var/log/integration-service/app.log"

# JMX Monitoring (opciono)
# export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote"
# export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.port=9090"
# export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.ssl=false"
# export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.authenticate=false"

echo "Integration Service environment configured"
echo "Profile: $SPRING_PROFILES_ACTIVE"
echo "Memory: -Xms1024m -Xmx4096m"
```

**Windows - C:\tomcat\bin\setenv.bat:**

```batch
@echo off

rem Database configuration
set DB_USERNAME=integration_user
set DB_PASSWORD=secure_password

rem Spring Profile
set SPRING_PROFILES_ACTIVE=prod

rem JVM Memory Settings
set CATALINA_OPTS=%CATALINA_OPTS% -Xms1024m -Xmx4096m

rem GC Settings
set CATALINA_OPTS=%CATALINA_OPTS% -XX:+UseG1GC
set CATALINA_OPTS=%CATALINA_OPTS% -XX:MaxGCPauseMillis=200

rem System Properties
set CATALINA_OPTS=%CATALINA_OPTS% -Dspring.profiles.active=%SPRING_PROFILES_ACTIVE%
set CATALINA_OPTS=%CATALINA_OPTS% -Dfile.encoding=UTF-8
set CATALINA_OPTS=%CATALINA_OPTS% -Duser.timezone=Europe/Zagreb

rem Application specific
set CATALINA_OPTS=%CATALINA_OPTS% -Dintegration.polling.interval=30000
set CATALINA_OPTS=%CATALINA_OPTS% -Dintegration.batch.size=500

rem Logging
set CATALINA_OPTS=%CATALINA_OPTS% -Dlogging.file.name=C:\logs\integration-service\app.log

echo Integration Service environment configured
echo Profile: %SPRING_PROFILES_ACTIVE%
echo Memory: -Xms1024m -Xmx4096m
```

**3. Permissions (Linux):**

```bash
# Make setenv.sh executable
chmod +x /opt/tomcat/bin/setenv.sh

# Create log directory
sudo mkdir -p /var/log/integration-service
sudo chown tomcat:tomcat /var/log/integration-service
```

#### C. Deployment na Tomcat

**1. Copy WAR file na Tomcat:**

```bash
# Linux
sudo cp target/integration-service.war /opt/tomcat/webapps/

# Windows
copy target\integration-service.war C:\tomcat\webapps\

# Tomcat će automatski deploy-ati aplikaciju prilikom pokretanja
```

**2. Restart Tomcat:**

**Linux - Systemd Service:**

```bash
# Kreiraj systemd service file
sudo vi /etc/systemd/system/tomcat.service
```

**/etc/systemd/system/tomcat.service:**

```ini
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking

User=tomcat
Group=tomcat

Environment="JAVA_HOME=/usr/lib/jvm/java-17-openjdk"
Environment="CATALINA_PID=/opt/tomcat/temp/tomcat.pid"
Environment="CATALINA_HOME=/opt/tomcat"
Environment="CATALINA_BASE=/opt/tomcat"

ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh

RestartSec=10
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Start Tomcat
sudo systemctl start tomcat

# Enable on boot
sudo systemctl enable tomcat

# Check status
sudo systemctl status tomcat

# View logs
sudo journalctl -u tomcat -f

# Restart
sudo systemctl restart tomcat

# Stop
sudo systemctl stop tomcat
```

**Linux - Manual (bez systemd):**

```bash
# Start
sudo -u tomcat /opt/tomcat/bin/startup.sh

# Stop
sudo -u tomcat /opt/tomcat/bin/shutdown.sh

# Restart
sudo -u tomcat /opt/tomcat/bin/shutdown.sh
sleep 5
sudo -u tomcat /opt/tomcat/bin/startup.sh
```

**Windows - Service:**

```batch
rem Install as Windows Service
C:\tomcat\bin\service.bat install

rem Start service
net start Tomcat10

rem Stop service
net stop Tomcat10

rem Restart service
net stop Tomcat10 && net start Tomcat10
```

**Windows - Manual:**

```batch
rem Start
C:\tomcat\bin\startup.bat

rem Stop
C:\tomcat\bin\shutdown.bat
```

#### D. Verifikacija Deploymenata

**1. Provjeri Tomcat Logs:**

```bash
# Linux
tail -f /opt/tomcat/logs/catalina.out

# Windows
type C:\tomcat\logs\catalina.out

# Traži:
# - "Started IntegrationServiceApplication in X seconds"
# - "Tomcat started on port(s): 8080"
# - Scheduler logs: "Starting TRC polling cycle"
```

**2. Provjeri Application Logs:**

```bash
# Linux
tail -f /var/log/integration-service/app.log

# Windows
type C:\logs\integration-service\app.log
```

**3. Test Endpoints:**

```bash
# Health check
curl http://localhost:8080/integration-service/api/health/status

# Swagger UI
# Browser: http://localhost:8080/integration-service/swagger-ui.html

# API docs
curl http://localhost:8080/integration-service/v3/api-docs
```

**Napomena:** Context path je `/integration-service` (ime WAR filea).

#### E. Troubleshooting

**Problem 1: Application se ne pokreće**

```bash
# Provjeri Tomcat logs
tail -100 /opt/tomcat/logs/catalina.out

# Provjeri application logs
tail -100 /var/log/integration-service/app.log

# Provjeri database connection
# U application-prod.properties, privremeno omogući:
spring.jpa.show-sql=true
logging.level.org.springframework.jdbc=DEBUG
```

**Problem 2: Out of Memory greška**

```bash
# Povećaj heap memory u setenv.sh
export CATALINA_OPTS="$CATALINA_OPTS -Xms2048m -Xmx8192m"

# Restart Tomcat
sudo systemctl restart tomcat
```

**Problem 3: Port već zauzet**

```bash
# Provjeri koji proces koristi port
lsof -i :8080

# Kill proces
kill -9 <PID>

# Ili promijeni Tomcat port u server.xml
vi /opt/tomcat/conf/server.xml
# <Connector port="8090" protocol="HTTP/1.1" ... />
```

**Problem 4: Database connection timeout**

```bash
# Provjeri da je Oracle database dostupna
tnsping <SID>

# Provjeri Oracle listener
lsnrctl status

# Test connection sa sqlplus
sqlplus integration_user/password@//hostname:1521/SID

# Provjeri firewall
telnet hostname 1521
```

---

### 4.3.2 Load Balancing i High Availability (Opciono)

Ako imate više Tomcat servera, preporučuje se load balancer.

#### Apache HTTP Server + mod_jk

**1. Install mod_jk:**

```bash
# Linux
sudo apt-get install libapache2-mod-jk  # Ubuntu/Debian
sudo yum install mod_jk                  # RHEL/CentOS
```

**2. Configure workers.properties:**

```properties
# /etc/apache2/workers.properties

# Define workers
worker.list=loadbalancer,status

# Worker 1 - Tomcat Server 1
worker.worker1.type=ajp13
worker.worker1.host=tomcat-server-1
worker.worker1.port=8009
worker.worker1.lbfactor=1

# Worker 2 - Tomcat Server 2
worker.worker2.type=ajp13
worker.worker2.host=tomcat-server-2
worker.worker2.port=8009
worker.worker2.lbfactor=1

# Load Balancer
worker.loadbalancer.type=lb
worker.loadbalancer.balance_workers=worker1,worker2
worker.loadbalancer.sticky_session=1

# Status Worker
worker.status.type=status
```

**3. Configure Apache VirtualHost:**

```apache
<VirtualHost *:80>
    ServerName integration.company.com

    JkMount /integration-service/* loadbalancer
    JkMount /jkstatus status

    ErrorLog ${APACHE_LOG_DIR}/integration-error.log
    CustomLog ${APACHE_LOG_DIR}/integration-access.log combined
</VirtualHost>
```

#### Hardware Load Balancer (F5, Citrix ADC)

Ako imate hardware load balancer, konfigurirajte:

**Health Check:**
- URL: `http://tomcat-server:8080/integration-service/api/health/status`
- Interval: 30 seconds
- Timeout: 5 seconds
- Expected Response: 200 OK

**Load Balancing Method:**
- Round Robin ili Least Connections

**Session Persistence:**
- Source IP persistence (ako je potrebna sticky session)

---

### 4.3.3 Monitoring i Management

#### JMX Monitoring

**1. Enable JMX u setenv.sh:**

```bash
export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote"
export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.port=9090"
export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.ssl=false"
export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.authenticate=true"
export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.password.file=/opt/tomcat/conf/jmxremote.password"
export CATALINA_OPTS="$CATALINA_OPTS -Dcom.sun.management.jmxremote.access.file=/opt/tomcat/conf/jmxremote.access"
```

**2. JMX Password file:**

```bash
# /opt/tomcat/conf/jmxremote.password
monitorRole  monitor123
controlRole  control123
```

```bash
chmod 600 /opt/tomcat/conf/jmxremote.password
chown tomcat:tomcat /opt/tomcat/conf/jmxremote.password
```

**3. JMX Access file:**

```bash
# /opt/tomcat/conf/jmxremote.access
monitorRole  readonly
controlRole  readwrite
```

**4. Connect sa JConsole:**

```bash
jconsole tomcat-server:9090
# Username: controlRole
# Password: control123
```

#### Tomcat Manager App

**1. Konfiguriraj korisnike:**

```xml
<!-- /opt/tomcat/conf/tomcat-users.xml -->
<tomcat-users>
    <role rolename="manager-gui"/>
    <role rolename="manager-script"/>
    <role rolename="manager-status"/>
    <user username="admin" password="secure_password" roles="manager-gui,manager-script,manager-status"/>
</tomcat-users>
```

**2. Access Manager:**
```
http://tomcat-server:8080/manager/html
```

**3. Manager Features:**
- Deploy/Undeploy aplikacija
- Start/Stop/Reload aplikacija
- View memory usage
- View thread dump
- View server status

---

### 4.3.4 Backup i Disaster Recovery

#### Application Backup

```bash
#!/bin/bash
# backup-integration-service.sh

BACKUP_DIR="/backup/integration-service"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup WAR file
cp /opt/tomcat/webapps/integration-service.war \
   $BACKUP_DIR/integration-service-$DATE.war

# Backup configuration
cp /opt/tomcat/bin/setenv.sh \
   $BACKUP_DIR/setenv-$DATE.sh

# Backup logs (last 7 days)
tar -czf $BACKUP_DIR/logs-$DATE.tar.gz \
   /var/log/integration-service/

# Keep only last 30 backups
find $BACKUP_DIR -name "*.war" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

#### Database Backup

```bash
#!/bin/bash
# backup-integration-db.sh

BACKUP_DIR="/backup/integration-db"
DATE=$(date +%Y%m%d_%H%M%S)

# Export schema
expdp integration_user/password@PRODDB \
  DIRECTORY=dpump_dir \
  DUMPFILE=integration_backup_$DATE.dmp \
  LOGFILE=integration_backup_$DATE.log \
  SCHEMAS=integration_user

# Move to backup directory
mv /oracle/dpdump/integration_backup_$DATE.* $BACKUP_DIR/

echo "Database backup completed: $DATE"
```

#### Disaster Recovery Plan

**1. Full System Restore:**

```bash
# Stop Tomcat
sudo systemctl stop tomcat

# Restore WAR file
sudo cp /backup/integration-service/integration-service-YYYYMMDD.war \
        /opt/tomcat/webapps/integration-service.war

# Restore configuration
sudo cp /backup/integration-service/setenv-YYYYMMDD.sh \
        /opt/tomcat/bin/setenv.sh

# Restore database
impdp integration_user/password@PRODDB \
  DIRECTORY=dpump_dir \
  DUMPFILE=integration_backup_YYYYMMDD.dmp \
  SCHEMAS=integration_user \
  TABLE_EXISTS_ACTION=REPLACE

# Start Tomcat
sudo systemctl start tomcat

# Verify
curl http://localhost:8080/integration-service/api/health/status
```

---

### 4.3.5 SSL/TLS Configuration (HTTPS)

#### Tomcat SSL Configuration

**1. Generate Keystore:**

```bash
# Generate self-signed certificate (development)
keytool -genkey -alias tomcat -keyalg RSA -keysize 2048 \
        -keystore /opt/tomcat/conf/keystore.jks \
        -validity 365

# Or use existing certificate from CA
keytool -import -alias tomcat -file certificate.crt \
        -keystore /opt/tomcat/conf/keystore.jks
```

**2. Configure Tomcat Connector:**

Edit `/opt/tomcat/conf/server.xml`:

```xml
<Connector port="8443" protocol="org.apache.coyote.http11.Http11NioProtocol"
           maxThreads="150" SSLEnabled="true">
    <SSLHostConfig>
        <Certificate certificateKeystoreFile="conf/keystore.jks"
                     certificateKeystorePassword="changeit"
                     type="RSA" />
    </SSLHostConfig>
</Connector>
```

**3. Restart Tomcat:**

```bash
sudo systemctl restart tomcat
```

**4. Test:**

```bash
curl -k https://localhost:8443/integration-service/api/health/status
```

---

## 4.3.6 Docker i Kubernetes (OPCIONO - Za Budućnost)

Docker i Kubernetes deployments su **opcioni** i predviđeni za buduću migraciju kada infrastruktura to bude podržavala.

<details>
<summary><b>Klikni za Docker deployment upute (opciono)</b></summary>

### Docker Deployment

#### Dockerfile

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=build /app/target/integration-service-*.jar app.jar
EXPOSE 8092
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8092/api/health/status || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  integration-service:
    build: .
    ports:
      - "8092:8092"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_USERNAME=integration_user
      - DB_PASSWORD=secure_password
```

</details>

<details>
<summary><b>Klikni za Kubernetes deployment upute (opciono)</b></summary>

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: integration-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: integration-service
  template:
    metadata:
      labels:
        app: integration-service
    spec:
      containers:
      - name: integration-service
        image: your-registry/integration-service:1.0.0
        ports:
        - containerPort: 8092
```

</details>

---

*Nastavak dokumentacije u INTEGRACIJE_DIO3_UPDATED.md (page 2)...*

## 4.4 Testiranje (jedinično, integracijsko, performanse)

### 4.4.1 Jedinično Testiranje (Unit Tests)

Koristimo JUnit 5 i Mockito za unit testiranje.

**Pokretanje unit testova:**

```bash
# Pokreni sve testove
mvn test

# Pokreni samo unit testove
mvn test -Dtest="**/*Test.java"

# Pokreni određeni test
mvn test -Dtest=TrcPollingServiceTest
```

### 4.4.2 Integracijsko Testiranje

Integration testovi koriste Spring Boot Test framework sa MockMvc.

**Pokretanje integration testova:**

```bash
# Pokreni integration testove
mvn test -Dtest="**/*IntegrationTest.java"

# Sa Oracle test bazom
mvn test -Dspring.profiles.active=test -Dtest="**/*IntegrationTest.java"
```

### 4.4.3 Testiranje Performansi

**Apache JMeter** ili **Gatling** za performance testing.

**Očekivane Performanse:**

| Metrika | Zahtjev |
|---------|---------|
| Response Time (P95) | < 500ms |
| Response Time (P99) | < 1000ms |
| Throughput | > 1000 req/sec |
| Error Rate | < 0.1% |

### 4.4.4 Test Coverage

**Cilj:** Minimalno 80% code coverage

**Generiranje coverage reporta:**

```bash
# Run tests with coverage
mvn clean test jacoco:report

# View report
firefox target/site/jacoco/index.html  # Linux
start target\site\jacoco\index.html    # Windows
```

---

## 4.5 Dokumentacija (MD, TD, FD, Swagger/KDK)

### 4.5.1 Swagger / OpenAPI Dokumentacija

**Pristup Swagger UI:**

```
Development: http://localhost:8080/integration-service/swagger-ui.html
Production:  https://production-server.company.com/integration-service/swagger-ui.html
```

### 4.5.2 Tipovi Dokumentacije

#### MD - Metodička Dokumentacija
- **Opis**: High-level opis sustava, arhitekture, koncepta
- **Format**: Markdown ili Word
- **Primjer**: INTEGRACIJE.md

#### TD - Tehnička Dokumentacija
- **Opis**: Detaljna tehnička upustva za developere
- **Sadržaj**: API endpoints, database schema, deployment steps
- **Format**: Markdown + Swagger

#### FD - Funkcionalna Dokumentacija
- **Opis**: Korisnička dokumentacija
- **Sadržaj**: Kako koristiti sustav, use cases, troubleshooting
- **Korisnici**: End users, support team

#### KDK - Kratki Detaljan Komentar (Code Comments)
- **Opis**: Komentari u kodu (JavaDoc, SQL package comments)
- **Format**: Komentari u source code

**NAPOMENA:** Opis Oracle paketa i procedura **NE IDE** u Word dokument, već u sam package code kao komentar!

---

## 4.6 Održavanje Sustava i Nadogradnja

### 4.6.1 Monitoring i Health Checks

#### Spring Boot Actuator

**Actuator Endpoints:**

```
http://localhost:9090/actuator/health
http://localhost:9090/actuator/info
http://localhost:9090/actuator/metrics
```

#### JMX Monitoring

Koristiti JConsole ili VisualVM za monitoring:

```bash
jconsole tomcat-server:9090
```

### 4.6.2 Logging i Troubleshooting

**Lokacije log fileova:**

- Tomcat logs: `/opt/tomcat/logs/catalina.out`
- Application logs: `/var/log/integration-service/app.log`

**Structured Logging sa MDC:**

```java
MDC.put("trcId", String.valueOf(trcOrder.getId()));
log.info("Processing TRC record");
MDC.clear();
```

### 4.6.3 Verzioniranje i Release Management

**Semantic Versioning:**

```
MAJOR.MINOR.PATCH
  1  .  2  .  3
```

**Release Checklist:**

- [ ] Code review completed
- [ ] Tests passing (>80% coverage)
- [ ] Database scripts prepared
- [ ] Documentation updated
- [ ] WAR file built and tested
- [ ] Rollback plan prepared

---

## ZAKLJUČAK

Ovaj dokument opisuje implementaciju i deployment Spring Boot integracijskog sustava na **tradicionalnoj infrastrukturi** sa Oracle bazom podataka i Apache Tomcat serverima.

**Ključne karakteristike:**

1. **TRC-STG Model** - Asinkrona komunikacija putem baze podataka
2. **REST API** - Sinkrona komunikacija za real-time zahtjeve
3. **Scheduler** - Polling mehanizam za obradu TRC zapisa
4. **Tomcat Deployment** - WAR file deployment na production servere
5. **Oracle Database** - Glavna baza podataka sa stored procedures
6. **Monitoring** - JMX, Actuator, Health checks
7. **High Availability** - Load balancing, backup/recovery

**Za buduću migraciju:**
- Docker containerization (opciono)
- Kubernetes orchestration (opciono)
- Cloud deployment (opciono)

**Kontakt za pitanja:**
- IT Department: it@company.com
- Tech Lead: [Ime] - [email]

**Verzija dokumenta:** 2.0 (ažurirano za Tomcat deployment)
**Datum:** Siječanj 2026
