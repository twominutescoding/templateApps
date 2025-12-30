package com.template.business.demo.repository;

import com.template.business.demo.entity.DemoProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DemoProductRepository extends JpaRepository<DemoProduct, Long>, JpaSpecificationExecutor<DemoProduct> {

    Optional<DemoProduct> findBySku(String sku);

    List<DemoProduct> findByCategory(String category);

    List<DemoProduct> findByStatus(DemoProduct.ProductStatus status);

    Boolean existsBySku(String sku);
}
