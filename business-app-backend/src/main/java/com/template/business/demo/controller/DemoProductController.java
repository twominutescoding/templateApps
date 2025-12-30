package com.template.business.demo.controller;

import com.template.business.demo.dto.DemoProductDTO;
import com.template.business.demo.service.DemoProductService;
import com.template.business.dto.ApiResponse;
import com.template.business.dto.PageResponse;
import com.template.business.dto.SearchRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/demo/products")
@RequiredArgsConstructor
@Tag(name = "Demo Products", description = "Demo product management APIs for testing and examples")
public class DemoProductController {

    private final DemoProductService productService;

    @PostMapping("/search")
    @Operation(summary = "Search demo products with filters, sorting, and pagination")
    public ResponseEntity<ApiResponse<PageResponse<DemoProductDTO>>> searchProducts(
            @RequestBody SearchRequest searchRequest) {
        PageResponse<DemoProductDTO> response = productService.searchProducts(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get demo product by ID")
    public ResponseEntity<ApiResponse<DemoProductDTO>> getProduct(@PathVariable Long id) {
        DemoProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @PostMapping
    @Operation(summary = "Create a new demo product")
    public ResponseEntity<ApiResponse<DemoProductDTO>> createProduct(@Valid @RequestBody DemoProductDTO productDTO) {
        DemoProductDTO created = productService.createProduct(productDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Demo product created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing demo product")
    public ResponseEntity<ApiResponse<DemoProductDTO>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody DemoProductDTO productDTO) {
        DemoProductDTO updated = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(ApiResponse.success("Demo product updated successfully", updated));
    }

    @PutMapping("/bulk-update")
    @Operation(summary = "Bulk update demo products")
    public ResponseEntity<ApiResponse<List<DemoProductDTO>>> bulkUpdateProducts(
            @RequestBody Map<String, List<DemoProductDTO>> request) {
        List<DemoProductDTO> products = request.get("products");
        List<DemoProductDTO> updated = productService.bulkUpdate(products);
        return ResponseEntity.ok(ApiResponse.success("Demo products updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a demo product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Demo product deleted successfully", null));
    }
}
