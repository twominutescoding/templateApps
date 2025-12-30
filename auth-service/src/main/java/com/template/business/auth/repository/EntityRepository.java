package com.template.business.auth.repository;

import com.template.business.auth.entity.ApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EntityRepository extends JpaRepository<ApplicationEntity, String> {

    Optional<ApplicationEntity> findById(String id);
}
