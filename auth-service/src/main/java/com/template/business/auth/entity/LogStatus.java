package com.template.business.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Entity for D_LOG_STATUS table (read-only lookup)
 * Defines available log status values with retention settings
 */
@Entity
@Table(name = "D_LOG_STATUS", schema = "AP_LOG")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogStatus {

    @Id
    @Column(name = "STATUS", length = 100)
    private String status;

    @Column(name = "DELETE_AFTER")
    private Integer deleteAfter; // Number of days to keep logs with this status

    @Column(name = "CREATE_DATE")
    private Date createDate;

    @Column(name = "CREATE_USER", length = 100)
    private String createUser;

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = new Date();
        }
    }
}
