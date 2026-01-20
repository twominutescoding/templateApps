package com.template.business.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Entity for D_ENTITY_TYPES table
 * Lookup table for entity types with TAG prefix for ID generation
 */
@Entity
@Table(name = "D_ENTITY_TYPES")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntityType {

    @Column(name = "TAG", length = 3, nullable = false)
    private String tag;

    @Id
    @Column(name = "TYPE", length = 200, nullable = false)
    private String type;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "CREATE_DATE")
    @Temporal(TemporalType.TIMESTAMP)
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
