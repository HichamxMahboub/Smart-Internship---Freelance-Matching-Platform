package com.smartmatch.service;

import com.smartmatch.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileStorageServiceTest {
    @TempDir
    Path tempDir;

    @Test
    void acceptsValidPdf() {
        FileStorageService service = service();
        MockMultipartFile file = new MockMultipartFile("file", "cv.pdf", "application/pdf", "%PDF-1.4".getBytes());

        String storedPath = service.storeCv(file, "user-1");

        assertThat(storedPath).startsWith("/uploads/cv/cv-").endsWith(".pdf");
        assertThat(Files.exists(tempDir.resolve(storedPath.substring("/uploads/cv/".length())))).isTrue();
    }

    @Test
    void rejectsPathTraversalFilename() {
        FileStorageService service = service();
        MockMultipartFile file = new MockMultipartFile("file", "../cv.pdf", "application/pdf", "%PDF".getBytes());

        assertThatThrownBy(() -> service.storeCv(file, "user-1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid CV filename");
    }

    @Test
    void rejectsInvalidContentType() {
        FileStorageService service = service();
        MockMultipartFile file = new MockMultipartFile("file", "cv.exe", "application/octet-stream", "bad".getBytes());

        assertThatThrownBy(() -> service.storeCv(file, "user-1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only PDF, DOC and DOCX");
    }

    @Test
    void rejectsFilesOverFiveMegabytes() {
        FileStorageService service = service();
        MockMultipartFile file = new MockMultipartFile("file", "cv.pdf", "application/pdf", new byte[5 * 1024 * 1024 + 1]);

        assertThatThrownBy(() -> service.storeCv(file, "user-1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("5MB");
    }

    private FileStorageService service() {
        CloudinaryStorageService cloudinaryStorageService = mock(CloudinaryStorageService.class);
        when(cloudinaryStorageService.isEnabled()).thenReturn(false);
        FileStorageService service = new FileStorageService(cloudinaryStorageService);
        ReflectionTestUtils.setField(service, "cvUploadDir", tempDir.toString());
        return service;
    }
}
