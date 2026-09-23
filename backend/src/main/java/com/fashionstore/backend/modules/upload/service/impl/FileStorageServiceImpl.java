package com.fashionstore.backend.modules.upload.service.impl;

import com.fashionstore.backend.common.exception.AppException;
import com.fashionstore.backend.modules.upload.dto.UploadImageResponse;
import com.fashionstore.backend.modules.upload.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path imageStorageLocation;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/svg+xml"
    );

    @PostConstruct
    public void init() {
        this.imageStorageLocation = Paths.get(uploadDir, "images").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.imageStorageLocation);
            log.info("Thư mục lưu trữ hình ảnh tải lên đã sẵn sàng tại: {}", this.imageStorageLocation);
        } catch (IOException ex) {
            log.error("Không thể khởi tạo thư mục lưu trữ file tải lên", ex);
            throw new AppException("Không thể khởi tạo thư mục lưu trữ file: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public UploadImageResponse storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("Vui lòng chọn một file hình ảnh hợp lệ", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException("Định dạng file không được hỗ trợ. Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, GIF, SVG", HttpStatus.BAD_REQUEST);
        }

        // Check size <= 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new AppException("Dung lượng file vượt quá giới hạn cho phép (tối đa 10MB)", HttpStatus.BAD_REQUEST);
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        } else {
            extension = ".jpg";
        }

        String uniqueFileName = UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + extension;

        try {
            Path targetLocation = this.imageStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String publicUrl = "/uploads/images/" + uniqueFileName;
            log.info("Lưu file ảnh thành công: {} (Kích thước: {} bytes) -> URL: {}", uniqueFileName, file.getSize(), publicUrl);

            return UploadImageResponse.builder()
                    .url(publicUrl)
                    .fileName(uniqueFileName)
                    .fileType(contentType)
                    .size(file.getSize())
                    .uploadedAt(LocalDateTime.now())
                    .build();
        } catch (IOException ex) {
            log.error("Lỗi khi lưu file: {}", originalFilename, ex);
            throw new AppException("Không thể lưu file hình ảnh: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/images/")) {
            return;
        }
        String fileName = fileUrl.replace("/uploads/images/", "");
        try {
            Path filePath = this.imageStorageLocation.resolve(fileName).normalize();
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Đã xóa file ảnh: {}", fileName);
            }
        } catch (IOException ex) {
            log.warn("Không thể xóa file ảnh {}: {}", fileName, ex.getMessage());
        }
    }
}
