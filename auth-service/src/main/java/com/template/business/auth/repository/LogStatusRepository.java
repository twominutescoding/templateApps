package com.template.business.auth.repository;

import com.template.business.auth.entity.LogStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogStatusRepository extends JpaRepository<LogStatus, String> {

}
