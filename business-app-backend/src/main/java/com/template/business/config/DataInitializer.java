package com.template.business.config;

import com.template.business.demo.entity.DemoProduct;
import com.template.business.demo.repository.DemoProductRepository;
import com.template.business.entity.User;
import com.template.business.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DemoProductRepository demoProductRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeUsers();
        initializeDemoProducts();
    }

    private void initializeUsers() {
        if (userRepository.count() == 0) {
            // Admin user
            User admin = User.builder()
                    .username("admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("User")
                    .roles(Set.of("ADMIN", "USER"))
                    .active(true)
                    .build();

            // Regular user
            User user = User.builder()
                    .username("user")
                    .email("user@example.com")
                    .password(passwordEncoder.encode("user123"))
                    .firstName("Regular")
                    .lastName("User")
                    .roles(Set.of("USER"))
                    .active(true)
                    .build();

            // Additional test users
            User john = User.builder()
                    .username("john.doe")
                    .email("john.doe@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("John")
                    .lastName("Doe")
                    .roles(Set.of("USER"))
                    .active(true)
                    .build();

            User jane = User.builder()
                    .username("jane.smith")
                    .email("jane.smith@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("Jane")
                    .lastName("Smith")
                    .roles(Set.of("USER", "MANAGER"))
                    .active(true)
                    .build();

            User bob = User.builder()
                    .username("bob.wilson")
                    .email("bob.wilson@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("Bob")
                    .lastName("Wilson")
                    .roles(Set.of("USER"))
                    .active(true)
                    .build();

            // Inactive user for testing
            User inactive = User.builder()
                    .username("inactive.user")
                    .email("inactive@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("Inactive")
                    .lastName("Account")
                    .roles(Set.of("USER"))
                    .active(false)
                    .build();

            userRepository.save(admin);
            userRepository.save(user);
            userRepository.save(john);
            userRepository.save(jane);
            userRepository.save(bob);
            userRepository.save(inactive);

            log.info("Initialized {} users: admin/admin123, user/user123, john.doe/password123, jane.smith/password123, bob.wilson/password123",
                    userRepository.count());
        }
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

            log.info("Initialized {} products with various statuses", demoProductRepository.count());
        }
    }
}
