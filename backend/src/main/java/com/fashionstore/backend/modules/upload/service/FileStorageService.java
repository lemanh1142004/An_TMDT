package com.fashionstore.backend.modules.upload.service;

import com.fashionstore.backend.modules.upload.dto.UploadImageResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    UploadImageResponse storeImage(MultipartFile file);
    void deleteFile(String fileUrl);
}
