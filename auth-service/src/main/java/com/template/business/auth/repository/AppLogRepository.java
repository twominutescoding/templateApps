package com.template.business.auth.repository;

import com.template.business.auth.entity.AppLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppLogRepository extends JpaRepository<AppLog, Long>, JpaSpecificationExecutor<AppLog> {

    Optional<AppLog> findById(Long id);

    List<AppLog> findByEntity(String entity);

    List<AppLog> findByStatus(String status);

    List<AppLog> findByUsername(String username);

    List<AppLog> findByModule(String module);
}
