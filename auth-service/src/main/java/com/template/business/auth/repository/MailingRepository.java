package com.template.business.auth.repository;

import com.template.business.auth.entity.Mailing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface MailingRepository extends JpaRepository<Mailing, Long>, JpaSpecificationExecutor<Mailing> {

    Optional<Mailing> findById(Long id);

    List<Mailing> findBySentAndNotBeforeLessThanEqual(String sent, Date notBefore);
}
