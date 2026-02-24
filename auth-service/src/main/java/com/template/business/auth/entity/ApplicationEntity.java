package com.template.business.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@jakarta.persistence.Entity
@Table(name = "D_ENTITIES", schema = "ap_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"roles", "entityType"})
@ToString(exclude = {"roles", "entityType"})
public class ApplicationEntity {

    @Id
    @Column(name = "ID", length = 100)
    private String id;

    @Column(name = "NAME", length = 200, nullable = false)
    private String name;

    @Column(name = "TYPE", length = 200, nullable = false)
    private String type;

    @ManyToOne
    @JoinColumn(name = "TYPE", referencedColumnName = "TYPE", insertable = false, updatable = false)
    private EntityType entityType;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "CREATE_DATE")
    private Date createDate;

    @Column(name = "CREATE_USER", length = 100)
    private String createUser;

    @OneToMany(mappedBy = "entity", fetch = FetchType.LAZY)
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = new Date();
        }
    }
}
