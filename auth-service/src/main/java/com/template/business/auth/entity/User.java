package com.template.business.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "D_USERS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"userRoles", "userStatus"})
@ToString(exclude = {"userRoles", "userStatus"})
public class User {

    @Id
    @Column(name = "USERNAME", length = 100)
    private String username;

    @Column(name = "FIRST_NAME", length = 200)
    private String firstName;

    @Column(name = "LAST_NAME", length = 200)
    private String lastName;

    @Email(message = "Email should be valid")
    @Column(name = "EMAIL", length = 500)
    private String email;

    @Column(name = "COMPANY", length = 200)
    private String company;

    @Column(name = "STATUS", length = 100)
    private String status; // ACTIVE, INACTIVE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STATUS", referencedColumnName = "STATUS", insertable = false, updatable = false)
    private UserStatus userStatus;

    @Column(name = "CREATE_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createDate;

    @Column(name = "CREATE_USER", length = 100)
    private String createUser;

    @Column(name = "THEME", length = 100)
    private String theme; // dark, light

    @Column(name = "PALETTE_ID", length = 100)
    private String paletteId; // Color palette ID (e.g., ocean-blue, sunset-orange, custom-uuid)

    @Lob
    @Column(name = "IMAGE")
    private String image;

    // PASSWORD field for local database authentication (not in original schema)
    // This field is OPTIONAL and only used when LDAP authentication fails
    @JsonIgnore
    @Column(name = "PASSWORD", length = 4000)
    private String password;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<UserRole> userRoles = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = new Date();
        }
        if (status == null) {
            status = "ACTIVE";
        }
        if (theme == null) {
            theme = "light";
        }
        if (paletteId == null) {
            paletteId = "ocean-blue"; // Default palette
        }
        if (company == null) {
            company = "KONZUM";
        }
        // Convert username to lowercase (as per trigger D_USERS_TO_LOWERCASE)
        if (username != null) {
            username = username.toLowerCase();
        }
    }
}
