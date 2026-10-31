package com.fashionstore.backend.modules.product.service.impl;

import com.fashionstore.backend.common.dto.PageResponse;
import com.fashionstore.backend.common.exception.AppException;
import com.fashionstore.backend.modules.product.dto.CategoryDto;
import com.fashionstore.backend.modules.product.dto.CreateCategoryRequest;
import com.fashionstore.backend.modules.product.dto.CreateProductRequest;
import com.fashionstore.backend.modules.product.dto.ProductDto;
import com.fashionstore.backend.modules.product.entity.Category;
import com.fashionstore.backend.modules.product.entity.Product;
import com.fashionstore.backend.modules.product.repository.CategoryRepository;
import com.fashionstore.backend.modules.product.repository.ProductRepository;
import com.fashionstore.backend.modules.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    @Cacheable(value = "product_catalog", key = "#onlyActive")
    public List<ProductDto> getAllProducts(boolean onlyActive) {
        log.info("Querying database for product catalog (Cache miss, onlyActive={})", onlyActive);
        List<Product> products = onlyActive
                ? productRepository.findByActiveTrueOrderByCreatedAtDesc()
                : productRepository.findAllByOrderByCreatedAtDesc();
        return products.stream().map(this::mapToDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductDto> getProductsPaginated(int page, int size, Long categoryId, boolean onlyActive, String search, String sortBy, String sortDir) {
        if (page < 0) page = 0;
        if (size <= 0) size = 10;
        if (size > 100) size = 100;

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String property = (sortBy != null && !sortBy.isBlank()) ? sortBy : "createdAt";
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));

        Page<Product> productPage = productRepository.searchProducts(categoryId, onlyActive, search, pageable);
        List<ProductDto> dtoList = productPage.getContent().stream().map(this::mapToDto).toList();

        return PageResponse.<ProductDto>builder()
                .content(dtoList)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .first(productPage.isFirst())
                .last(productPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public ProductDto getProductById(Long id) {
        log.info("Querying database for product ID={} (Cache miss)", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));
        return mapToDto(product);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "product_catalog", allEntries = true)
    })
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
        log.info("Created new product ID={}, Name={} (Evicted Redis caches)", saved.getId(), saved.getName());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", key = "#id"),
            @CacheEvict(value = "product_catalog", allEntries = true)
    })
    public ProductDto restockProduct(Long id, int addedQuantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));

        product.setStock(product.getStock() + addedQuantity);
        Product saved = productRepository.save(product);
        log.info("Restocked product ID={}: new stock={} (Evicted Redis caches)", id, saved.getStock());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", key = "#id"),
            @CacheEvict(value = "product_catalog", allEntries = true)
    })
    public ProductDto toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));

        product.setActive(!product.getActive());
        Product saved = productRepository.save(product);
        log.info("Toggled product ID={} status to {} (Evicted Redis caches)", id, saved.getActive());
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories")
    public List<CategoryDto> getAllCategories() {
        log.info("Querying database for categories (Cache miss)");
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

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto createCategory(CreateCategoryRequest request) {
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? request.getSlug().trim().toLowerCase()
                : generateSlug(request.getName());

        if (categoryRepository.findBySlug(slug).isPresent()) {
            throw new AppException("Slug danh mục '" + slug + "' đã tồn tại", HttpStatus.BAD_REQUEST);
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Created new category ID={}, Name={} (Evicted Redis categories cache)", saved.getId(), saved.getName());
        return mapCategoryToDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto updateCategory(Long id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Danh mục không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));

        if (request.getName() != null && !request.getName().isBlank()) {
            category.setName(request.getName().trim());
        }

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            String newSlug = request.getSlug().trim().toLowerCase();
            categoryRepository.findBySlug(newSlug).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new AppException("Slug danh mục '" + newSlug + "' đã tồn tại", HttpStatus.BAD_REQUEST);
                }
            });
            category.setSlug(newSlug);
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            category.setImageUrl(request.getImageUrl());
        }

        Category saved = categoryRepository.save(category);
        log.info("Updated category ID={}: Name={} (Evicted Redis categories cache)", saved.getId(), saved.getName());
        return mapCategoryToDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Danh mục không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));

        categoryRepository.delete(category);
        log.info("Deleted category ID={} (Evicted Redis categories cache)", id);
    }

    private CategoryDto mapCategoryToDto(Category c) {
        return CategoryDto.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .build();
    }

    private String generateSlug(String input) {
        if (input == null) return "";
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD);
        String slug = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        slug = slug.toLowerCase().replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("[\\s-]+", " ").trim();
        return slug.replaceAll(" ", "-");
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
