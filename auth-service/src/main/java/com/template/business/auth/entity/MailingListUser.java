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
@Table(name = "D_MAILING_LIST_USERS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"mailingList", "user"})
@ToString(exclude = {"mailingList", "user"})
public class MailingListUser {

    @EmbeddedId
    private MailingListUserId id;

    @ManyToOne
    @JoinColumn(name = "NAME", referencedColumnName = "NAME", insertable = false, updatable = false)
    private MailingList mailingList;

    @ManyToOne
    @JoinColumn(name = "USERNAME", referencedColumnName = "USERNAME", insertable = false, updatable = false)
    private User user;

    @Column(name = "CREATE_DATE")
    private Date createDate;

    @Column(name = "CREATE_USER", length = 100)
    private String createUser;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MailingListUserId implements Serializable {
        @Column(name = "NAME", length = 200)
        private String name;

        @Column(name = "USERNAME", length = 200)
        private String username;
    }

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = new Date();
        }
    }
}
