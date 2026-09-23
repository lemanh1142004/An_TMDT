package com.fashionstore.backend.modules.upload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadImageResponse {
    private String url;
    private String fileName;
    private String fileType;
    private Long size;
    private LocalDateTime uploadedAt;
}
