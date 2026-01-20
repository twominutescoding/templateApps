package com.template.business.auth.repository;

import com.template.business.auth.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for UserStatus entity (D_USER_STATUS table)
 */
@Repository
public interface UserStatusRepository extends JpaRepository<UserStatus, String> {
}
