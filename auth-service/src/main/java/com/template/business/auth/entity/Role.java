package com.template.business.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@jakarta.persistence.Entity
@Table(name = "D_ROLES")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"entity", "userRoles"})
@ToString(exclude = {"entity", "userRoles"})
public class Role {

    @EmbeddedId
    private RoleId id;

    @ManyToOne
    @JoinColumn(name = "ENTITY", referencedColumnName = "ID", insertable = false, updatable = false)
    private ApplicationEntity entity;

    @Column(name = "ROLE_LEVEL", length = 100, nullable = false)
    private String roleLevel;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "CREATE_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createDate;

    @Column(name = "CREATE_USER", length = 100)
    private String createUser;

    @OneToMany(mappedBy = "role")
    private Set<UserRole> userRoles = new HashSet<>();

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleId implements Serializable {
        @Column(name = "ROLE", length = 100)
        private String role;

        @Column(name = "ENTITY", length = 100)
        private String entity;
    }

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = new Date();
        }
    }
}
