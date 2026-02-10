package com.template.business.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

/**
 * Entity for D_ENTITY_ATTRIBUTES table
 * Key-value store for entity-specific configuration attributes per module/purpose
 */
@Entity
@Table(name = "D_ENTITY_ATTRIBUTES")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntityAttribute {

    @EmbeddedId
    private EntityAttributeId id;

    @ManyToOne
    @JoinColumn(name = "ENTITY", referencedColumnName = "ID", insertable = false, updatable = false)
    private ApplicationEntity entity;

    @Lob
    @Column(name = "\"VALUE\"")
    private String value;

    @Column(name = "CREATE_DATE")
    private Date createDate;

    @Column(name = "CREATE_USER", length = 100)
    private String createUser;

    /**
     * Composite primary key for EntityAttribute
     * (ENTITY, MODULE, PURPOSE, NAME)
     */
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EntityAttributeId implements Serializable {
        @Column(name = "ENTITY", length = 200, nullable = false)
        private String entity;

        @Column(name = "MODULE", length = 200, nullable = false)
        private String module;

        @Column(name = "PURPOSE", length = 200, nullable = false)
        private String purpose;

        @Column(name = "NAME", length = 200, nullable = false)
        private String name;
    }

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = new Date();
        }
    }
}
