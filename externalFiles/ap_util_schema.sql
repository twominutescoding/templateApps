--------------------------------------------------------
--  File created - srijeda-veljaèe-18-2026   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Package NUMBER_API
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "AP_UTIL"."NUMBER_API" AS 

  /* TODO enter package declarations (types, exceptions, methods etc) here */ 
  FUNCTION STRING_TO_NUMBER(inString VARCHAR2) RETURN NUMBER;

END NUMBER_API;

/

  GRANT EXECUTE ON "AP_UTIL"."NUMBER_API" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."NUMBER_API" TO "KONDOR";
  GRANT EXECUTE ON "AP_UTIL"."NUMBER_API" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."NUMBER_API" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."NUMBER_API" TO "APP_SUPRISK";
  GRANT DEBUG ON "AP_UTIL"."NUMBER_API" TO "APP_SUPRISK";
--------------------------------------------------------
--  DDL for Package PK_CONSTANTS
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "AP_UTIL"."PK_CONSTANTS" AS 

  /* TODO enter package declarations (types, exceptions, methods etc) here */ 
  
  ENVIRONMENT                           CONSTANT VARCHAR2(5)            := 'T5';
  ENVIRONMENT_DESC                      CONSTANT VARCHAR2(100)          := 'Test';
  HOST                                  CONSTANT VARCHAR2(200)          := 'covid-t.konzum.hr';
  
  DEFAUTL_MAIL_ADDRESS                  CONSTANT VARCHAR2(200)          := 'ne-odgovaraj@konzum.hr';
  DEFAULT_SMTP_SERVER                   CONSTANT VARCHAR2(200)          := 'smtp.konzum.hr';
  DEFAULT_SMTP_PORT                     CONSTANT NUMBER                 := 25;

END PK_CONSTANTS;

/

  GRANT EXECUTE ON "AP_UTIL"."PK_CONSTANTS" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."PK_CONSTANTS" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."PK_CONSTANTS" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."PK_CONSTANTS" TO "KONDOR";
--------------------------------------------------------
--  DDL for Package PK_MAILING
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "AP_UTIL"."PK_MAILING" AS 

  /* TODO enter package declarations (types, exceptions, methods etc) here */ 
    PROCEDURE send_mail (
        p_to          IN            VARCHAR2,
        p_from        IN            VARCHAR2,
        p_message     IN            VARCHAR2,
        p_smtp_host   IN            VARCHAR2 DEFAULT PK_CONSTANTS.DEFAULT_SMTP_SERVER,
        p_smtp_port   IN            NUMBER DEFAULT PK_CONSTANTS.DEFAULT_SMTP_PORT
    );

    PROCEDURE send_mail (
        p_to          IN            VARCHAR2,
        p_from        IN            VARCHAR2,
        p_subject     IN            VARCHAR2,
        p_text_msg    IN            VARCHAR2 DEFAULT NULL,
        p_html_msg    IN            CLOB DEFAULT NULL,
        p_smtp_host   IN            VARCHAR2 DEFAULT PK_CONSTANTS.DEFAULT_SMTP_SERVER,
        p_smtp_port   IN            NUMBER DEFAULT PK_CONSTANTS.DEFAULT_SMTP_PORT
    );

    PROCEDURE send_mail (
        p_to          IN            VARCHAR2,
        p_from        IN            VARCHAR2,
        p_subject     IN            VARCHAR2,
        p_text_msg    IN            VARCHAR2 DEFAULT NULL,
        p_html_msg    IN            VARCHAR2 DEFAULT NULL,
        p_smtp_host   IN            VARCHAR2 DEFAULT PK_CONSTANTS.DEFAULT_SMTP_SERVER,
        p_smtp_port   IN            NUMBER DEFAULT PK_CONSTANTS.DEFAULT_SMTP_PORT
    );

END PK_MAILING;

/

  GRANT EXECUTE ON "AP_UTIL"."PK_MAILING" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."PK_MAILING" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."PK_MAILING" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."PK_MAILING" TO "KONDOR";
--------------------------------------------------------
--  DDL for Package PK_SOAP
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "AP_UTIL"."PK_SOAP" AS 

  /* TODO enter package declarations (types, exceptions, methods etc) here */ 
    TYPE PK_SOAP_HEADER_PARAM IS RECORD (
        HEADER_KEY          VARCHAR2(200),
        HEADER_VALUE        VARCHAR2(1000)
    );
    
    TYPE PK_SOAP_HEADER_PARAMS IS TABLE OF PK_SOAP_HEADER_PARAM;

    TYPE PK_SOAP_PARAMS IS RECORD (
        URL                 VARCHAR2(1000),
        METHOD              VARCHAR2(100),
        USERNAME            VARCHAR2(200),
        PASSWORD            VARCHAR2(200),
        HEADER_VALUES       PK_SOAP_HEADER_PARAMS
    );

   
    TYPE XML_FIELDS IS TABLE OF CLOB INDEX BY VARCHAR2(4000);
    
    TYPE XML_BLOCK IS RECORD (
        BLOCK_ID        VARCHAR2(200),
        VALS            XML_FIELDS
    );
    
    TYPE XML_BLOCKS IS TABLE OF XML_BLOCK INDEX BY PLS_INTEGER;
    
    FUNCTION MAKE_WS_CALL(IN_XML_BLOCKS XML_BLOCKS, IN_ENTITY AP_APPLICATIONS.D_ENTITIES.ID%TYPE, INPURPOSE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.PURPOSE%TYPE DEFAULT NULL) RETURN XMLTYPE;
    
    FUNCTION GET_PK_SOAP_PARAMS(IN_ENTITY AP_APPLICATIONS.D_ENTITIES.ID%TYPE, INPURPOSE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.PURPOSE%TYPE DEFAULT NULL) RETURN PK_SOAP_PARAMS;

    PROCEDURE CALL(L_XML IN OUT XMLTYPE, PARAMS PK_SOAP_PARAMS);



END PK_SOAP;

/

  GRANT EXECUTE ON "AP_UTIL"."PK_SOAP" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."PK_SOAP" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."PK_SOAP" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."PK_SOAP" TO "KONDOR";
  GRANT EXECUTE ON "AP_UTIL"."PK_SOAP" TO "APP_KAMPIC";
  GRANT DEBUG ON "AP_UTIL"."PK_SOAP" TO "APP_KAMPIC";
--------------------------------------------------------
--  DDL for Package PK_VARIABLES
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "AP_UTIL"."PK_VARIABLES" AS 

  /* TODO enter package declarations (types, exceptions, methods etc) here */ 

    TYPE TBL_MAP IS TABLE OF AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.VALUE%TYPE INDEX BY AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.NAME%TYPE;

    FUNCTION GETPARAMS (IN_ENTITY AP_APPLICATIONS.D_ENTITIES.ID%TYPE, INMODULE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.MODULE%TYPE, INPURPOSE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.PURPOSE%TYPE DEFAULT NULL) RETURN TBL_MAP;

    FUNCTION GETVALUE (IN_ENTITY AP_APPLICATIONS.D_ENTITIES.ID%TYPE, INMODULE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.MODULE%TYPE, INNAME AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.NAME%TYPE, INPURPOSE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.PURPOSE%TYPE DEFAULT NULL) RETURN VARCHAR2;

END PK_VARIABLES;

/

  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "KONDOR";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "APP_CUST_MENU";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "APP_CUST_MENU2";
  GRANT DEBUG ON "AP_UTIL"."PK_VARIABLES" TO "APP_CUST_MENU2";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "APP_CUST_MENU_02";
  GRANT DEBUG ON "AP_UTIL"."PK_VARIABLES" TO "APP_CUST_MENU_02";
--------------------------------------------------------
--  DDL for Package STRING_API
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "AP_UTIL"."STRING_API" AS 

    -- --------------------------------------------------------------------------
    -- Name         : https://oracle-base.com/dba/miscellaneous/string_api.sql
    -- Author       : Tim Hall
    -- Description  : A package to hold string utilities.
    -- Requirements : 
    -- Amendments   :
    --   When         Who       What
    --   ===========  ========  =================================================
    --   02-DEC-2004  Tim Hall  Initial Creation
    --   19-JAN-2017  Tim Hall  Add get_uri_paramter_value function.
    -- --------------------------------------------------------------------------

-- Public types
    TYPE t_split_array IS
        TABLE OF VARCHAR2(4000);
    FUNCTION split_text (
        p_text        IN            CLOB,
        p_delimeter   IN            VARCHAR2 DEFAULT ','
    ) RETURN t_split_array;

    PROCEDURE print_clob (
        p_clob IN CLOB
    );

    PROCEDURE print_clob_old (
        p_clob IN CLOB
    );

    PROCEDURE print_clob_htp (
        p_clob IN CLOB
    );

    PROCEDURE print_clob_htp_old (
        p_clob IN CLOB
    );

    FUNCTION get_uri_paramter_value (
        p_uri          IN             VARCHAR2,
        p_param_name   IN             VARCHAR2
    ) RETURN VARCHAR2;
    
    function encoding_utf8(p_text_in varchar2) return varchar2;

END string_api;

/

  GRANT EXECUTE ON "AP_UTIL"."STRING_API" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."STRING_API" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."STRING_API" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."STRING_API" TO "KONDOR";
--------------------------------------------------------
--  DDL for Package Body NUMBER_API
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "AP_UTIL"."NUMBER_API" AS

FUNCTION STRING_TO_NUMBER(inString VARCHAR2) RETURN NUMBER
AS
V_RETURN        NUMBER;
BEGIN

        RETURN TO_NUMBER(REPLACE(inString, '.', ','));
    
        EXCEPTION WHEN OTHERS THEN
    
        RETURN TO_NUMBER(REPLACE(inString, ',', '.'));
END;

END NUMBER_API;

/

  GRANT EXECUTE ON "AP_UTIL"."NUMBER_API" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."NUMBER_API" TO "KONDOR";
  GRANT EXECUTE ON "AP_UTIL"."NUMBER_API" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."NUMBER_API" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."NUMBER_API" TO "APP_SUPRISK";
  GRANT DEBUG ON "AP_UTIL"."NUMBER_API" TO "APP_SUPRISK";
--------------------------------------------------------
--  DDL for Package Body PK_MAILING
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "AP_UTIL"."PK_MAILING" AS

    PROCEDURE send_mail (
        p_to          IN            VARCHAR2,
        p_from        IN            VARCHAR2,
        p_message     IN            VARCHAR2,
        p_smtp_host   IN            VARCHAR2 DEFAULT PK_CONSTANTS.DEFAULT_SMTP_SERVER,
        p_smtp_port   IN            NUMBER DEFAULT PK_CONSTANTS.DEFAULT_SMTP_PORT
    ) AS
        l_mail_conn utl_smtp.connection;
    BEGIN
        l_mail_conn := utl_smtp.open_connection(p_smtp_host, p_smtp_port);
        utl_smtp.helo(l_mail_conn, p_smtp_host);
        utl_smtp.mail(l_mail_conn, p_from);
        utl_smtp.rcpt(l_mail_conn, p_to);
        utl_smtp.data(l_mail_conn, p_message
                                   || utl_tcp.crlf
                                   || utl_tcp.crlf);

        utl_smtp.quit(l_mail_conn);
    END;

    PROCEDURE send_mail (
        p_to          IN            VARCHAR2,
        p_from        IN            VARCHAR2,
        p_subject     IN            VARCHAR2,
        p_message     IN            VARCHAR2,
        p_smtp_host   IN            VARCHAR2 DEFAULT PK_CONSTANTS.DEFAULT_SMTP_SERVER,
        p_smtp_port   IN            NUMBER DEFAULT PK_CONSTANTS.DEFAULT_SMTP_PORT
    ) AS
        l_mail_conn utl_smtp.connection;
        PROCEDURE process_recipients (
            p_mail_conn   IN OUT        utl_smtp.connection,
            p_list        IN            VARCHAR2
        ) AS
            l_tab string_api.t_split_array;
        BEGIN
            IF TRIM(p_list) IS NOT NULL THEN
                l_tab := string_api.split_text(p_list);
                FOR i IN 1..l_tab.count LOOP 
                utl_smtp.rcpt(p_mail_conn, trim(l_tab(i)));
                DBMS_OUTPUT.PUT_LINE(trim(l_tab(i)));
                END LOOP;

            END IF;
        END;
    BEGIN
        l_mail_conn := utl_smtp.open_connection(p_smtp_host, p_smtp_port);
        utl_smtp.helo(l_mail_conn, p_smtp_host);
        utl_smtp.mail(l_mail_conn, p_from);
        process_recipients(l_mail_conn, p_to);
        utl_smtp.open_data(l_mail_conn);
        utl_smtp.write_data(l_mail_conn, 'Date: '
                                         || TO_CHAR(SYSDATE, 'DD.MM.YYYY HH24:MI:SS')
                                         || utl_tcp.crlf);

        utl_smtp.write_data(l_mail_conn, 'To: '
                                         || p_to
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'From: '
                                         || p_from
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Subject: '
                                         || p_subject
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Reply-To: '
                                         || p_from
                                         || utl_tcp.crlf
                                         || utl_tcp.crlf);

        utl_smtp.write_data(l_mail_conn, p_message
                                         || utl_tcp.crlf
                                         || utl_tcp.crlf);

        utl_smtp.close_data(l_mail_conn);
        utl_smtp.quit(l_mail_conn);
    END;

    PROCEDURE send_mail (
        p_to          IN            VARCHAR2,
        p_from        IN            VARCHAR2,
        p_subject     IN            VARCHAR2,
        p_text_msg    IN            VARCHAR2 DEFAULT NULL,
        p_html_msg    IN            VARCHAR2 DEFAULT NULL,
        p_smtp_host   IN            VARCHAR2 DEFAULT PK_CONSTANTS.DEFAULT_SMTP_SERVER,
        p_smtp_port   IN            NUMBER DEFAULT PK_CONSTANTS.DEFAULT_SMTP_PORT
    ) AS
        l_mail_conn   utl_smtp.connection;
        l_boundary    VARCHAR2(50) := '----=*#abc1234321cba#*=';
        PROCEDURE process_recipients (
            p_mail_conn   IN OUT        utl_smtp.connection,
            p_list        IN            VARCHAR2
        ) AS
            l_tab string_api.t_split_array;
        BEGIN
            IF TRIM(p_list) IS NOT NULL THEN
                l_tab := string_api.split_text(p_list);
                FOR i IN 1..l_tab.count LOOP 
                utl_smtp.rcpt(p_mail_conn, trim(l_tab(i)));
                DBMS_OUTPUT.PUT_LINE(trim(l_tab(i)));
                END LOOP;

            END IF;
        END;
    BEGIN
        --DBMS_OUTPUT.PUT_LINE('Send Mail TEXT!!!');
        l_mail_conn := utl_smtp.open_connection(p_smtp_host, p_smtp_port);
        utl_smtp.helo(l_mail_conn, p_smtp_host);
        utl_smtp.mail(l_mail_conn, p_from);
        process_recipients(l_mail_conn, p_to);
        utl_smtp.open_data(l_mail_conn);
        utl_smtp.write_data(l_mail_conn, 'Date: '
                                         || TO_CHAR(SYSDATE, 'DD.MM.YYYY HH24:MI:SS')
                                         || utl_tcp.crlf);

        utl_smtp.write_data(l_mail_conn, 'To: '
                                         || p_to
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'From: '
                                         || p_from
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Subject: '
                                         || p_subject
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Reply-To: '
                                         || p_from
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'MIME-Version: 1.0' || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Content-Type: multipart/alternative; boundary="'
                                         || l_boundary
                                         || '"'
                                         || utl_tcp.crlf
                                         || utl_tcp.crlf);

        IF p_text_msg IS NOT NULL THEN
            utl_smtp.write_data(l_mail_conn, '--'
                                             || l_boundary
                                             || utl_tcp.crlf);
            utl_smtp.write_data(l_mail_conn, 'Content-Type: text/plain; charset="iso-8859-1"'
                                             || utl_tcp.crlf
                                             || utl_tcp.crlf);

            utl_smtp.write_data(l_mail_conn, p_text_msg);
            utl_smtp.write_data(l_mail_conn, utl_tcp.crlf || utl_tcp.crlf);
        END IF;

        IF p_html_msg IS NOT NULL THEN
            utl_smtp.write_data(l_mail_conn, '--'
                                             || l_boundary
                                             || utl_tcp.crlf);
            utl_smtp.write_data(l_mail_conn, 'Content-Type: text/html; charset="iso-8859-1"'
                                             || utl_tcp.crlf
                                             || utl_tcp.crlf);
           
            utl_smtp.write_data(l_mail_conn, p_html_msg);
            utl_smtp.write_data(l_mail_conn, utl_tcp.crlf || utl_tcp.crlf);
        END IF;

        utl_smtp.write_data(l_mail_conn, '--'
                                         || l_boundary
                                         || '--'
                                         || utl_tcp.crlf);

        utl_smtp.close_data(l_mail_conn);
        utl_smtp.quit(l_mail_conn);
    END;

    PROCEDURE send_mail (
        p_to          IN            VARCHAR2,
        p_from        IN            VARCHAR2,
        p_subject     IN            VARCHAR2,
        p_text_msg    IN            VARCHAR2 DEFAULT NULL,
        p_html_msg    IN            CLOB DEFAULT NULL,
        p_smtp_host   IN            VARCHAR2 DEFAULT PK_CONSTANTS.DEFAULT_SMTP_SERVER,
        p_smtp_port   IN            NUMBER DEFAULT PK_CONSTANTS.DEFAULT_SMTP_PORT
    ) AS
        l_mail_conn   utl_smtp.connection;
        l_boundary    VARCHAR2(50) := '----=*#abc1234321cba#*=';
        l_step        PLS_INTEGER := 57;
        message_raw      RAW(32767); -- Adjust the size as needed
        PROCEDURE process_recipients (
            p_mail_conn   IN OUT        utl_smtp.connection,
            p_list        IN            VARCHAR2
        ) AS
            l_tab string_api.t_split_array;
        BEGIN
            IF TRIM(p_list) IS NOT NULL THEN
                l_tab := string_api.split_text(p_list);
                FOR i IN 1..l_tab.count LOOP 
                utl_smtp.rcpt(p_mail_conn, trim(l_tab(i)));
                DBMS_OUTPUT.PUT_LINE(trim(l_tab(i)));
                END LOOP;

            END IF;
        END;
    BEGIN
        --DBMS_OUTPUT.PUT_LINE('Send Mail CLOB, RAW data, that HR Charset can be transported!!!');
        l_mail_conn := utl_smtp.open_connection(p_smtp_host, p_smtp_port);
        utl_smtp.helo(l_mail_conn, p_smtp_host);
        utl_smtp.mail(l_mail_conn, p_from);
        process_recipients(l_mail_conn, p_to);
        utl_smtp.open_data(l_mail_conn);
        utl_smtp.write_data(l_mail_conn, 'Date: '
                                         || TO_CHAR(SYSDATE, 'DD.MM.YYYY HH24:MI:SS')
                                         || utl_tcp.crlf);

        utl_smtp.write_data(l_mail_conn, 'To: '
                                         || p_to
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'From: '
                                         || p_from
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Subject: '
                                         || p_subject
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Reply-To: '
                                         || p_from
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'MIME-Version: 1.0' || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Content-Type: multipart/alternative; boundary="'
                                         || l_boundary
                                         || '"'
                                         || utl_tcp.crlf
                                         || utl_tcp.crlf);

        IF p_text_msg IS NOT NULL THEN
            utl_smtp.write_data(l_mail_conn, '--'
                                             || l_boundary
                                             || utl_tcp.crlf);
--            utl_smtp.write_data(l_mail_conn, 'Content-Type: text/plain; charset="iso-8859-2"'
--                                             || utl_tcp.crlf
--                                             || utl_tcp.crlf);

            utl_smtp.write_data(l_mail_conn, 'Content-Type: text/plain'
                                             || utl_tcp.crlf
                                             || utl_tcp.crlf);

            utl_smtp.write_data(l_mail_conn, p_text_msg);
            utl_smtp.write_data(l_mail_conn, utl_tcp.crlf || utl_tcp.crlf);
        END IF;

        IF p_html_msg IS NOT NULL THEN
            utl_smtp.write_data(l_mail_conn, '--'
                                             || l_boundary
                                             || utl_tcp.crlf);
--            utl_smtp.write_data(l_mail_conn, 'Content-Type: text/html; charset="iso-8859-2"'
--                                             || utl_tcp.crlf
--                                             || utl_tcp.crlf);

            utl_smtp.write_data(l_mail_conn, 'Content-Type: text/html'
                                             || utl_tcp.crlf
                                             || utl_tcp.crlf);

            --utl_smtp.write_data(l_mail_conn, p_html_msg);

            FOR i IN 0..trunc((dbms_lob.getlength(p_html_msg) - 1) / l_step) 
            
            LOOP 
            
                --utl_smtp.write_data(l_mail_conn, dbms_lob.substr (p_html_msg, l_step, i * l_step + 1));
                message_raw := UTL_RAW.CAST_TO_RAW(dbms_lob.substr (p_html_msg, l_step, i * l_step + 1));
                utl_smtp.write_raw_data(l_mail_conn, message_raw);
            
            END LOOP;

            utl_smtp.write_data(l_mail_conn, utl_tcp.crlf || utl_tcp.crlf);
        END IF;

        utl_smtp.write_data(l_mail_conn, '--'
                                         || l_boundary
                                         || '--'
                                         || utl_tcp.crlf);

        utl_smtp.close_data(l_mail_conn);
        utl_smtp.quit(l_mail_conn);
    END;

    PROCEDURE send_mail (
        p_to            IN              VARCHAR2,
        p_from          IN              VARCHAR2,
        p_subject       IN              VARCHAR2,
        p_text_msg      IN              VARCHAR2 DEFAULT NULL,
        p_attach_name   IN              VARCHAR2 DEFAULT NULL,
        p_attach_mime   IN              VARCHAR2 DEFAULT NULL,
        p_attach_blob   IN              BLOB DEFAULT NULL,
        p_smtp_host     IN              VARCHAR2 DEFAULT PK_CONSTANTS.DEFAULT_SMTP_SERVER,
        p_smtp_port   IN            NUMBER DEFAULT PK_CONSTANTS.DEFAULT_SMTP_PORT
    ) AS
        l_mail_conn   utl_smtp.connection;
        l_boundary    VARCHAR2(50) := '----=*#abc1234321cba#*=';
        l_step        PLS_INTEGER := 57;
    BEGIN
        l_mail_conn := utl_smtp.open_connection(p_smtp_host, p_smtp_port);
        utl_smtp.helo(l_mail_conn, p_smtp_host);
        utl_smtp.mail(l_mail_conn, p_from);
        utl_smtp.rcpt(l_mail_conn, p_to);
        utl_smtp.open_data(l_mail_conn);
        utl_smtp.write_data(l_mail_conn, 'Date: '
                                         || TO_CHAR(SYSDATE, 'DD.MM.YYYY HH24:MI:SS')
                                         || utl_tcp.crlf);

        utl_smtp.write_data(l_mail_conn, 'To: '
                                         || p_to
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'From: '
                                         || p_from
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Subject: '
                                         || p_subject
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Reply-To: '
                                         || p_from
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'MIME-Version: 1.0' || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Content-Type: multipart/mixed; boundary="'
                                         || l_boundary
                                         || '"'
                                         || utl_tcp.crlf
                                         || utl_tcp.crlf);

        IF p_text_msg IS NOT NULL THEN
            utl_smtp.write_data(l_mail_conn, '--'
                                             || l_boundary
                                             || utl_tcp.crlf);
            utl_smtp.write_data(l_mail_conn, 'Content-Type: text/plain; charset="iso-8859-1"'
                                             || utl_tcp.crlf
                                             || utl_tcp.crlf);

            utl_smtp.write_data(l_mail_conn, p_text_msg);
            utl_smtp.write_data(l_mail_conn, utl_tcp.crlf || utl_tcp.crlf);
        END IF;

        IF p_attach_name IS NOT NULL THEN
            utl_smtp.write_data(l_mail_conn, '--'
                                             || l_boundary
                                             || utl_tcp.crlf);
            utl_smtp.write_data(l_mail_conn, 'Content-Type: '
                                             || p_attach_mime
                                             || '; name="'
                                             || p_attach_name
                                             || '"'
                                             || utl_tcp.crlf);

            utl_smtp.write_data(l_mail_conn, 'Content-Transfer-Encoding: base64' || utl_tcp.crlf);
            utl_smtp.write_data(l_mail_conn, 'Content-Disposition: attachment; filename="'
                                             || p_attach_name
                                             || '"'
                                             || utl_tcp.crlf
                                             || utl_tcp.crlf);

            FOR i IN 0..trunc((dbms_lob.getlength(p_attach_blob) - 1) / l_step) LOOP utl_smtp.write_data(l_mail_conn, utl_raw.cast_to_varchar2

            (utl_encode.base64_encode(dbms_lob.substr(p_attach_blob, l_step, i * l_step + 1)))
                                                                                                                      || utl_tcp.
                                                                                                                      crlf);
            END LOOP;

            utl_smtp.write_data(l_mail_conn, utl_tcp.crlf);
        END IF;

        utl_smtp.write_data(l_mail_conn, '--'
                                         || l_boundary
                                         || '--'
                                         || utl_tcp.crlf);

        utl_smtp.close_data(l_mail_conn);
        utl_smtp.quit(l_mail_conn);
    END;

    PROCEDURE send_mail (
        p_to            IN              VARCHAR2,
        p_from          IN              VARCHAR2,
        p_subject       IN              VARCHAR2,
        p_text_msg      IN              VARCHAR2 DEFAULT NULL,
        p_attach_name   IN              VARCHAR2 DEFAULT NULL,
        p_attach_mime   IN              VARCHAR2 DEFAULT NULL,
        p_attach_clob   IN              CLOB DEFAULT NULL,
        p_smtp_host     IN              VARCHAR2 DEFAULT PK_CONSTANTS.DEFAULT_SMTP_SERVER,
        p_smtp_port   IN            NUMBER DEFAULT PK_CONSTANTS.DEFAULT_SMTP_PORT
    ) AS
        l_mail_conn   utl_smtp.connection;
        l_boundary    VARCHAR2(50) := '----=*#abc1234321cba#*=';
        l_step        PLS_INTEGER := 12000; -- make sure you set a multiple of 3 not higher than 24573
    BEGIN
        l_mail_conn := utl_smtp.open_connection(p_smtp_host, p_smtp_port);
        utl_smtp.helo(l_mail_conn, p_smtp_host);
        utl_smtp.mail(l_mail_conn, p_from);
        utl_smtp.rcpt(l_mail_conn, p_to);
        utl_smtp.open_data(l_mail_conn);
        utl_smtp.write_data(l_mail_conn, 'Date: '
                                         || TO_CHAR(SYSDATE, 'DD.MM.YYYY HH24:MI:SS')
                                         || utl_tcp.crlf);

        utl_smtp.write_data(l_mail_conn, 'To: '
                                         || p_to
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'From: '
                                         || p_from
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Subject: '
                                         || p_subject
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Reply-To: '
                                         || p_from
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'MIME-Version: 1.0' || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Content-Type: multipart/mixed; boundary="'
                                         || l_boundary
                                         || '"'
                                         || utl_tcp.crlf
                                         || utl_tcp.crlf);

        IF p_text_msg IS NOT NULL THEN
            utl_smtp.write_data(l_mail_conn, '--'
                                             || l_boundary
                                             || utl_tcp.crlf);
            utl_smtp.write_data(l_mail_conn, 'Content-Type: text/plain; charset="iso-8859-1"'
                                             || utl_tcp.crlf
                                             || utl_tcp.crlf);

            utl_smtp.write_data(l_mail_conn, p_text_msg);
            utl_smtp.write_data(l_mail_conn, utl_tcp.crlf || utl_tcp.crlf);
        END IF;

        IF p_attach_name IS NOT NULL THEN
            utl_smtp.write_data(l_mail_conn, '--'
                                             || l_boundary
                                             || utl_tcp.crlf);
            utl_smtp.write_data(l_mail_conn, 'Content-Type: '
                                             || p_attach_mime
                                             || '; name="'
                                             || p_attach_name
                                             || '"'
                                             || utl_tcp.crlf);

            utl_smtp.write_data(l_mail_conn, 'Content-Disposition: attachment; filename="'
                                             || p_attach_name
                                             || '"'
                                             || utl_tcp.crlf
                                             || utl_tcp.crlf);

            FOR i IN 0..trunc((dbms_lob.getlength(p_attach_clob) - 1) / l_step) LOOP utl_smtp.write_data(l_mail_conn, dbms_lob.substr

            (p_attach_clob, l_step, i * l_step + 1));
            END LOOP;

            utl_smtp.write_data(l_mail_conn, utl_tcp.crlf || utl_tcp.crlf);
        END IF;

        utl_smtp.write_data(l_mail_conn, '--'
                                         || l_boundary
                                         || '--'
                                         || utl_tcp.crlf);

        utl_smtp.close_data(l_mail_conn);
        utl_smtp.quit(l_mail_conn);
    END;

    PROCEDURE send_mail (
        p_to          IN            VARCHAR2,
        p_cc          IN            VARCHAR2 DEFAULT NULL,
        p_bcc         IN            VARCHAR2 DEFAULT NULL,
        p_from        IN            VARCHAR2,
        p_subject     IN            VARCHAR2,
        p_message     IN            VARCHAR2,
        p_smtp_host   IN            VARCHAR2 DEFAULT PK_CONSTANTS.DEFAULT_SMTP_SERVER,
        p_smtp_port   IN            NUMBER DEFAULT PK_CONSTANTS.DEFAULT_SMTP_PORT
    ) AS

        l_mail_conn utl_smtp.connection;

        PROCEDURE process_recipients (
            p_mail_conn   IN OUT        utl_smtp.connection,
            p_list        IN            VARCHAR2
        ) AS
            l_tab string_api.t_split_array;
        BEGIN
            IF TRIM(p_list) IS NOT NULL THEN
                l_tab := string_api.split_text(p_list);
                FOR i IN 1..l_tab.count LOOP utl_smtp.rcpt(p_mail_conn, trim(l_tab(i)));
                END LOOP;

            END IF;
        END;

    BEGIN
        l_mail_conn := utl_smtp.open_connection(p_smtp_host, p_smtp_port);
        utl_smtp.helo(l_mail_conn, p_smtp_host);
        utl_smtp.mail(l_mail_conn, p_from);
        process_recipients(l_mail_conn, p_to);
        process_recipients(l_mail_conn, p_cc);
        process_recipients(l_mail_conn, p_bcc);
        utl_smtp.open_data(l_mail_conn);
        utl_smtp.write_data(l_mail_conn, 'Date: '
                                         || TO_CHAR(SYSDATE, 'DD.MM.YYYY HH24:MI:SS')
                                         || utl_tcp.crlf);

        utl_smtp.write_data(l_mail_conn, 'To: '
                                         || p_to
                                         || utl_tcp.crlf);
        IF TRIM(p_cc) IS NOT NULL THEN
            utl_smtp.write_data(l_mail_conn, 'CC: '
                                             || replace(p_cc, ',', ';')
                                             || utl_tcp.crlf);
        END IF;

        IF TRIM(p_bcc) IS NOT NULL THEN
            utl_smtp.write_data(l_mail_conn, 'BCC: '
                                             || replace(p_bcc, ',', ';')
                                             || utl_tcp.crlf);
        END IF;

        utl_smtp.write_data(l_mail_conn, 'From: '
                                         || p_from
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Subject: '
                                         || p_subject
                                         || utl_tcp.crlf);
        utl_smtp.write_data(l_mail_conn, 'Reply-To: '
                                         || p_from
                                         || utl_tcp.crlf
                                         || utl_tcp.crlf);

        utl_smtp.write_data(l_mail_conn, p_message
                                         || utl_tcp.crlf
                                         || utl_tcp.crlf);

        utl_smtp.close_data(l_mail_conn);
        utl_smtp.quit(l_mail_conn);
    END;

END pk_mailing;

/

  GRANT EXECUTE ON "AP_UTIL"."PK_MAILING" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."PK_MAILING" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."PK_MAILING" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."PK_MAILING" TO "KONDOR";
--------------------------------------------------------
--  DDL for Package Body PK_SOAP
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "AP_UTIL"."PK_SOAP" AS

   
    FUNCTION GET_PK_SOAP_PARAMS(IN_ENTITY AP_APPLICATIONS.D_ENTITIES.ID%TYPE, INPURPOSE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.PURPOSE%TYPE DEFAULT NULL) RETURN PK_SOAP_PARAMS AS
        V_PARAMS                    PK_SOAP_PARAMS;
        MAP_PK_SOAP_PARAMS          PK_VARIABLES.TBL_MAP;
        MAP_PK_SOAP_HEADER_PARAM    PK_VARIABLES.TBL_MAP;
        MAP_PK_SOAP_HEADER_PARAM_N  PK_SOAP_HEADER_PARAMS;
        V_KEY                       AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.NAME%TYPE;
        COUNTER                     NUMBER  DEFAULT 1;
    BEGIN

        MAP_PK_SOAP_PARAMS           := PK_VARIABLES.GETPARAMS(IN_ENTITY, 'PK_SOAP_PARAMS', INPURPOSE);
        MAP_PK_SOAP_HEADER_PARAM     := PK_VARIABLES.GETPARAMS(IN_ENTITY, 'PK_SOAP_HEADER_PARAM', INPURPOSE);
        V_PARAMS.URL                 := MAP_PK_SOAP_PARAMS('URL');
        V_PARAMS.METHOD              := MAP_PK_SOAP_PARAMS('METHOD');
        V_PARAMS.USERNAME            := MAP_PK_SOAP_PARAMS('USERNAME');
        V_PARAMS.PASSWORD            := MAP_PK_SOAP_PARAMS('PASSWORD');

        V_PARAMS.HEADER_VALUES       :=  PK_SOAP_HEADER_PARAMS();

        V_KEY := MAP_PK_SOAP_HEADER_PARAM.FIRST;
        LOOP
            EXIT WHEN V_KEY IS NULL;
            V_PARAMS.HEADER_VALUES.EXTEND();
            V_PARAMS.HEADER_VALUES(COUNTER).HEADER_KEY       :=  V_KEY;
            V_PARAMS.HEADER_VALUES(COUNTER).HEADER_VALUE     :=  MAP_PK_SOAP_HEADER_PARAM(V_KEY);
            V_KEY := MAP_PK_SOAP_HEADER_PARAM.NEXT(V_KEY);
            COUNTER :=  COUNTER + 1;
        END LOOP;

        RETURN V_PARAMS;
    END GET_PK_SOAP_PARAMS;


    PROCEDURE CALL(L_XML IN OUT XMLTYPE, PARAMS PK_SOAP_PARAMS)
    AS

        L_REQ               UTL_HTTP.REQ;
        L_RESP              UTL_HTTP.RESP;
        L_MSG               CLOB;
        L_ENTIRE_MSG        CLOB := NULL;
        TMPCLOB             CLOB;

        HTTP_ERROR          EXCEPTION;

        NSTART              NUMBER := 1;
        NEND                NUMBER := 2000;
        NCLOBLENGTH         NUMBER :=0;
        VCHUNKDATA          VARCHAR2(2000);
        NLENGTH             NUMBER := 2000; 

      BEGIN

          L_MSG := L_XML.GETCLOBVAL;

          UTL_HTTP.SET_TRANSFER_TIMEOUT(120);

          L_REQ := UTL_HTTP.BEGIN_REQUEST(URL => PARAMS.URL, METHOD => PARAMS.METHOD);
          UTL_HTTP.SET_AUTHENTICATION(L_REQ, PARAMS.USERNAME, PARAMS.PASSWORD);

            for k in 1 .. PARAMS.HEADER_VALUES.count loop
                IF (PARAMS.HEADER_VALUES(k).HEADER_KEY = 'Content-Length') THEN
                    UTL_HTTP.SET_HEADER(L_REQ, trim(PARAMS.HEADER_VALUES(k).HEADER_KEY), LENGTH(L_MSG));
                ELSE
                    UTL_HTTP.SET_HEADER(L_REQ, trim(PARAMS.HEADER_VALUES(k).HEADER_KEY), to_char(trim(PARAMS.HEADER_VALUES(k).HEADER_VALUE)));
                END IF;

            end loop;

          NCLOBLENGTH:=LENGTH(L_MSG);

          LOOP 
              IF NEND > NCLOBLENGTH THEN
                  NEND := NCLOBLENGTH;
                  NLENGTH := NEND - NSTART+1;
              END IF; 
              VCHUNKDATA := NULL;
              VCHUNKDATA := DBMS_LOB.SUBSTR(L_MSG, NLENGTH, NSTART); 
              UTL_HTTP.WRITE_TEXT ( L_REQ, VCHUNKDATA ); 
              TMPCLOB:=TMPCLOB||VCHUNKDATA;
              IF NEND = NCLOBLENGTH THEN
                  EXIT;
              END IF;
              NSTART := NEND + 1;
              NEND := NSTART + 2000 - 1; 
          END LOOP;

          L_RESP := UTL_HTTP.GET_RESPONSE(R => L_REQ);

             BEGIN

             LOOP
               UTL_HTTP.READ_TEXT(R => L_RESP,DATA => L_MSG);
               L_ENTIRE_MSG := L_ENTIRE_MSG||L_MSG;
             END LOOP;
          EXCEPTION
             WHEN  UTL_HTTP.END_OF_BODY
             THEN  NULL;
             when others then
             UTL_HTTP.END_RESPONSE(L_RESP);
                raise;
                DBMS_OUTPUT.PUT_LINE(SQLERRM);
          END;

          UTL_HTTP.END_RESPONSE(L_RESP);

          L_XML := XMLTYPE(L_ENTIRE_MSG);

        EXCEPTION
          WHEN HTTP_ERROR THEN
            UTL_HTTP.END_RESPONSE(L_RESP);
            DBMS_OUTPUT.PUT_LINE(SQLERRM);
            raise;

          WHEN OTHERS THEN
          UTL_HTTP.END_RESPONSE(L_RESP);
          DBMS_OUTPUT.PUT_LINE(SQLERRM);
          raise;
            NULL;
    END;


    FUNCTION MAKE_WS_CALL(IN_XML_BLOCKS XML_BLOCKS, IN_ENTITY AP_APPLICATIONS.D_ENTITIES.ID%TYPE, INPURPOSE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.PURPOSE%TYPE DEFAULT NULL) RETURN XMLTYPE
    AS
    XMLS                        PK_VARIABLES.TBL_MAP;
    XMLS_T                      PK_VARIABLES.TBL_MAP;
    V_KEY                       AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.NAME%TYPE;
    COUNTER                     NUMBER DEFAULT 0;
    TYPE FIELDS_EXIST IS TABLE OF NUMBER INDEX BY VARCHAR2(1000);
    FIELDS_EX                   FIELDS_EXIST;
    V_XML                       CLOB;
    L_XMLTYPE                   XMLTYPE;
    TST     CLOB;
    V_VAL   CLOB;
    BEGIN
        XMLS            := PK_VARIABLES.GETPARAMS(IN_ENTITY, 'XML', INPURPOSE);
        XMLS_T          := XMLS;

        FOR C IN IN_XML_BLOCKS.FIRST..IN_XML_BLOCKS.LAST 
        LOOP

            BEGIN
                IF FIELDS_EX(IN_XML_BLOCKS(C).BLOCK_ID) = 1 THEN
                    TST := XMLS(IN_XML_BLOCKS(C).BLOCK_ID);
                    TST := TST || CHR(13) || XMLS_T(IN_XML_BLOCKS(C).BLOCK_ID);
                    XMLS(IN_XML_BLOCKS(C).BLOCK_ID) := TST;
                END IF;
            EXCEPTION WHEN NO_DATA_FOUND THEN
                FIELDS_EX(IN_XML_BLOCKS(C).BLOCK_ID) := 1;
            END;

            V_KEY := XMLS.FIRST;
            LOOP
                EXIT WHEN V_KEY IS NULL;
                IF V_KEY LIKE '%' || IN_XML_BLOCKS(C).BLOCK_ID || '_FIELD%' THEN

                    V_VAL := IN_XML_BLOCKS(C).VALS(XMLS(V_KEY));

                    V_VAL := REPLACE(V_VAL, '&','&#38;');
                    V_VAL := REPLACE(V_VAL, '<','&lt;');
                    V_VAL := REPLACE(V_VAL, '>','&gt;');
                    V_VAL := REPLACE(V_VAL, '''','&#39;');
                    V_VAL := REPLACE(V_VAL, '"','&#34;');

                    V_VAL := REPLACE(V_VAL, 'æ','&#263;');
                    V_VAL := REPLACE(V_VAL, 'è','&#269;');
                    V_VAL := REPLACE(V_VAL, 'ð','&#273;');
                    V_VAL := REPLACE(V_VAL, 'š','&#353;');
                    V_VAL := REPLACE(V_VAL, 'ž','&#382;');

                    V_VAL := REPLACE(V_VAL, 'Æ','&#262;');
                    V_VAL := REPLACE(V_VAL, 'È','&#268;');
                    V_VAL := REPLACE(V_VAL, 'Ð','&#272;');
                    V_VAL := REPLACE(V_VAL, 'Š','&#352;');
                    V_VAL := REPLACE(V_VAL, 'Ž','&#381;');


                    XMLS(IN_XML_BLOCKS(C).BLOCK_ID) := REPLACE(XMLS(IN_XML_BLOCKS(C).BLOCK_ID), '[@'||V_KEY||']', V_VAL);

                END IF;
                V_KEY := XMLS.NEXT(V_KEY);
                COUNTER :=  COUNTER + 1;
            END LOOP;

        END LOOP;

        COUNTER := 0;
        V_KEY := XMLS.FIRST;
        V_XML := XMLS(V_KEY);
        LOOP
                EXIT WHEN V_KEY IS NULL;
                IF V_KEY NOT LIKE '%BLOCK%FIELD%' THEN


                    V_XML := REPLACE(V_XML, '[@'||V_KEY||']', XMLS(V_KEY));

                END IF;
                V_KEY := XMLS.NEXT(V_KEY);
                COUNTER :=  COUNTER + 1;
        END LOOP;


        DBMS_OUTPUT.PUT_LINE(V_XML);
        L_XMLTYPE := XMLTYPE.createXML(V_XML);


        CALL(L_XMLTYPE, GET_PK_SOAP_PARAMS(IN_ENTITY, INPURPOSE));

        RETURN L_XMLTYPE;

    exception when others then
        DBMS_OUTPUT.PUT_LINE(sqlerrm);
        RAISE;
        RETURN L_XMLTYPE;

    END;

END PK_SOAP;

/

  GRANT EXECUTE ON "AP_UTIL"."PK_SOAP" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."PK_SOAP" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."PK_SOAP" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."PK_SOAP" TO "KONDOR";
  GRANT EXECUTE ON "AP_UTIL"."PK_SOAP" TO "APP_KAMPIC";
  GRANT DEBUG ON "AP_UTIL"."PK_SOAP" TO "APP_KAMPIC";
--------------------------------------------------------
--  DDL for Package Body PK_VARIABLES
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "AP_UTIL"."PK_VARIABLES" AS
    
    CURSOR GET_MAP(IN_ENTITY AP_APPLICATIONS.D_ENTITIES.ID%TYPE, INMODULE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.MODULE%TYPE, INPURPOSE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.PURPOSE%TYPE DEFAULT NULL) IS
    SELECT NAME, VALUE FROM AP_APPLICATIONS.D_ENTITY_ATTRIBUTES WHERE MODULE = INMODULE AND ENTITY = IN_ENTITY AND PURPOSE = INPURPOSE ORDER BY NAME;

    O_CURR  GET_MAP%ROWTYPE;
    O_TBL_MAP       TBL_MAP;
    O_TBL_MAP_NULL  TBL_MAP;

    FUNCTION GETPARAMS(IN_ENTITY AP_APPLICATIONS.D_ENTITIES.ID%TYPE, INMODULE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.MODULE%TYPE, INPURPOSE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.PURPOSE%TYPE DEFAULT NULL) RETURN TBL_MAP AS
    BEGIN
        O_TBL_MAP := O_TBL_MAP_NULL;
        OPEN GET_MAP(IN_ENTITY, INMODULE, INPURPOSE);
        LOOP
            FETCH GET_MAP INTO O_CURR; EXIT WHEN GET_MAP%NOTFOUND;
            O_TBL_MAP(O_CURR.NAME) := O_CURR.VALUE;
        END LOOP;
        CLOSE GET_MAP;

        RETURN O_TBL_MAP;
    END;

    FUNCTION GETVALUE (IN_ENTITY AP_APPLICATIONS.D_ENTITIES.ID%TYPE, INMODULE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.MODULE%TYPE, INNAME AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.NAME%TYPE, INPURPOSE AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.PURPOSE%TYPE DEFAULT NULL) RETURN VARCHAR2 AS
        V_RET   AP_APPLICATIONS.D_ENTITY_ATTRIBUTES.VALUE%TYPE;
    BEGIN
        SELECT TO_CHAR(VALUE) INTO V_RET FROM AP_APPLICATIONS.D_ENTITY_ATTRIBUTES WHERE MODULE = INMODULE AND ENTITY = IN_ENTITY AND (PURPOSE = INPURPOSE OR INPURPOSE IS NULL) AND NAME = INNAME;
        
        RETURN V_RET;
        
        EXCEPTION
            WHEN OTHERS THEN
                RETURN NULL;
    END;
    
    
END PK_VARIABLES;

/

  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "KONDOR";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "APP_CUST_MENU";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "APP_CUST_MENU2";
  GRANT DEBUG ON "AP_UTIL"."PK_VARIABLES" TO "APP_CUST_MENU2";
  GRANT EXECUTE ON "AP_UTIL"."PK_VARIABLES" TO "APP_CUST_MENU_02";
  GRANT DEBUG ON "AP_UTIL"."PK_VARIABLES" TO "APP_CUST_MENU_02";
--------------------------------------------------------
--  DDL for Package Body STRING_API
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "AP_UTIL"."STRING_API" AS
-- --------------------------------------------------------------------------
-- Name         : https://oracle-base.com/dba/miscellaneous/string_api.sql
-- Author       : Tim Hall
-- Description  : A package to hold string utilities.
-- Requirements : 
-- Amendments   :
--   When         Who       What
--   ===========  ========  =================================================
--   02-DEC-2004  Tim Hall  Initial Creation
--   31-AUG-2017  Tim Hall  SUBSTR parameters switched.
--   19-JAN-2017  Tim Hall  Add get_uri_paramter_value function.
--   20-NOV-2018  Tim Hall  Reduce the chunk sizes to allow for multibyte character sets.
-- --------------------------------------------------------------------------

-- Variables to support the URI functionality.

    TYPE t_uri_array IS
        TABLE OF VARCHAR2(32767) INDEX BY VARCHAR2(32767);
    g_last_uri   VARCHAR2(32767) := 'initialized';
    g_uri_tab    t_uri_array;


-- ----------------------------------------------------------------------------

    FUNCTION split_text (
        p_text        IN            CLOB,
        p_delimeter   IN            VARCHAR2 DEFAULT ','
    ) RETURN t_split_array IS
-- ----------------------------------------------------------------------------
-- Could be replaced by APEX_UTIL.STRING_TO_TABLE.
-- ----------------------------------------------------------------------------
        l_array   t_split_array := t_split_array();
        l_text    CLOB := p_text;
        l_idx     NUMBER;
    BEGIN
        l_array.DELETE;
        IF l_text IS NULL THEN
            raise_application_error(-20000, 'P_TEXT parameter cannot be NULL');
        END IF;
        WHILE l_text IS NOT NULL LOOP
            l_idx := instr(l_text, p_delimeter);
            l_array.extend;
            IF l_idx > 0 THEN
                l_array(l_array.last) := substr(l_text, 1, l_idx - 1);

                l_text := substr(l_text, l_idx + 1);
            ELSE
                l_array(l_array.last) := l_text;
                l_text := NULL;
            END IF;

        END LOOP;

        RETURN l_array;
    END split_text;
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------

    PROCEDURE print_clob (
        p_clob IN CLOB
    ) IS
-- ----------------------------------------------------------------------------
        l_offset   NUMBER := 1;
        l_chunk    NUMBER := 255;
    BEGIN
        LOOP
            EXIT WHEN l_offset > length(p_clob);
            dbms_output.put_line(substr(p_clob, l_offset, l_chunk));
            l_offset := l_offset + l_chunk;
        END LOOP;
    END print_clob;
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------

    PROCEDURE print_clob_old (
        p_clob IN CLOB
    ) IS
-- ----------------------------------------------------------------------------
        l_offset   NUMBER := 1;
        l_chunk    NUMBER := 255;
    BEGIN
        LOOP
            EXIT WHEN l_offset > dbms_lob.getlength(p_clob);
            dbms_output.put_line(dbms_lob.substr(p_clob, l_offset, l_chunk));
            l_offset := l_offset + l_chunk;
        END LOOP;
    END print_clob_old;
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------

    PROCEDURE print_clob_htp (
        p_clob IN CLOB
    ) IS
-- ----------------------------------------------------------------------------
        l_offset   NUMBER := 1;
        l_chunk    NUMBER := 3000;
    BEGIN
        LOOP
            EXIT WHEN l_offset > length(p_clob);
            htp.prn(substr(p_clob, l_offset, l_chunk));
            l_offset := l_offset + l_chunk;
        END LOOP;
    END print_clob_htp;
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------

    PROCEDURE print_clob_htp_old (
        p_clob IN CLOB
    ) IS
-- ----------------------------------------------------------------------------
        l_offset   NUMBER := 1;
        l_chunk    NUMBER := 3000;
    BEGIN
        LOOP
            EXIT WHEN l_offset > dbms_lob.getlength(p_clob);
            htp.prn(dbms_lob.substr(p_clob, l_offset, l_chunk));
            l_offset := l_offset + l_chunk;
        END LOOP;
    END print_clob_htp_old;
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------

    FUNCTION get_uri_paramter_value (
        p_uri          IN             VARCHAR2,
        p_param_name   IN             VARCHAR2
    ) RETURN VARCHAR2 IS
-- ----------------------------------------------------------------------------
-- Example:
-- l_uri := 'https://localhost:8080/my_page.php?param1=value1¶m2=value2¶m3=value3';
-- l_value := string_api.get_uri_paramter_value(l_uri, 'param1')
-- ----------------------------------------------------------------------------
        l_uri     VARCHAR2(32767);
        l_array   t_split_array := t_split_array();
        l_idx     NUMBER;
    BEGIN
        IF p_uri IS NULL OR p_param_name IS NULL THEN
            raise_application_error(-20000, 'p_uri and p_param_name must be specified.');
        END IF;

        IF p_uri != g_last_uri THEN
    -- First time we've seen this URI, so build the key-value table.
            g_uri_tab.DELETE;
            g_last_uri := p_uri;
            l_uri := translate(g_last_uri, '&?', '^^');
            l_array := split_text(l_uri, '^');
            FOR i IN 1..l_array.count LOOP
                l_idx := instr(l_array(i), '=');
                IF l_idx != 0 THEN
                    g_uri_tab(substr(l_array(i), 1, l_idx - 1)) := substr(l_array(i), l_idx + 1);
        --DBMS_OUTPUT.put_line('param_name=' || SUBSTR(l_array(i), 1, l_idx - 1) ||
        --                     ' | param_value=' || SUBSTR(l_array(i), l_idx + 1));

                END IF;

            END LOOP;

        END IF;

        RETURN g_uri_tab(p_param_name);
    EXCEPTION
        WHEN no_data_found THEN
            RETURN NULL;
    END get_uri_paramter_value;
-- ----------------------------------------------------------------------------

    function encoding_utf8(p_text_in varchar2) return varchar2  
    as
    
        p_text_out varchar2(32767); 
       
    begin
       
       
        p_text_out := REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE 
        (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE (REPLACE(p_text_in,
        '?©','é'),'??', 'Ö'),'??', 'ß'),'Â´', '´'),
        '? ','Š'),'Ä?','Ð'),'Ä?','È'),'Ä?','Æ'),'??','Ž'),'??','š'),'Ä?','ð'),'Ä?','è')
        ,'Ä?','æ'),'??','ž'),'??','Ü'),'?«','ë'),'?¶','ö'),'??','Á'),'??','Ó'),'??','á')
        ,'??','ü'),'??','Ä'),'??','ó'),'?','õ');      
      
        return p_text_out; 
        
    end encoding_utf8;

END string_api;

/

  GRANT EXECUTE ON "AP_UTIL"."STRING_API" TO "AP_LOG";
  GRANT EXECUTE ON "AP_UTIL"."STRING_API" TO "AP_APPLICATIONS";
  GRANT EXECUTE ON "AP_UTIL"."STRING_API" TO "KONDOR_APP";
  GRANT EXECUTE ON "AP_UTIL"."STRING_API" TO "KONDOR";
