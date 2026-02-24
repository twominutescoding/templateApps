package com.template.business.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "D_USER_ROLES", schema = "ap_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"user", "role", "userStatus"})
@ToString(exclude = {"user", "role", "userStatus"})
public class UserRole {

    @EmbeddedId
    private UserRoleId id;

    @ManyToOne
    @JoinColumn(name = "USERNAME", referencedColumnName = "USERNAME", insertable = false, updatable = false)
    private User user;

    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "ROLE", referencedColumnName = "ROLE", insertable = false, updatable = false),
            @JoinColumn(name = "ENTITY", referencedColumnName = "ENTITY", insertable = false, updatable = false)
    })
    private Role role;

    @Column(name = "STATUS", length = 100)
    private String status; // ACTIVE, INACTIVE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STATUS", referencedColumnName = "STATUS", insertable = false, updatable = false)
    private UserStatus userStatus;

    @Column(name = "CREATE_DATE")
    private Date createDate;

    @Column(name = "CREATE_USER", length = 100)
    private String createUser;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRoleId implements Serializable {
        @Column(name = "USERNAME", length = 100)
        private String username;

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
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
