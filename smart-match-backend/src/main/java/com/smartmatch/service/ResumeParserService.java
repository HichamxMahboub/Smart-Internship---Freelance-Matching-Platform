package com.smartmatch.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Locale;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Downloads a candidate CV (Cloudinary URL or local upload path) and extracts plain text
 * from PDF or DOCX for AI analysis and skill inference.
 */
@Service
public class ResumeParserService {
    private static final Logger log = Logger.getLogger(ResumeParserService.class.getName());
    private static final int MAX_TEXT_CHARS = 14_000;
    private static final Duration FETCH_TIMEOUT = Duration.ofSeconds(25);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(FETCH_TIMEOUT)
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    @Value("${smartmatch.upload.cv-dir:/uploads/cv}")
    private String cvUploadDir;

    public Optional<String> extractTextFromCvUrl(String cvUrl) {
        if (!StringUtils.hasText(cvUrl)) {
            return Optional.empty();
        }
        try {
            byte[] bytes = fetchBytes(cvUrl.trim());
            String text = parseBytes(bytes, cvUrl);
            if (!StringUtils.hasText(text)) {
                return Optional.empty();
            }
            return Optional.of(truncate(normalizeWhitespace(text)));
        } catch (Exception exception) {
            log.log(Level.WARNING, "Could not parse CV at " + cvUrl + ": " + exception.getMessage());
            return Optional.empty();
        }
    }

    public String truncate(String text) {
        if (text.length() <= MAX_TEXT_CHARS) {
            return text;
        }
        return text.substring(0, MAX_TEXT_CHARS) + "\n…[truncated]";
    }

    private byte[] fetchBytes(String cvUrl) throws IOException, InterruptedException {
        if (cvUrl.startsWith("http://") || cvUrl.startsWith("https://")) {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(cvUrl))
                    .timeout(FETCH_TIMEOUT)
                    .GET()
                    .build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IOException("HTTP " + response.statusCode() + " fetching CV");
            }
            return response.body();
        }
        Path path = resolveLocalPath(cvUrl);
        if (!Files.exists(path)) {
            throw new IOException("Local CV not found: " + path);
        }
        return Files.readAllBytes(path);
    }

    private Path resolveLocalPath(String cvUrl) {
        String normalized = cvUrl.startsWith("/") ? cvUrl.substring(1) : cvUrl;
        if (normalized.startsWith("uploads/cv/")) {
            String filename = normalized.substring("uploads/cv/".length());
            return Path.of(cvUploadDir).resolve(filename).normalize();
        }
        return Path.of(cvUrl).normalize();
    }

    private String parseBytes(byte[] bytes, String cvUrl) throws IOException {
        String lower = cvUrl.toLowerCase(Locale.ROOT);
        if (lower.contains(".pdf") || isPdf(bytes)) {
            return parsePdf(bytes);
        }
        if (lower.contains(".docx") || isZipOfficeOpenXml(bytes)) {
            return parseDocx(bytes);
        }
        throw new IOException("Unsupported CV format (use PDF or DOCX)");
    }

    private String parsePdf(byte[] bytes) throws IOException {
        try (PDDocument document = PDDocument.load(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(document);
        }
    }

    private String parseDocx(byte[] bytes) throws IOException {
        try (InputStream input = new ByteArrayInputStream(bytes);
             XWPFDocument document = new XWPFDocument(input);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    private static boolean isPdf(byte[] bytes) {
        return bytes.length >= 4 && bytes[0] == '%' && bytes[1] == 'P' && bytes[2] == 'D' && bytes[3] == 'F';
    }

    private static boolean isZipOfficeOpenXml(byte[] bytes) {
        return bytes.length >= 2 && bytes[0] == 'P' && bytes[1] == 'K';
    }

    private static String normalizeWhitespace(String text) {
        return text.replaceAll("\\s{2,}", " ").trim();
    }
}
