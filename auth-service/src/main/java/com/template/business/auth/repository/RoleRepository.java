package com.template.business.auth.repository;

import com.template.business.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Role.RoleId> {

    List<Role> findByIdEntity(String entity);

    Optional<Role> findByIdRoleAndIdEntity(String role, String entity);
}
