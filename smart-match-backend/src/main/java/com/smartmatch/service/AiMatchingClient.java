package com.smartmatch.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Thin wrapper around OpenRouter's OpenAI-compatible Chat Completions API that turns
 * candidate/offer text into structured matching results. Disabled (and skipped) when no
 * API key is configured, so the platform keeps working using the heuristic fallback in
 * {@link AIService}. Uses the {@code openrouter/free} auto-router by default, which picks
 * an available free model that supports the requested features.
 */
@Service
public class AiMatchingClient {
    private static final Logger log = Logger.getLogger(AiMatchingClient.class.getName());
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String SYSTEM = "You are a recruiting assistant. Always respond with strict, minified JSON and nothing else.";

    private final String apiKey;
    private final String model;
    private final long maxTokens;
    private final String baseUrl;
    private final String referer;
    private final String title;

    @Getter
    private boolean enabled;
    private RestClient http;

    public AiMatchingClient(
            @Value("${smartmatch.ai.api-key:}") String apiKey,
            @Value("${smartmatch.ai.model:openrouter/free}") String model,
            @Value("${smartmatch.ai.max-tokens:1024}") long maxTokens,
            @Value("${smartmatch.ai.base-url:https://openrouter.ai/api/v1}") String baseUrl,
            @Value("${smartmatch.ai.referer:https://interlance.app}") String referer,
            @Value("${smartmatch.ai.title:Interlance}") String title) {
        this.apiKey = apiKey;
        this.model = model;
        this.maxTokens = maxTokens;
        this.baseUrl = baseUrl;
        this.referer = referer;
        this.title = title;
    }

    @PostConstruct
    void init() {
        if (StringUtils.hasText(apiKey)) {
            this.http = RestClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeader("Authorization", "Bearer " + apiKey)
                    .defaultHeader("Content-Type", "application/json")
                    .defaultHeader("HTTP-Referer", referer)
                    .defaultHeader("X-Title", title)
                    .build();
            this.enabled = true;
            log.info("AiMatchingClient enabled via OpenRouter with model " + model);
        } else {
            log.info("AiMatchingClient disabled (no OPENROUTER_API_KEY); using heuristic fallback.");
        }
    }

    public record MatchResult(double score, List<String> reasons, List<String> gaps) {
    }

    public record CvAnalysis(double score, List<String> extractedSkills, String recommendation, String details) {
    }

    public record ProfileSuggestions(double score, String recommendation, String details) {
    }

    /** Semantic 0-100 match score between a candidate profile and an offer, with reasons and gaps. */
    public MatchResult scoreMatch(String candidateText, String offerText) {
        String prompt = "Score how well this candidate fits this job offer.\n\n"
                + "CANDIDATE:\n" + candidateText + "\n\nOFFER:\n" + offerText + "\n\n"
                + "Return ONLY JSON: {\"score\": <0-100 number>, \"reasons\": [<short strings>], \"gaps\": [<short strings>]}.";
        JsonNode json = callJson(prompt);
        return new MatchResult(
                json.path("score").asDouble(0.0),
                stringList(json.path("reasons")),
                stringList(json.path("gaps")));
    }

    /** Analyze a candidate CV/profile: extract skills and give improvement advice. */
    public CvAnalysis analyzeCv(String profileText) {
        String prompt = "Analyze this candidate profile/CV for recruiter readiness.\n\n" + profileText + "\n\n"
                + "Return ONLY JSON: {\"score\": <0-100 number>, \"extractedSkills\": [<strings>], "
                + "\"recommendation\": <one paragraph of advice>, \"details\": <one paragraph summary>}.";
        JsonNode json = callJson(prompt);
        return new CvAnalysis(
                json.path("score").asDouble(0.0),
                stringList(json.path("extractedSkills")),
                json.path("recommendation").asText(""),
                json.path("details").asText(""));
    }

    /** Suggest concrete improvements to make a candidate profile more competitive. */
    public ProfileSuggestions optimizeProfile(String profileText) {
        String prompt = "Suggest concrete improvements to make this candidate profile more competitive.\n\n"
                + profileText + "\n\n"
                + "Return ONLY JSON: {\"score\": <0-100 completeness number>, "
                + "\"recommendation\": <actionable suggestions>, \"details\": <short rationale>}.";
        JsonNode json = callJson(prompt);
        return new ProfileSuggestions(
                json.path("score").asDouble(0.0),
                json.path("recommendation").asText(""),
                json.path("details").asText(""));
    }

    private JsonNode callJson(String prompt) {
        String raw = call(prompt);
        try {
            return MAPPER.readTree(extractJson(raw));
        } catch (Exception exception) {
            log.log(Level.WARNING, "Failed to parse AI JSON response: " + exception.getMessage());
            return MAPPER.createObjectNode();
        }
    }

    private String call(String prompt) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("max_tokens", maxTokens);
        body.put("messages", List.of(
                Map.of("role", "system", "content", SYSTEM),
                Map.of("role", "user", "content", prompt)));
        try {
            String response = http.post()
                    .uri("/chat/completions")
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode root = MAPPER.readTree(response);
            return root.path("choices").path(0).path("message").path("content").asText("");
        } catch (Exception exception) {
            log.log(Level.WARNING, "OpenRouter request failed: " + exception.getMessage());
            return "";
        }
    }

    private static String extractJson(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }
        return text;
    }

    private static List<String> stringList(JsonNode node) {
        List<String> values = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(element -> values.add(element.asText()));
        }
        return values;
    }
}
