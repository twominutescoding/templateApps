package com.template.business.config;

import com.template.business.demo.entity.DemoProduct;
import com.template.business.demo.repository.DemoProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Data initializer for demo products.
 *
 * Note: User initialization is removed since all users are managed by auth-service.
 * This only initializes demo products for the demo/example functionality.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DemoProductRepository demoProductRepository;

    @Override
    public void run(String... args) {
        initializeDemoProducts();
    }

    private void initializeDemoProducts() {
        if (demoProductRepository.count() == 0) {
            String[] productTypes = {
                "Laptop", "Mouse", "Keyboard", "Monitor", "Webcam", "Headset", "Desk Lamp",
                "Standing Desk", "Office Chair", "Tablet", "Smart Watch", "Speaker", "Phone",
                "USB Hub", "Docking Station", "Cable Box", "Monitor Arm", "SSD Drive",
                "Headphones", "Microphone", "Router", "Switch", "Printer", "Scanner",
                "Projector", "Camera", "Tripod", "Backpack", "Sleeve", "Charger",
                "Power Bank", "USB Cable", "HDMI Cable", "Adapter", "Extension Cord",
                "Surge Protector", "Desk Mat", "Mousepad", "Wrist Rest", "Laptop Stand"
            };

            String[] modifiers = {
                "Pro", "Ultra", "Premium", "Basic", "Advanced", "Professional", "Standard",
                "Elite", "Compact", "Wireless", "RGB", "HD", "4K", "Gaming", "Business"
            };

            String[] categories = {
                "Electronics", "Accessories", "Audio", "Office", "Furniture", "Storage"
            };

            DemoProduct.ProductStatus[] statuses = DemoProduct.ProductStatus.values();

            // Generate 200 products
            for (int i = 1; i <= 200; i++) {
                String productType = productTypes[i % productTypes.length];
                String modifier = modifiers[(i / productTypes.length) % modifiers.length];
                String category = categories[i % categories.length];
                DemoProduct.ProductStatus status = statuses[i % statuses.length];

                // Vary prices based on product type
                int basePrice = 20 + (i % 30) * 10;
                BigDecimal price = new BigDecimal(basePrice + (i % 10) * 5 + ".99");

                // Vary quantities, with some out of stock
                int quantity = status == DemoProduct.ProductStatus.OUT_OF_STOCK ? 0 :
                              (i * 7) % 150 + 5;

                demoProductRepository.save(DemoProduct.builder()
                        .name(modifier + " " + productType)
                        .description("High-quality " + modifier.toLowerCase() + " " + productType.toLowerCase() + " for professional use")
                        .price(price)
                        .quantity(quantity)
                        .category(category)
                        .sku(String.format("SKU-%03d", i))
                        .status(status)
                        .build());
            }

            log.info("Initialized {} demo products with various statuses", demoProductRepository.count());
        }
    }
}
