package com.template.business.auth.repository;

import com.template.business.auth.entity.ApplicationEntity;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EntityRepository extends JpaRepository<ApplicationEntity, String>, JpaSpecificationExecutor<ApplicationEntity> {

    Optional<ApplicationEntity> findById(String id);

    Optional<ApplicationEntity> findByName(@NotBlank(message = "Entity code is required") String entityCode);
}
