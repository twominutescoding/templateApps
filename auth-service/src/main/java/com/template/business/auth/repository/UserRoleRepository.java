package com.template.business.auth.repository;

import com.template.business.auth.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRole.UserRoleId> {

    List<UserRole> findByIdUsername(String username);

    @Query("SELECT ur FROM UserRole ur WHERE ur.id.username = :username AND ur.id.entity = :entity AND ur.status = 'ACTIVE'")
    List<UserRole> findActiveRolesByUsernameAndEntity(@Param("username") String username, @Param("entity") String entity);

    @Query("SELECT ur FROM UserRole ur WHERE ur.id.username = :username AND ur.status = 'ACTIVE'")
    List<UserRole> findActiveRolesByUsername(@Param("username") String username);
}
