# Dokumentacija Integracijskog Sustava

## Pregled

Ova dokumentacija opisuje arhitekturu i implementaciju Spring Boot integracijskog sustava koji zamjenjuje Oracle Service Bus (OSB) funkcionalnost koristeći TRC-STG (Tracing-Staging) model za asinkironu komunikaciju između sustava.

## Dokumenti

Dokumentacija je podijeljena u četiri glavna dijela:

### 📘 [INTEGRACIJE.md](./INTEGRACIJE.md) - DIO 1
**Poglavlja 1 i 2: Uvod i Pregled Sustava**

Sadržaj:
- **1. UVOD**
  - 1.1 Pregled – Integracijske potrebe
  - 1.2 Tehnološki okvir (DB, Spring Boot, Java, REST)
- **2. PREGLED SUSTAVA**
  - 2.1 Vrste sučelja (webservisi, TRC-STG tablice)
  - 2.2 Arhitektura sustava (dijagrami toka)
  - 2.3 Komponente i njihova uloga
  - 2.4 Upravljanje greškama i logging
  - 2.5 Konfiguriranje sučelja (DB config → Properties)
  - 2.6 Raspored izvođenja (scheduling)

**Za koga:** Project manageri, arhitekti, novi developeri

---

### 📗 [INTEGRACIJE_DIO2.md](./INTEGRACIJE_DIO2.md) - DIO 2
**Poglavlje 3: Implementacija Spring Boot Sučelja**

Sadržaj:
- **3.1 Kreiranje kontrolera (Controllers)**
  - REST API endpoints
  - Swagger dokumentacija
  - Request/Response mappings
- **3.2 Servisni sloj (Services)**
  - TrcPollingService - Polling TRC tablica
  - TransformationService - Transformacija podataka
  - SplitService - Distribucija podataka
  - StagingService - Upis u STG tablice
- **3.3 Repozitoriji i pristup bazi (Repositories, JPA/Hibernate)**
  - Custom repository metode
  - Query methods
  - Native queries
- **3.4 DTO i mapiranje podataka**
  - Request DTOs
  - Response DTOs
  - ApiResponse wrapper
- **3.5 Validacija korisničkih unosa**
  - Bean validation
  - Custom validators
- **3.6 Obrada iznimki i vraćanje HTTP statusa**
  - Custom exceptions
  - Global exception handler
  - HTTP status mapping

**Za koga:** Java developeri, backend programeri

---

### 📙 [INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md) - DIO 3
**Poglavlje 4: Dodaci**

Sadržaj:
- **4.1 Konvencije nazivanja i strukture koda**
  - Imenovanje paketa, klasa, metoda
  - Imenovanje tablica i kolona
  - SQL procedura struktura i komentari
- **4.2 Okoline (DEV/TEST, PROD)**
  - Spring Profiles konfiguracija
  - Environment variables
  - Properties files po okolinama
- **4.3 Implementacija (Kubernetes, TomCat, Docker)**
  - Dockerfile i docker-compose
  - Kubernetes deployment
  - Tomcat WAR deployment
- **4.4 Testiranje**
  - Unit testovi (JUnit, Mockito)
  - Integration testovi (MockMvc)
  - Performance testovi
  - Test coverage (JaCoCo)
- **4.5 Dokumentacija**
  - Swagger/OpenAPI dokumentacija
  - Tipovi dokumentacije (MD, TD, FD, KDK)
  - Real-time Stock Price primjer
- **4.6 Održavanje sustava i nadogradnja**
  - Monitoring i health checks
  - Logging strategija
  - Backup i recovery
  - Verzioniranje i release management

**Za koga:** Svi članovi tima, DevOps, QA

---

### 📕 [INTEGRACIJE_SQL_SKRIPTE.md](./INTEGRACIJE_SQL_SKRIPTE.md) - SQL Skripte
**Baza Podataka - DDL i DML Skripte**

Sadržaj:
1. **TRC (Tracing) Tablice**
   - TRC_ORDERS
   - TRC_INVOICES
   - Sekvence i triggeri
2. **STG (Staging) Tablice**
   - STG_ORDERS_SYSTEM_A
   - STG_ORDERS_SYSTEM_B
   - Foreign keys i indeksi
3. **Config Tablice**
   - CONFIG_INTERFACE
   - CONFIG_TARGET_SYSTEMS
4. **Oracle Packages - Transformacija (TAFR)**
   - PKG_TRANSFORM_ORDERS
   - Transform procedures za različite sustave
5. **Oracle Packages - Split Logika**
   - PKG_SPLIT_ORDERS
   - Business rules za određivanje ciljnih sustava
6. **Testni Podatci**
   - INSERT statements za testiranje
   - Monitoring queries
7. **Maintenance Skripte**
   - Archive procedures
   - Cleanup scripts
   - Grant permissions

**Za koga:** DBA, Backend developeri, DevOps

---

## Quick Start Guide

### Pregled Arhitekture

```
Legacy Sustav → TRC Tablica → Spring Boot Polling → Transformacija → Split → STG Tablice → Ciljni Sustavi
```

### Osnovni Workflow

1. **Izvorni sustav** upisuje podatke u **TRC tablicu** (status = NEW)
2. **Spring Boot Scheduler** (polling service) čita NEW zapise svakih 30 sekundi
3. **Transformation Service** transformira podatke koristeći:
   - Java logiku, ili
   - Oracle DB procedure (TAFR)
4. **Split Service** određuje ciljne sustave na temelju business pravila
5. **Staging Service** upisuje podatke u **STG tablice** za svaki ciljni sustav
6. **Ciljni sustavi** čitaju podatke iz svojih STG tablica

### Tehnologije

- **Backend:** Spring Boot 3.4.0/4.0.1, Java 17+
- **Database:** Oracle 11g+, H2 (dev)
- **ORM:** Hibernate/JPA
- **Scheduling:** Spring Scheduler
- **API:** REST (JSON), Swagger/OpenAPI
- **Application Server:** Apache Tomcat 10.x (WAR deployment)
- **Testing:** JUnit 5, Mockito, MockMvc
- **Monitoring:** JMX, Spring Boot Actuator

### Napredne Opcije (Opciono, za budućnost)

- **Containerization:** Docker (opciono)
- **Orchestration:** Kubernetes (opciono)

---

## Korištenje Dokumentacije

### Za Početak Novog Projekta

1. Pročitaj [INTEGRACIJE.md](./INTEGRACIJE.md) - razumjeti arhitekturu
2. Pokreni SQL skripte iz [INTEGRACIJE_SQL_SKRIPTE.md](./INTEGRACIJE_SQL_SKRIPTE.md)
3. Slijedi implementacijske upute iz [INTEGRACIJE_DIO2.md](./INTEGRACIJE_DIO2.md)
4. Konfiguriraj okoline prema [INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md)

### Za Troubleshooting

1. Provjeri **Monitoring queries** u [INTEGRACIJE_SQL_SKRIPTE.md](./INTEGRACIJE_SQL_SKRIPTE.md) - sekcija 6
2. Pregled **Error handling** strategije u [INTEGRACIJE.md](./INTEGRACIJE.md) - sekcija 2.4
3. Provjeri **Logging** konfiguraciju u [INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md) - sekcija 4.6.2

### Za Deployment (Produkcija)

1. **Build WAR file** prema [INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md) - sekcija 4.3.1.A
2. **Setup Tomcat Server** prema [INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md) - sekcija 4.3.1.B
3. **Deploy na Tomcat** prema [INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md) - sekcija 4.3.1.C
4. **Configure Environment** prema [INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md) - sekcija 4.2.2
5. **Setup Monitoring** prema [INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md) - sekcija 4.3.3

### Za Buduću Modernizaciju (Opciono)

- **Docker deployment** - [INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md) sekcija 4.3.6
- **Kubernetes deployment** - [INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md) sekcija 4.3.6

---

## Ključni Koncepti

### TRC Statusi

| Status | Opis |
|--------|------|
| **NEW** | Novi zapis, čeka obradu |
| **PROCESSING** | U obradi |
| **COMPLETED** | Uspješno obrađeno |
| **ERROR** | Greška - premašen broj pokušaja |
| **RETRY** | Čeka ponovni pokušaj |

### STG Statusi

| Status | Opis |
|--------|------|
| **READY** | Spremno za čitanje od ciljnog sustava |
| **PROCESSING** | Ciljni sustav obrađuje |
| **COMPLETED** | Ciljni sustav uspješno obradio |
| **ERROR** | Greška u ciljnom sustavu |

### TAFR - Transform And Forward

Koncept gdje Oracle DB procedura:
1. **Transform** - Transformira podatke iz TRC formata u format ciljnog sustava
2. **And Forward** - Odmah sprema u STG tablicu (ili vraća podatke za Spring Boot)

---

## Dodatni Resursi

### Projekti u Repozitoriju

- **auth-service/** - Autentikacijski servis (JWT, LDAP)
- **business-app-backend/** - Business aplikacija template
- **integration-service/** - (NOVI) Integracijski servis opisane u ovoj dokumentaciji

### Reference Dokumenti

- [CLAUDE.md](./CLAUDE.md) - Glavni README za cijeli repozitorij
- [auth-service/README.md](./auth-service/README.md) - Auth service dokumentacija
- [business-app-backend/README.md](./business-app-backend/README.md) - Business app dokumentacija

### Swagger UI

Kada je aplikacija pokrenuta, pristupite:
```
http://localhost:8092/swagger-ui.html
```

---

## Kontakt i Održavanje

**IT Department**
- Email: it@company.com
- Tech Lead: [Ime] - [email]

**Verzija dokumentacije:** 1.0
**Datum:** Siječanj 2026
**Zadnje ažuriranje:** 21.01.2026

---

## Changelog

### Verzija 1.0 (21.01.2026)
- Inicijalna verzija dokumentacije
- Pokriva punu arhitekturu TRC-STG integracije
- Spring Boot implementacijske upute
- SQL skripte za Oracle bazu
- Deployment upute (Docker, Kubernetes)
- Testing strategije
