package com.template.business.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Date;

/**
 * Entity representing a refresh token for session management.
 * Each refresh token represents one active user session with metadata for security monitoring.
 */
@Entity
@Table(name = "D_REFRESH_TOKENS", schema = "ap_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "user")
@ToString(exclude = "user")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "refresh_token_seq")
    @SequenceGenerator(name = "refresh_token_seq", sequenceName = "D_REFRESH_TOKENS_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    /**
     * SHA-256 hash of the actual refresh token.
     * NEVER store the plain token in the database for security.
     */
    @Column(name = "TOKEN_HASH", length = 64, nullable = false, unique = true)
    private String tokenHash;

    /**
     * Username this token belongs to
     */
    @Column(name = "USERNAME", length = 100, nullable = false)
    private String username;

    /**
     * Application/Entity code this session is for (e.g., APP001, APP002)
     */
    @Column(name = "ENTITY", length = 100, nullable = false)
    private String entity;

    /**
     * When this session was created
     */
    @Column(name = "CREATE_DATE", nullable = false)
    private Date createDate;

    /**
     * When this refresh token expires
     */
    @Column(name = "EXPIRES_AT", nullable = false)
    private Date expiresAt;

    /**
     * Last time this token was used to refresh an access token
     */
    @Column(name = "LAST_USED_AT")
    private Date lastUsedAt;

    /**
     * Whether this token has been revoked (logout, suspicious activity, etc.)
     */
    @Column(name = "REVOKED", nullable = false)
    private Boolean revoked = false;

    /**
     * When this token was revoked
     */
    @Column(name = "REVOKED_AT")
    private Date revokedAt;

    /**
     * IP address of the client (IPv4 or IPv6)
     */
    @Column(name = "IP_ADDRESS", length = 45)
    private String ipAddress;

    /**
     * Browser/Device user agent string for device identification
     */
    @Column(name = "USER_AGENT", length = 500)
    private String userAgent;

    /**
     * User-friendly device name (e.g., "Chrome on Windows", "John's iPhone")
     */
    @Column(name = "DEVICE_NAME", length = 255)
    private String deviceName;

    /**
     * Geographic location (e.g., "New York, USA")
     * Can be populated via IP geolocation service
     */
    @Column(name = "LOCATION", length = 255)
    private String location;

    /**
     * Audit field - who created this session (usually same as username)
     */
    @Column(name = "CREATE_USER", length = 100)
    private String createUser;

    /**
     * How this token was created: LOGIN or REFRESH
     * LOGIN = initial authentication, REFRESH = token rotation
     */
    @Column(name = "CREATION_TYPE", length = 20)
    private String creationType;

    /**
     * Many-to-one relationship with User entity
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERNAME", referencedColumnName = "USERNAME", insertable = false, updatable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = new Date();
        }
        if (revoked == null) {
            revoked = false;
        }
        if (createUser == null && username != null) {
            createUser = username;
        }
    }

    /**
     * Check if this refresh token is valid (not expired and not revoked)
     */
    public boolean isValid() {
        return !revoked && expiresAt != null && expiresAt.after(new Date());
    }

    /**
     * Revoke this token (for logout or security reasons)
     */
    public void revoke() {
        this.revoked = true;
        this.revokedAt = new Date();
    }

    /**
     * Update last used timestamp (called when token is used to get new access token)
     */
    public void updateLastUsed() {
        this.lastUsedAt = new Date();
    }
}
