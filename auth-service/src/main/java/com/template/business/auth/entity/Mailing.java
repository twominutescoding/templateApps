package com.template.business.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Entity for T_MAILING table
 * Email/notification queue system
 */
@Entity
@Table(name = "T_MAILING")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mailing {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "mailing_seq")
    @SequenceGenerator(name = "mailing_seq", sequenceName = "T_MAILING_SEQ", allocationSize = 1)
    @Column(name = "ID", nullable = false)
    private Long id;

    @Column(name = "SUBJECT", length = 400, nullable = false)
    private String subject;

    @Lob
    @Column(name = "BODY")
    private String body;

    @Lob
    @Column(name = "ATTACHMENT")
    private String attachment;

    @Column(name = "SENT", length = 1, nullable = false)
    private String sent; // Y/N

    @Column(name = "NOT_BEFORE", nullable = false)
    private Date notBefore;

    @Column(name = "MAILING_LIST", length = 200, nullable = false)
    private String mailingList;

    @Column(name = "MAIL_TYPE", length = 100, nullable = false)
    private String mailType;

    @Column(name = "CREATE_DATE")
    private Date createDate;

    @Column(name = "CREATE_USER", length = 100)
    private String createUser;

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = new Date();
        }
        if (sent == null) {
            sent = "N";
        }
    }
}
