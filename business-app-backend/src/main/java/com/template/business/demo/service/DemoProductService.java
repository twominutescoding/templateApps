package com.template.business.demo.service;

import com.template.business.demo.dto.DemoProductDTO;
import com.template.business.demo.entity.DemoProduct;
import com.template.business.demo.repository.DemoProductRepository;
import com.template.business.dto.PageResponse;
import com.template.business.dto.SearchRequest;
import com.template.business.exception.ResourceNotFoundException;
import com.template.business.util.SpecificationBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoProductService {

    private final DemoProductRepository productRepository;

    @Transactional(readOnly = true)
    public PageResponse<DemoProductDTO> searchProducts(SearchRequest searchRequest) {
        log.debug("Searching demo products with request: {}", searchRequest);

        // Build specification from search request
        Specification<DemoProduct> spec = SpecificationBuilder.buildSpecification(searchRequest);

        // Build sort
        Sort sort = buildSort(searchRequest.getSort());

        // Build pageable
        Pageable pageable = PageRequest.of(
                searchRequest.getPage(),
                searchRequest.getPageSize(),
                sort
        );

        // Execute query
        Page<DemoProduct> productPage = productRepository.findAll(spec, pageable);

        // Convert to DTO
        Page<DemoProductDTO> dtoPage = productPage.map(this::toDTO);

        return PageResponse.of(dtoPage);
    }

    @Transactional(readOnly = true)
    public DemoProductDTO getProductById(Long id) {
        DemoProduct product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo Product", "id", id));
        return toDTO(product);
    }

    @Transactional
    public DemoProductDTO createProduct(DemoProductDTO productDTO) {
        DemoProduct product = toEntity(productDTO);
        DemoProduct savedProduct = productRepository.save(product);
        log.info("Created demo product with id: {}", savedProduct.getId());
        return toDTO(savedProduct);
    }

    @Transactional
    public DemoProductDTO updateProduct(Long id, DemoProductDTO productDTO) {
        DemoProduct product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demo Product", "id", id));

        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setQuantity(productDTO.getQuantity());
        product.setCategory(productDTO.getCategory());
        product.setSku(productDTO.getSku());
        if (productDTO.getStatus() != null) {
            product.setStatus(productDTO.getStatus());
        }

        DemoProduct updatedProduct = productRepository.save(product);
        log.info("Updated demo product with id: {}", id);
        return toDTO(updatedProduct);
    }

    @Transactional
    public List<DemoProductDTO> bulkUpdate(List<DemoProductDTO> productDTOs) {
        log.info("Bulk updating {} demo products", productDTOs.size());

        List<DemoProduct> products = productDTOs.stream()
                .map(dto -> {
                    DemoProduct product = productRepository.findById(dto.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Demo Product", "id", dto.getId()));

                    product.setName(dto.getName());
                    product.setDescription(dto.getDescription());
                    product.setPrice(dto.getPrice());
                    product.setQuantity(dto.getQuantity());
                    product.setCategory(dto.getCategory());
                    product.setSku(dto.getSku());
                    if (dto.getStatus() != null) {
                        product.setStatus(dto.getStatus());
                    }
                    return product;
                })
                .collect(Collectors.toList());

        List<DemoProduct> savedProducts = productRepository.saveAll(products);
        return savedProducts.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Demo Product", "id", id);
        }
        productRepository.deleteById(id);
        log.info("Deleted demo product with id: {}", id);
    }

    private Sort buildSort(SearchRequest.SortInfo sortInfo) {
        if (sortInfo == null || sortInfo.getColumn() == null) {
            return Sort.by(Sort.Direction.DESC, "id");
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(sortInfo.getOrder())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        return Sort.by(direction, sortInfo.getColumn());
    }

    private DemoProductDTO toDTO(DemoProduct product) {
        return DemoProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .category(product.getCategory())
                .sku(product.getSku())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private DemoProduct toEntity(DemoProductDTO dto) {
        return DemoProduct.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .quantity(dto.getQuantity())
                .category(dto.getCategory())
                .sku(dto.getSku())
                .status(dto.getStatus() != null ? dto.getStatus() : DemoProduct.ProductStatus.ACTIVE)
                .build();
    }
}
