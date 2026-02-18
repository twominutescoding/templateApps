package com.template.business.auth.repository;

import com.template.business.auth.entity.MailingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MailingListRepository extends JpaRepository<MailingList, String>, JpaSpecificationExecutor<MailingList> {
}
