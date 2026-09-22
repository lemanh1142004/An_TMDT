package com.fashionstore.backend.modules.product.service.impl;

import com.fashionstore.backend.common.exception.AppException;
import com.fashionstore.backend.modules.product.dto.CategoryDto;
import com.fashionstore.backend.modules.product.dto.CreateProductRequest;
import com.fashionstore.backend.modules.product.dto.ProductDto;
import com.fashionstore.backend.modules.product.entity.Category;
import com.fashionstore.backend.modules.product.entity.Product;
import com.fashionstore.backend.modules.product.repository.CategoryRepository;
import com.fashionstore.backend.modules.product.repository.ProductRepository;
import com.fashionstore.backend.modules.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts(boolean onlyActive) {
        List<Product> products = onlyActive
                ? productRepository.findByActiveTrueOrderByCreatedAtDesc()
                : productRepository.findAllByOrderByCreatedAtDesc();
        return products.stream().map(this::mapToDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));
        return mapToDto(product);
    }

    @Override
    @Transactional
    public ProductDto createProduct(CreateProductRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }
        if (category == null && request.getCategory() != null) {
            category = categoryRepository.findByName(request.getCategory())
                    .or(() -> categoryRepository.findBySlug(request.getCategory().toLowerCase().replaceAll("\\s+", "-")))
                    .orElseGet(() -> categoryRepository.save(Category.builder()
                            .name(request.getCategory())
                            .slug(request.getCategory().toLowerCase().replaceAll("\\s+", "-"))
                            .build()));
        }

        Product product = Product.builder()
                .name(request.getName())
                .category(category)
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .stock(request.getStock())
                .image(request.getImage())
                .tag(request.getTag())
                .description(request.getDescription())
                .rating(5.0)
                .reviewsCount(0)
                .active(true)
                .build();

        Product saved = productRepository.save(product);
        log.info("Created new product: ID={}, Name={}", saved.getId(), saved.getName());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ProductDto restockProduct(Long id, int addedQuantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));

        product.setStock(product.getStock() + addedQuantity);
        Product saved = productRepository.save(product);
        log.info("Restocked product ID={}: new stock={}", id, saved.getStock());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ProductDto toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));

        product.setActive(!product.getActive());
        Product saved = productRepository.save(product);
        log.info("Toggled product ID={} status to {}", id, saved.getActive());
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .description(c.getDescription())
                        .imageUrl(c.getImageUrl())
                        .build())
                .toList();
    }

    private ProductDto mapToDto(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .category(p.getCategory() != null ? p.getCategory().getName() : "Khác")
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .stock(p.getStock())
                .image(p.getImage())
                .tag(p.getTag())
                .rating(p.getRating())
                .reviewsCount(p.getReviewsCount())
                .description(p.getDescription())
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
