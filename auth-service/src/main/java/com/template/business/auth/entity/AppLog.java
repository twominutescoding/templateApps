package com.template.business.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Date;

/**
 * Entity for T_APP_LOG table
 * Centralized application logging for backend services
 */
@Entity
@Table(name = "T_APP_LOG", schema = "AP_LOG")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"applicationEntity", "logStatus", "user"})
@ToString(exclude = {"applicationEntity", "logStatus", "user"})
public class AppLog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "app_log_seq")
    @SequenceGenerator(name = "app_log_seq", sequenceName = "T_APP_LOG_SEQ01", schema = "AP_LOG", allocationSize = 1)
    @Column(name = "ID", nullable = false)
    private Long id;

    @Column(name = "ENTITY", length = 100)
    private String entity; // FK to D_ENTITIES.ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ENTITY", referencedColumnName = "ID", insertable = false, updatable = false)
    private ApplicationEntity applicationEntity;

    @Column(name = "MODULE", length = 100)
    private String module; // Module/component name within the entity

    @Lob
    @Column(name = "REQUEST")
    private String request; // Request payload/input

    @Lob
    @Column(name = "RESPONSE")
    private String response; // Response payload/output

    @Column(name = "STATUS", length = 100, nullable = false)
    private String status; // FK to D_LOG_STATUS.STATUS

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STATUS", referencedColumnName = "STATUS", insertable = false, updatable = false)
    private LogStatus logStatus;

    @Column(name = "START_TIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date startTime;

    @Column(name = "END_TIME")
    @Temporal(TemporalType.TIMESTAMP)
    private Date endTime;

    @Column(name = "NOTIFIABLE", length = 1)
    private String notifiable; // Y/N - whether this log should trigger notifications

    @Column(name = "NOTIFICATION_SENT", length = 1)
    private String notificationSent; // Y/N - whether notification was sent

    @Column(name = "USERNAME", length = 100)
    private String username; // User who performed the action (optional)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERNAME", referencedColumnName = "USERNAME", insertable = false, updatable = false)
    private User user;

    @Column(name = "CREATE_USER", length = 100)
    private String createUser; // System/service that created the log

    @Column(name = "CREATE_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createDate;

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = new Date();
        }
        if (notifiable == null) {
            notifiable = "N";
        }
        if (notificationSent == null) {
            notificationSent = "N";
        }
    }
}
