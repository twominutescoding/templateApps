package com.template.business.auth.repository;

import com.template.business.auth.entity.MailingListUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MailingListUserRepository extends JpaRepository<MailingListUser, MailingListUser.MailingListUserId>,
        JpaSpecificationExecutor<MailingListUser> {

    List<MailingListUser> findByIdName(String name);

    void deleteByIdName(String name);
}
