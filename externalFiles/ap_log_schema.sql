--------------------------------------------------------
--  File created - srijeda-veljaèe-18-2026   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Sequence T_APP_LOG_SEQ01
--------------------------------------------------------

   CREATE SEQUENCE  "AP_LOG"."T_APP_LOG_SEQ01"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 2967023 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE  GLOBAL ;
  GRANT SELECT ON "AP_LOG"."T_APP_LOG_SEQ01" TO "AP_APPLICATIONS";
--------------------------------------------------------
--  DDL for Sequence T_LOG_SEQ01
--------------------------------------------------------

   CREATE SEQUENCE  "AP_LOG"."T_LOG_SEQ01"  MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE  GLOBAL ;
--------------------------------------------------------
--  DDL for Table D_LOG_STATUS
--------------------------------------------------------

  CREATE TABLE "AP_LOG"."D_LOG_STATUS" 
   (	"STATUS" VARCHAR2(100 BYTE), 
	"DELETE_AFTER" NUMBER, 
	"CREATE_DATE" DATE DEFAULT SYSDATE, 
	"CREATE_USER" VARCHAR2(100 BYTE) DEFAULT USER
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
  GRANT DELETE ON "AP_LOG"."D_LOG_STATUS" TO "AP_UTIL";
  GRANT INSERT ON "AP_LOG"."D_LOG_STATUS" TO "AP_UTIL";
  GRANT SELECT ON "AP_LOG"."D_LOG_STATUS" TO "AP_UTIL";
  GRANT UPDATE ON "AP_LOG"."D_LOG_STATUS" TO "AP_UTIL";
  GRANT SELECT ON "AP_LOG"."D_LOG_STATUS" TO "AP_APPLICATIONS";
--------------------------------------------------------
--  DDL for Table T_APP_LOG
--------------------------------------------------------

  CREATE TABLE "AP_LOG"."T_APP_LOG" 
   (	"ID" NUMBER, 
	"ENTITY" VARCHAR2(100 BYTE), 
	"MODULE" VARCHAR2(100 BYTE), 
	"REQUEST" CLOB, 
	"RESPONSE" CLOB, 
	"STATUS" VARCHAR2(100 BYTE), 
	"START_TIME" DATE, 
	"END_TIME" DATE DEFAULT SYSDATE, 
	"NOTIFIABLE" VARCHAR2(1 BYTE), 
	"NOTIFICATION_SENT" VARCHAR2(1 BYTE), 
	"USERNAME" VARCHAR2(100 BYTE), 
	"CREATE_USER" VARCHAR2(100 BYTE) DEFAULT USER, 
	"CREATE_DATE" DATE DEFAULT SYSDATE
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" 
 LOB ("REQUEST") STORE AS SECUREFILE (
  TABLESPACE "TBS_UTIL_APP" ENABLE STORAGE IN ROW CHUNK 8192
  NOCACHE LOGGING  NOCOMPRESS  KEEP_DUPLICATES 
  STORAGE(INITIAL 106496 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)) 
 LOB ("RESPONSE") STORE AS SECUREFILE (
  TABLESPACE "TBS_UTIL_APP" ENABLE STORAGE IN ROW CHUNK 8192
  NOCACHE LOGGING  NOCOMPRESS  KEEP_DUPLICATES 
  STORAGE(INITIAL 106496 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)) ;
  GRANT DELETE ON "AP_LOG"."T_APP_LOG" TO "AP_UTIL";
  GRANT INSERT ON "AP_LOG"."T_APP_LOG" TO "AP_UTIL";
  GRANT SELECT ON "AP_LOG"."T_APP_LOG" TO "AP_UTIL";
  GRANT UPDATE ON "AP_LOG"."T_APP_LOG" TO "AP_UTIL";
  GRANT SELECT ON "AP_LOG"."T_APP_LOG" TO "AP_APPLICATIONS";
  GRANT INSERT ON "AP_LOG"."T_APP_LOG" TO "AP_APPLICATIONS";
  GRANT UPDATE ON "AP_LOG"."T_APP_LOG" TO "AP_APPLICATIONS";
--------------------------------------------------------
--  DDL for Table T_LOG
--------------------------------------------------------

  CREATE TABLE "AP_LOG"."T_LOG" 
   (	"ID" NUMBER, 
	"REQUEST" CLOB, 
	"RESPONSE" CLOB, 
	"STATUS" VARCHAR2(100 BYTE), 
	"START_TIME" DATE, 
	"END_TIME" DATE DEFAULT SYSDATE, 
	"NOTIFIABLE" VARCHAR2(1 BYTE), 
	"NOTIFICATION_SENT" VARCHAR2(1 BYTE), 
	"CREATE_USER" VARCHAR2(100 BYTE)
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" 
 LOB ("REQUEST") STORE AS SECUREFILE (
  TABLESPACE "TBS_UTIL_APP" ENABLE STORAGE IN ROW CHUNK 8192
  NOCACHE LOGGING  NOCOMPRESS  KEEP_DUPLICATES 
  STORAGE(INITIAL 106496 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)) 
 LOB ("RESPONSE") STORE AS SECUREFILE (
  TABLESPACE "TBS_UTIL_APP" ENABLE STORAGE IN ROW CHUNK 8192
  NOCACHE LOGGING  NOCOMPRESS  KEEP_DUPLICATES 
  STORAGE(INITIAL 106496 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)) ;
  GRANT DELETE ON "AP_LOG"."T_LOG" TO "AP_UTIL";
  GRANT INSERT ON "AP_LOG"."T_LOG" TO "AP_UTIL";
  GRANT SELECT ON "AP_LOG"."T_LOG" TO "AP_UTIL";
  GRANT UPDATE ON "AP_LOG"."T_LOG" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Table T_STATISTIC
--------------------------------------------------------

  CREATE TABLE "AP_LOG"."T_STATISTIC" 
   (	"ENTITY" VARCHAR2(100 BYTE), 
	"STAT_DATE" DATE DEFAULT TRUNC(SYSDATE), 
	"PROCESS_TIME" NUMBER DEFAULT 0
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
  GRANT SELECT ON "AP_LOG"."T_STATISTIC" TO "AP_UTIL";
  GRANT DELETE ON "AP_LOG"."T_STATISTIC" TO "AP_UTIL";
  GRANT INSERT ON "AP_LOG"."T_STATISTIC" TO "AP_UTIL";
  GRANT UPDATE ON "AP_LOG"."T_STATISTIC" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Table T_STATISTIC_TABLES
--------------------------------------------------------

  CREATE TABLE "AP_LOG"."T_STATISTIC_TABLES" 
   (	"ENTITY" VARCHAR2(100 BYTE), 
	"STAT_DATE" DATE DEFAULT TRUNC(SYSDATE), 
	"ROW_STATUS" VARCHAR2(10 BYTE), 
	"TABLE_NAME" VARCHAR2(200 BYTE), 
	"MASTER_TABLE_NAME" VARCHAR2(200 BYTE), 
	"ROW_COUNT" NUMBER
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
  GRANT SELECT ON "AP_LOG"."T_STATISTIC_TABLES" TO "AP_UTIL";
  GRANT DELETE ON "AP_LOG"."T_STATISTIC_TABLES" TO "AP_UTIL";
  GRANT INSERT ON "AP_LOG"."T_STATISTIC_TABLES" TO "AP_UTIL";
  GRANT UPDATE ON "AP_LOG"."T_STATISTIC_TABLES" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Index D_LOG_STATUS_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "AP_LOG"."D_LOG_STATUS_PK" ON "AP_LOG"."D_LOG_STATUS" ("STATUS") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
--------------------------------------------------------
--  DDL for Index T_APP_LOG_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "AP_LOG"."T_APP_LOG_PK" ON "AP_LOG"."T_APP_LOG" ("ID") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
--------------------------------------------------------
--  DDL for Index T_LOG_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "AP_LOG"."T_LOG_PK" ON "AP_LOG"."T_LOG" ("ID") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
--------------------------------------------------------
--  DDL for Index T_STATISTIC_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "AP_LOG"."T_STATISTIC_PK" ON "AP_LOG"."T_STATISTIC" ("STAT_DATE", "ENTITY") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
--------------------------------------------------------
--  DDL for Index T_STATISTIC_TABLES_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "AP_LOG"."T_STATISTIC_TABLES_PK" ON "AP_LOG"."T_STATISTIC_TABLES" ("ENTITY", "STAT_DATE", "TABLE_NAME", "ROW_STATUS") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
--------------------------------------------------------
--  DDL for Index D_LOG_STATUS_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "AP_LOG"."D_LOG_STATUS_PK" ON "AP_LOG"."D_LOG_STATUS" ("STATUS") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
--------------------------------------------------------
--  DDL for Index T_APP_LOG_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "AP_LOG"."T_APP_LOG_PK" ON "AP_LOG"."T_APP_LOG" ("ID") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
--------------------------------------------------------
--  DDL for Index T_LOG_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "AP_LOG"."T_LOG_PK" ON "AP_LOG"."T_LOG" ("ID") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
--------------------------------------------------------
--  DDL for Index T_STATISTIC_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "AP_LOG"."T_STATISTIC_PK" ON "AP_LOG"."T_STATISTIC" ("STAT_DATE", "ENTITY") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
--------------------------------------------------------
--  DDL for Index T_STATISTIC_TABLES_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "AP_LOG"."T_STATISTIC_TABLES_PK" ON "AP_LOG"."T_STATISTIC_TABLES" ("ENTITY", "STAT_DATE", "TABLE_NAME", "ROW_STATUS") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP" ;
--------------------------------------------------------
--  DDL for Trigger T_APP_LOG_BIFER
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "AP_LOG"."T_APP_LOG_BIFER" 
BEFORE INSERT ON T_APP_LOG 
FOR EACH ROW 
BEGIN
    IF INSERTING THEN
      SELECT T_APP_LOG_SEQ01.NEXTVAL INTO :NEW.ID FROM SYS.DUAL;
    END IF;
END;

/
ALTER TRIGGER "AP_LOG"."T_APP_LOG_BIFER" ENABLE;
--------------------------------------------------------
--  DDL for Trigger T_LOG_BIFER
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "AP_LOG"."T_LOG_BIFER" 
BEFORE INSERT ON T_LOG 
FOR EACH ROW 
BEGIN
    IF INSERTING THEN
      SELECT T_LOG_SEQ01.NEXTVAL INTO :NEW.ID FROM SYS.DUAL;
    END IF;
END;
/
ALTER TRIGGER "AP_LOG"."T_LOG_BIFER" ENABLE;
--------------------------------------------------------
--  DDL for Trigger T_APP_LOG_BIFER
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "AP_LOG"."T_APP_LOG_BIFER" 
BEFORE INSERT ON T_APP_LOG 
FOR EACH ROW 
BEGIN
    IF INSERTING THEN
      SELECT T_APP_LOG_SEQ01.NEXTVAL INTO :NEW.ID FROM SYS.DUAL;
    END IF;
END;

/
ALTER TRIGGER "AP_LOG"."T_APP_LOG_BIFER" ENABLE;
--------------------------------------------------------
--  DDL for Trigger T_LOG_BIFER
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE TRIGGER "AP_LOG"."T_LOG_BIFER" 
BEFORE INSERT ON T_LOG 
FOR EACH ROW 
BEGIN
    IF INSERTING THEN
      SELECT T_LOG_SEQ01.NEXTVAL INTO :NEW.ID FROM SYS.DUAL;
    END IF;
END;
/
ALTER TRIGGER "AP_LOG"."T_LOG_BIFER" ENABLE;
--------------------------------------------------------
--  DDL for Procedure SET_LOG
--------------------------------------------------------
set define off;

  CREATE OR REPLACE EDITIONABLE PROCEDURE "AP_LOG"."SET_LOG" (   RESPONSE	        CLOB,
                ENTITY_NAME 	    VARCHAR2,
                MODULE              VARCHAR2    DEFAULT 'DEFAULT',
                STATUS	            VARCHAR2    DEFAULT 'INFO',
                REQUEST	            CLOB        DEFAULT NULL,
                START_TIME	        DATE        DEFAULT SYSDATE,
                END_TIME	        DATE        DEFAULT SYSDATE,
                NOTIFIABLE	        VARCHAR2    DEFAULT NULL,
                NOTIFICATION_SENT	VARCHAR2    DEFAULT NULL,
                USERNAME	        VARCHAR2    DEFAULT NULL,
                CREATE_USER	        VARCHAR2    DEFAULT USER    )
AS 
    V_ID    NUMBER;
BEGIN

    IF ENTITY_NAME IS NOT NULL THEN
        V_ID := PK_T_APP_LOG.SET_T_APP_LOG(RESPONSE, ENTITY_NAME, MODULE, STATUS, REQUEST, START_TIME, END_TIME, NOTIFIABLE, NOTIFICATION_SENT, USERNAME, CREATE_USER);
    END IF;
    
    PK_PRINT_LOG.PRINT_LOG(V_ID, RESPONSE, NVL(ENTITY_NAME, 'N/A'), MODULE, STATUS, REQUEST, START_TIME, END_TIME, USERNAME);

END SET_LOG;

/

  GRANT EXECUTE ON "AP_LOG"."SET_LOG" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_LOG"."SET_LOG" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_LOG"."SET_LOG" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Package PK_PRINT_LOG
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "AP_LOG"."PK_PRINT_LOG" AS 

  /* TODO enter package declarations (types, exceptions, methods etc) here */ 
  PROCEDURE PRINT_LOG
            (   ID_LOG              NUMBER,
                RESPONSE	        CLOB,
                ENTITY_NAME 	    VARCHAR2,
                MODULE              VARCHAR2    DEFAULT 'DEFAULT',
                STATUS	            VARCHAR2    DEFAULT NULL,
                REQUEST	            CLOB        DEFAULT NULL,
                START_TIME	        DATE        DEFAULT SYSDATE,
                END_TIME	        DATE        DEFAULT SYSDATE,
                USERNAME	        VARCHAR2    DEFAULT NULL);

END PK_PRINT_LOG;

/

  GRANT EXECUTE ON "AP_LOG"."PK_PRINT_LOG" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Package PK_PURGE_LOG
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "AP_LOG"."PK_PURGE_LOG" AS 

  /* TODO enter package declarations (types, exceptions, methods etc) here */ 
  
  PROCEDURE PROCESS;

END PK_PURGE_LOG;

/

  GRANT EXECUTE ON "AP_LOG"."PK_PURGE_LOG" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Package PK_STATISTIC
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "AP_LOG"."PK_STATISTIC" AS 

  /* TODO enter package declarations (types, exceptions, methods etc) here */
  
  PROCEDURE PROCESS(inDate date default TRUNC(SYSDATE)-1);

END PK_STATISTIC;

/

  GRANT EXECUTE ON "AP_LOG"."PK_STATISTIC" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Package PK_T_APP_LOG
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "AP_LOG"."PK_T_APP_LOG" AS 

  /* TODO enter package declarations (types, exceptions, methods etc) here */ 
  FUNCTION SET_T_APP_LOG 
            (   RESPONSE	        CLOB,
                ENTITY_NAME 	    VARCHAR2,
                MODULE              VARCHAR2,
                STATUS	            VARCHAR2    DEFAULT NULL,
                REQUEST	            CLOB        DEFAULT NULL,
                START_TIME	        DATE        DEFAULT SYSDATE,
                END_TIME	        DATE        DEFAULT SYSDATE,
                NOTIFIABLE	        VARCHAR2    DEFAULT NULL,
                NOTIFICATION_SENT	VARCHAR2    DEFAULT NULL,
                USERNAME	        VARCHAR2    DEFAULT NULL,
                CREATE_USER	        VARCHAR2    DEFAULT USER    )
    RETURN T_APP_LOG.ID%TYPE;

END PK_T_APP_LOG;

/

  GRANT EXECUTE ON "AP_LOG"."PK_T_APP_LOG" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Package Body PK_PRINT_LOG
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "AP_LOG"."PK_PRINT_LOG" AS

    PROCEDURE PRINT_LOG
            (   ID_LOG              NUMBER,
                RESPONSE	        CLOB,
                ENTITY_NAME 	    VARCHAR2,
                MODULE              VARCHAR2,
                STATUS	            VARCHAR2    DEFAULT NULL,
                REQUEST	            CLOB        DEFAULT NULL,
                START_TIME	        DATE        DEFAULT SYSDATE,
                END_TIME	        DATE        DEFAULT SYSDATE,
                USERNAME	        VARCHAR2    DEFAULT NULL) 
    AS
    BEGIN
        DBMS_OUTPUT.PUT_LINE('[' || STATUS || '][' || MODULE || ']['||to_char(sysdate,'hh24:mi:ss')||'][LOG ID: ' || ID_LOG || '][' || round(TO_NUMBER((END_TIME - START_TIME)*24*60*60)) || ' s][USER: ' || USERNAME || '][ENTITIY: ' || ENTITY_NAME || ']');
        
        IF REQUEST IS NOT NULL AND RESPONSE IS NOT NULL THEN
            DBMS_OUTPUT.PUT_LINE('[REQUEST: ' || REQUEST || ']');
            DBMS_OUTPUT.PUT_LINE('[RESPONSE: ' || RESPONSE || ']');
        END IF;
        
        IF REQUEST IS NULL AND RESPONSE IS NOT NULL THEN
            DBMS_OUTPUT.PUT_LINE('[MESSAGE: ' || RESPONSE || ']');
        END IF;
    END;

END PK_PRINT_LOG;

/

  GRANT EXECUTE ON "AP_LOG"."PK_PRINT_LOG" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Package Body PK_PURGE_LOG
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "AP_LOG"."PK_PURGE_LOG" AS

  PROCEDURE PURGE_T_APP_LOG(IN_STATUS D_LOG_STATUS.STATUS%TYPE, IN_DELETE_AFTER D_LOG_STATUS.DELETE_AFTER%TYPE)
  AS
  BEGIN
    
    DELETE FROM T_APP_LOG WHERE STATUS = IN_STATUS AND END_TIME < TRUNC(SYSDATE) - IN_DELETE_AFTER;
    
  END;
  
  PROCEDURE PURGE_T_LOG(IN_STATUS D_LOG_STATUS.STATUS%TYPE, IN_DELETE_AFTER D_LOG_STATUS.DELETE_AFTER%TYPE)
  AS
  BEGIN
    
    DELETE FROM T_LOG WHERE STATUS = IN_STATUS AND END_TIME < TRUNC(SYSDATE) - IN_DELETE_AFTER;
    
  END;
  
  PROCEDURE PROCESS
  AS
  BEGIN
    
    FOR ST IN (SELECT STATUS ,DELETE_AFTER FROM D_LOG_STATUS)
    LOOP
        
        PURGE_T_APP_LOG(ST.STATUS, ST.DELETE_AFTER);
        
        PURGE_T_LOG(ST.STATUS, ST.DELETE_AFTER);
        
    END LOOP;
    
    COMMIT;
        
    EXCEPTION WHEN OTHERS THEN
    
        ROLLBACK;

  END;

END PK_PURGE_LOG;

/

  GRANT EXECUTE ON "AP_LOG"."PK_PURGE_LOG" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Package Body PK_STATISTIC
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "AP_LOG"."PK_STATISTIC" AS


PROCEDURE SET_T_STATISTIC (inDate date default TRUNC(SYSDATE)-1)
AS
BEGIN

    FOR K IN (  SELECT ENTITY, TRUNC(START_TIME) STAT_DATE, ROUND(SUM(END_TIME - START_TIME)*24*60*60) PROCESS_TIME
                FROM T_APP_LOG LG JOIN AP_APPLICATIONS.D_ENTITIES EN ON LG.ENTITY = EN.ID 
                WHERE MODULE = 'PROCESS' AND TRUNC(START_TIME) = inDate
                GROUP BY ENTITY, EN.NAME, TRUNC(START_TIME)
    ) 
    LOOP
        BEGIN
            INSERT INTO T_STATISTIC (ENTITY, STAT_DATE, PROCESS_TIME)
            VALUES (K.ENTITY, K.STAT_DATE, K.PROCESS_TIME);
            COMMIT;
        EXCEPTION
            WHEN DUP_VAL_ON_INDEX THEN
            UPDATE T_STATISTIC SET PROCESS_TIME = K.PROCESS_TIME WHERE ENTITY = K.ENTITY AND STAT_DATE = K.STAT_DATE;
            COMMIT;
        END;             
    END LOOP;

END;

PROCEDURE SET_T_STATISTIC_TABLES(inDate date default TRUNC(SYSDATE)-1)
AS
INMASTERTABLE   VARCHAR2(200);
INDETAILTABLE   VARCHAR2(200);
BEGIN

FOR K IN (SELECT EN.NAME, ENA.VALUE FROM AP_APPLICATIONS.D_ENTITIES EN JOIN AP_APPLICATIONS.D_ENTITY_ATTRIBUTES ENA ON EN.ID = ENA.ENTITY
            WHERE TYPE = 'INTERFACE' AND MODULE = 'STATISTIC' AND PURPOSE = 'TABLE') 
LOOP
    BEGIN
        WITH DATA AS
        (SELECT K.VALUE STR FROM DUAL)
        SELECT TRIM(REGEXP_SUBSTR(STR, '[^;]+', 1, 1)) MASTER, TRIM(REGEXP_SUBSTR(STR, '[^;]+', 1, 2)) DETAIL INTO INMASTERTABLE, INDETAILTABLE
        FROM DATA;

        EXECUTE IMMEDIATE 'DELETE FROM T_STATISTIC_TABLES WHERE ENTITY = AP_APPLICATIONS.PK_D_ENTITIES.GET_ENTITY('''||K.NAME||''') AND STAT_DATE = :inDate AND TABLE_NAME = '''||INDETAILTABLE||''' AND MASTER_TABLE_NAME = '''||INMASTERTABLE||'''' USING inDate;

        BEGIN
            EXECUTE IMMEDIATE 'INSERT INTO T_STATISTIC_TABLES 
            SELECT AP_APPLICATIONS.PK_D_ENTITIES.GET_ENTITY('''||K.NAME||''') ENTITY, TRUNC(M.ROW_UPDATE_DATETIME) STAT_DATE, M.ROW_STATUS, '''||INDETAILTABLE||''' TABLE_NAME, '''||INMASTERTABLE||''' TABLE_NAME, COUNT(D.ROW_NUMBER) ROW_COUNT 
            FROM KONDOR_APP.'||INDETAILTABLE||' D RIGHT JOIN KONDOR_APP.'||INMASTERTABLE||' M ON M.ROW_NUMBER = D.ROW_NUMBER
            WHERE TRUNC(M.ROW_UPDATE_DATETIME) = :inDate GROUP BY M.ROW_STATUS, TRUNC(M.ROW_UPDATE_DATETIME)' USING inDate;
        EXCEPTION WHEN OTHERS THEN
            BEGIN
                EXECUTE IMMEDIATE 'INSERT INTO T_STATISTIC_TABLES 
                SELECT AP_APPLICATIONS.PK_D_ENTITIES.GET_ENTITY('''||K.NAME||''') ENTITY, TRUNC(M.ROW_UPDATE_DATETIME) STAT_DATE, M.ROW_STATUS, '''||INDETAILTABLE||''' TABLE_NAME, '''||INMASTERTABLE||''' TABLE_NAME, COUNT(D.LEGACY_ROW_NUMBER) ROW_COUNT 
                FROM KONDOR_APP.'||INDETAILTABLE||' D RIGHT JOIN KONDOR_APP.'||INMASTERTABLE||' M ON M.LEGACY_ROW_NUMBER = D.LEGACY_ROW_NUMBER
                WHERE TRUNC(M.ROW_UPDATE_DATETIME) = :inDate GROUP BY M.ROW_STATUS, TRUNC(M.ROW_UPDATE_DATETIME)' USING inDate;
                EXCEPTION WHEN OTHERS THEN
                    EXECUTE IMMEDIATE 'INSERT INTO T_STATISTIC_TABLES 
                    SELECT AP_APPLICATIONS.PK_D_ENTITIES.GET_ENTITY('''||K.NAME||''') ENTITY, TRUNC(M.ROW_CREATE_DATETIME) STAT_DATE, M.ROW_STATUS, '''||INDETAILTABLE||''' TABLE_NAME, '''||INMASTERTABLE||''' TABLE_NAME, COUNT(D.LEGACY_ROW_NUMBER) ROW_COUNT 
                    FROM KONDOR_APP.'||INDETAILTABLE||' D RIGHT JOIN KONDOR_APP.'||INMASTERTABLE||' M ON M.LEGACY_ROW_NUMBER = D.LEGACY_ROW_NUMBER
                    WHERE TRUNC(M.ROW_CREATE_DATETIME) = :inDate GROUP BY M.ROW_STATUS, TRUNC(M.ROW_CREATE_DATETIME)' USING inDate;
            END;
        END;

        COMMIT;

    EXCEPTION 
        WHEN OTHERS THEN 

        ROLLBACK;
    END;
END LOOP;

END;

FUNCTION GET_REPORT(reportDate DATE default trunc(sysdate) - 1) RETURN VARCHAR2
AS
l_html_1 VARCHAR2(32767) default '<!DOCTYPE html>
<html lang="en">
<head>
<title>CSS Template</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

</head>
<body>

<h3 style="padding-left: 30px;"><span style="font-size: 14px;">&nbsp;</span></h3>
<table style="width: 900px; background-color: #fafafa; color: #595959; padding-left: 30px; padding-right: 30px;">';
l_html_2 VARCHAR2(32767) default '<tbody>
<tr>
<td>
	<h3 style="padding-left: 30px; color: #595959;"><strong>Integration Log [$environment]</strong></h3>
	<h3 style="padding-left: 30px; color: #595959;"><strong>Host: [$host] </h3>
    <h3 style="padding-left: 30px; color: #595959;"><strong>Date: [$dateTime]</strong></h3>
	<hr />
	<table style="width: 600px; color: #595959;">
		<tbody>
		<tr>
		<td style="width: 200px;" colspan="3"><strong>Statistic</strong></td>
		</tr>
		<tr>
		<td style="width: 200px;" colspan="3">Processed data</td>
		</tr>
		<tr>
		<td style="width: 150px;">
		<p><strong>SUCCESS (P)</strong></p>
		<p><strong>ERROR (E)</strong></p>
		<p><strong>NEW (N)</strong></p>
		<p><strong>OTHER</strong></p>
		<p><strong>Total</strong></p>
		</td>
		<td style="width: 100px; text-align:right">
		<p><strong>[$successPercentage] %</strong></p>
		<p><strong>[$errorPercentage] %</strong></p>
		<p><strong>[$newPercentage] %</strong></p>
		<p><strong>[$otherPercentage] %</strong></p>
		<p><strong>100 %</strong></p>
		</td>
		<td style="width: 100px;  text-align:right">
		<p><strong>[$successTotalNum]</strong></p>
		<p><strong>[$errorTotalNum]</strong></p>
		<p><strong>[$newTotalNum]</strong></p>
		<p><strong>[$otherTotalNum]</strong></p>
		<p><strong>[$sumTotalNum]</strong></p>
		</td>
        <td style="width: 250px;">
		<p><strong>&nbsp;</strong></p>
		<p><strong>&nbsp;</strong></p>
		<p><strong>&nbsp;</strong></p>
		<p><strong>&nbsp;</strong></p>
		<p><strong>&nbsp;</strong></p>
		</td>
		</tr>
		</tbody>
	</table>
    <br>
	<table style="width: 100%; color: #595959;">
		<tr>
			<td style="background-color: #ccffcc; width: [$successPercentage]%;">[$successPercentage]%</td>
			<td style="background-color: #ffc2b3; width: [$errorPercentage]%;">[$errorPercentage]%</td>
			<td style="background-color: #ccccff; width: [$newPercentage]%;">[$newPercentage]%</td>
			<td style="background-color: #ffd9b3; width: [$otherPercentage]%;">[$otherPercentage]%</td>
		</tr>
	</table>
	<hr />';
    l_html_3 VARCHAR2(32767);
    l_html_3_dummy VARCHAR2(32767) default '<table style="width: 840px; color: #595959;">
		<tr>
		<td style="background-color: #d9d9d9; width: 440px;"><strong>Entity: [$entityName]</strong></td>
		<td style="background-color: #d9d9d9; width: 100px;">SUCCESS</td>
		<td style="background-color: #d9d9d9; width: 100px;">ERROR</td>
		<td style="background-color: #d9d9d9; width: 100px;">NEW</td>
		<td style="background-color: #d9d9d9; width: 100px;">OTHER</td>
		</tr>';
    l_html_4 VARCHAR2(32767);
    l_html_4_dummy VARCHAR2(32767) default '<tr>
		<td style="background-color: #f2f2f2;">[$tableName]</td>
		<td style="background-color: #f2f2f2;">[$successTotalNum]</td>
		<td style="background-color: #f2f2f2;">[$errorTotalNum]</td>
		<td style="background-color: #f2f2f2;">[$newTotalNum]</td>
		<td style="background-color: #f2f2f2;">[$otherTotalNum]</td>
		</tr>';
    l_html_5 VARCHAR2(32767) default '</table>
    <br>';

    l_html_6 VARCHAR2(32767) default '</td>
</tr>
</tbody>
</table>

</body>
</html>';

    successPercentage   number;
    errorPercentage     number;
    newPercentage       number;
    otherPercentage     number;
    sumPercentage       number;
    successTotalNum     number;
    errorTotalNum       number;
    newTotalNum         number;
    otherTotalNum       number;
    sumTotalNum         number;

BEGIN

    select 
            sum(successTotalNum) successTotalNum,  
            sum(errorTotalNum),
            sum(newTotalNum),
            sum(otherTotalNum),
            sum(sumTotalNum),
            round(sum(successTotalNum)*100/sum(sumTotalNum),0),
            round(sum(errorTotalNum)*100/sum(sumTotalNum),0),
            round(sum(newTotalNum)*100/sum(sumTotalNum),0),
            round(sum(otherTotalNum)*100/sum(sumTotalNum),0)
            into successTotalNum,
                        errorTotalNum,
                        newTotalNum,
                        otherTotalNum,
                        sumTotalNum,
                        successPercentage,
                        errorPercentage,
                        newPercentage,
                        otherPercentage
            from (
            select 
                    nvl(case when row_status = 'P' then sum(row_count) end,0)                                                   successTotalNum, 
                    nvl(case when row_status = 'E' then sum(row_count) end,0)                                                   errorTotalNum, 
                    nvl(case when row_status = 'N' then sum(row_count) end,0)                                                   newTotalNum,
                    nvl(case when row_status not in ('P','E','N') then sum(row_count) end,0)                                    otherTotalNum,
                    sum(row_count)                                                                                              sumTotalNum
                from AP_LOG.t_statistic ts 
                join ap_log.t_statistic_tables tst 
                    on ts.entity = tst.entity and ts.stat_date = tst.stat_date
                join ap_applications.d_entities de
                    on ts.entity = de.id
                where ts.stat_date = reportDate
                group by row_status);

  l_html_2 := replace(l_html_2,'[$environment]',AP_UTIL.PK_CONSTANTS.ENVIRONMENT);
  l_html_2 := replace(l_html_2,'[$host]',AP_UTIL.PK_CONSTANTS.HOST);
  l_html_2 := replace(l_html_2,'[$dateTime]',to_char(reportDate, 'dd.mm.yyyy'));

  l_html_2 := replace(l_html_2,'[$successTotalNum]', successTotalNum);
  l_html_2 := replace(l_html_2,'[$errorTotalNum]', errorTotalNum);
  l_html_2 := replace(l_html_2,'[$newTotalNum]', newTotalNum);
  l_html_2 := replace(l_html_2,'[$otherTotalNum]', otherTotalNum);
  l_html_2 := replace(l_html_2,'[$sumTotalNum]', sumTotalNum);
  l_html_2 := replace(l_html_2,'[$successPercentage]', successPercentage);
  l_html_2 := replace(l_html_2,'[$errorPercentage]', errorPercentage);
  l_html_2 := replace(l_html_2,'[$newPercentage]', newPercentage);
  l_html_2 := replace(l_html_2,'[$otherPercentage]', otherPercentage);

  FOR K IN (select ID, NAME, ts.process_time 
  from ap_applications.d_entities de 
  join ap_log.t_statistic ts on de.id = ts.entity 
  where type = 'INTERFACE' and ts.STAT_DATE = reportDate
  order by NAME)
  LOOP
    l_html_3 := l_html_3 || l_html_3_dummy;
    l_html_3 := replace(l_html_3,'[$entityName]', K.NAME ||  ' ('||k.process_time||' sec)');

    FOR J IN (
        select entity, stat_date, table_name,
            sum(successTotalNum) successTotalNum,
            sum(errorTotalNum) errorTotalNum,
            sum(newTotalNum) newTotalNum,
            sum(otherTotalNum) otherTotalNum
            from (
            SELECT 
                        tst.entity, tst.stat_date, tst.row_status, tst.table_name,
                        nvl(case when row_status = 'P' then sum(row_count) end,0)                                                   successTotalNum, 
                        nvl(case when row_status = 'E' then sum(row_count) end,0)                                                   errorTotalNum, 
                        nvl(case when row_status = 'N' then sum(row_count) end,0)                                                   newTotalNum,
                        nvl(case when row_status not in ('P','E','N') then sum(row_count) end,0)                                    otherTotalNum,
                        sum(row_count)
                    FROM ap_log.t_statistic_tables  tst join ap_log.t_statistic ts on ts.entity = tst.entity and ts.stat_date = tst.stat_date
                    WHERE tst.entity = K.ID AND tst.STAT_DATE = reportDate
                    group by tst.entity, tst.stat_date, tst.row_status, tst.table_name)
            group by entity, stat_date, table_name
        )
    LOOP
        l_html_4 := l_html_4 || l_html_4_dummy;
        l_html_4 := replace(l_html_4,'[$tableName]', j.table_name);
        l_html_4 := replace(l_html_4,'[$successTotalNum]', j.successTotalNum);
        l_html_4 := replace(l_html_4,'[$errorTotalNum]', j.errorTotalNum);
        l_html_4 := replace(l_html_4,'[$newTotalNum]', j.newTotalNum);
        l_html_4 := replace(l_html_4,'[$otherTotalNum]', j.otherTotalNum);
    END LOOP;

    l_html_3 := l_html_3 || l_html_4 || l_html_5;
    l_html_4 := '';

  END LOOP;

  RETURN l_html_1 || l_html_2 || l_html_3 || l_html_6;

END;

PROCEDURE PROCESS(inDate date default TRUNC(SYSDATE)-1)
AS
BEGIN
    SET_T_STATISTIC(inDate);
    SET_T_STATISTIC_TABLES(inDate);

    FOR K IN (SELECT VALUE FROM AP_APPLICATIONS.D_ENTITY_ATTRIBUTES WHERE ENTITY = AP_APPLICATIONS.PK_D_ENTITIES.GET_ENTITY('STATISTIC') AND MODULE = 'MAILING' AND PURPOSE = 'NOTIFICATION' AND NAME = 'MAILING_LIST')
    LOOP
        AP_APPLICATIONS.PK_MAILING.ADD_MAIL_TO_QUEUE('Daily report - integration statistic [' || AP_UTIL.PK_CONSTANTS.ENVIRONMENT || ']' , GET_REPORT(inDate), '', sysdate, K.VALUE, 'HTML', USER);
    END LOOP;


END;


END PK_STATISTIC;

/

  GRANT EXECUTE ON "AP_LOG"."PK_STATISTIC" TO "AP_UTIL";
--------------------------------------------------------
--  DDL for Package Body PK_T_APP_LOG
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "AP_LOG"."PK_T_APP_LOG" AS

    FUNCTION SET_T_APP_LOG 
            (   RESPONSE	        CLOB,
                ENTITY_NAME 	    VARCHAR2,
                MODULE              VARCHAR2,
                STATUS	            VARCHAR2    DEFAULT NULL,
                REQUEST	            CLOB        DEFAULT NULL,
                START_TIME	        DATE        DEFAULT SYSDATE,
                END_TIME	        DATE        DEFAULT SYSDATE,
                NOTIFIABLE	        VARCHAR2    DEFAULT NULL,
                NOTIFICATION_SENT	VARCHAR2    DEFAULT NULL,
                USERNAME	        VARCHAR2    DEFAULT NULL,
                CREATE_USER	        VARCHAR2    DEFAULT USER    )
    RETURN T_APP_LOG.ID%TYPE
    AS
        PRAGMA AUTONOMOUS_TRANSACTION;
        V_ID        T_APP_LOG.ID%TYPE;
    BEGIN
        
        INSERT INTO T_APP_LOG (ENTITY, REQUEST, RESPONSE, STATUS, MODULE, START_TIME, END_TIME, NOTIFIABLE, NOTIFICATION_SENT, USERNAME, CREATE_USER) 
        VALUES (AP_APPLICATIONS.PK_D_ENTITIES.GET_ENTITY(ENTITY_NAME), REQUEST, RESPONSE, STATUS, MODULE, START_TIME, END_TIME, NOTIFIABLE, NOTIFICATION_SENT, USERNAME, CREATE_USER)
        RETURN ID INTO V_ID;
        
        COMMIT;
        
        RETURN V_ID;
        
        EXCEPTION WHEN OTHERS
        THEN
        RAISE;
        ROLLBACK;
        
        RETURN -1;
    END SET_T_APP_LOG;

END PK_T_APP_LOG;

/

  GRANT EXECUTE ON "AP_LOG"."PK_T_APP_LOG" TO "AP_UTIL";
--------------------------------------------------------
--  Constraints for Table D_LOG_STATUS
--------------------------------------------------------

  ALTER TABLE "AP_LOG"."D_LOG_STATUS" MODIFY ("STATUS" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."D_LOG_STATUS" ADD CONSTRAINT "D_LOG_STATUS_PK" PRIMARY KEY ("STATUS")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP"  ENABLE;
  ALTER TABLE "AP_LOG"."D_LOG_STATUS" MODIFY ("CREATE_DATE" NOT NULL ENABLE);
--------------------------------------------------------
--  Constraints for Table T_APP_LOG
--------------------------------------------------------

  ALTER TABLE "AP_LOG"."T_APP_LOG" MODIFY ("ID" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_APP_LOG" MODIFY ("STATUS" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_APP_LOG" ADD CONSTRAINT "T_APP_LOG_PK" PRIMARY KEY ("ID")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP"  ENABLE;
--------------------------------------------------------
--  Constraints for Table T_LOG
--------------------------------------------------------

  ALTER TABLE "AP_LOG"."T_LOG" MODIFY ("ID" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_LOG" MODIFY ("STATUS" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_LOG" ADD CONSTRAINT "T_LOG_PK" PRIMARY KEY ("ID")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP"  ENABLE;
--------------------------------------------------------
--  Constraints for Table T_STATISTIC
--------------------------------------------------------

  ALTER TABLE "AP_LOG"."T_STATISTIC" MODIFY ("ENTITY" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_STATISTIC" MODIFY ("STAT_DATE" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_STATISTIC" MODIFY ("PROCESS_TIME" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_STATISTIC" ADD CONSTRAINT "T_STATISTIC_PK" PRIMARY KEY ("STAT_DATE", "ENTITY")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP"  ENABLE;
--------------------------------------------------------
--  Constraints for Table T_STATISTIC_TABLES
--------------------------------------------------------

  ALTER TABLE "AP_LOG"."T_STATISTIC_TABLES" MODIFY ("ENTITY" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_STATISTIC_TABLES" MODIFY ("STAT_DATE" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_STATISTIC_TABLES" MODIFY ("ROW_STATUS" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_STATISTIC_TABLES" MODIFY ("TABLE_NAME" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_STATISTIC_TABLES" MODIFY ("MASTER_TABLE_NAME" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_STATISTIC_TABLES" MODIFY ("ROW_COUNT" NOT NULL ENABLE);
  ALTER TABLE "AP_LOG"."T_STATISTIC_TABLES" ADD CONSTRAINT "T_STATISTIC_TABLES_PK" PRIMARY KEY ("ENTITY", "STAT_DATE", "TABLE_NAME", "ROW_STATUS")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "TBS_UTIL_APP"  ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table T_APP_LOG
--------------------------------------------------------

  ALTER TABLE "AP_LOG"."T_APP_LOG" ADD CONSTRAINT "T_APP_LOG_FK1" FOREIGN KEY ("ENTITY")
	  REFERENCES "AP_APPLICATIONS"."D_ENTITIES" ("ID") ENABLE;
  ALTER TABLE "AP_LOG"."T_APP_LOG" ADD CONSTRAINT "T_APP_LOG_FK2" FOREIGN KEY ("USERNAME")
	  REFERENCES "AP_APPLICATIONS"."D_USERS" ("USERNAME") ENABLE;
  ALTER TABLE "AP_LOG"."T_APP_LOG" ADD CONSTRAINT "T_APP_LOG_FK3" FOREIGN KEY ("STATUS")
	  REFERENCES "AP_LOG"."D_LOG_STATUS" ("STATUS") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table T_LOG
--------------------------------------------------------

  ALTER TABLE "AP_LOG"."T_LOG" ADD CONSTRAINT "T_LOG_FK1" FOREIGN KEY ("STATUS")
	  REFERENCES "AP_LOG"."D_LOG_STATUS" ("STATUS") ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table T_STATISTIC_TABLES
--------------------------------------------------------

  ALTER TABLE "AP_LOG"."T_STATISTIC_TABLES" ADD CONSTRAINT "T_STATISTIC_TABLES_FK1" FOREIGN KEY ("STAT_DATE", "ENTITY")
	  REFERENCES "AP_LOG"."T_STATISTIC" ("STAT_DATE", "ENTITY") ON DELETE CASCADE ENABLE;
