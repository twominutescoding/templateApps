package com.template.business.auth.repository;

import com.template.business.auth.entity.EntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for EntityType entity (D_ENTITY_TYPES table)
 */
@Repository
public interface EntityTypeRepository extends JpaRepository<EntityType, String> {
}
