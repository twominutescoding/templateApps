package com.template.business.demo.entity;

import com.template.business.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "demo_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemoProduct extends BaseEntity {

    @NotBlank(message = "Product name is required")
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    @Column(nullable = false)
    private Integer quantity;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category;

    @Column(length = 50)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    public enum ProductStatus {
        ACTIVE, INACTIVE, DRAFT, OUT_OF_STOCK, DISCONTINUED
    }
}
