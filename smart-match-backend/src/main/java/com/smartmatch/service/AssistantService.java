package com.smartmatch.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmatch.dto.assistant.AssistantChatRequest;
import com.smartmatch.dto.assistant.AssistantChatResponse;
import com.smartmatch.dto.assistant.MatchItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

/**
 * Proxies backoffice assistant questions to n8n. Two workflows behind one entry point:
 * the general RAG chat, and a resume-scoring flow that ranks candidates' CVs against a target
 * role. Scoring-intent questions ("score/rank/find a solution architect profile…") are routed to
 * the scoring webhook; everything else goes to the chat webhook. n8n stays internal to docker.
 */
@Service
public class AssistantService {
    private static final Logger log = Logger.getLogger(AssistantService.class.getName());
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** Heuristic for "rank/score candidates by resume" style questions. */
    private static final Pattern SCORING_INTENT = Pattern.compile(
            "(?i)(scor|\\branking\\b|\\brank\\b|shortlist|resume|\\bcv\\b|"
            + "best\\s+.{0,40}?(fit|profile|candidate)|"
            + "find\\s+.{0,40}?(profile|candidate)\\b)");

    private final String chatUrl;
    private final String scoringUrl;
    private final String candidateMatchUrl;
    private final String recruiterMatchUrl;
    private final RestClient http;

    public AssistantService(
            @Value("${smartmatch.assistant.n8n-url:http://n8n:5678/webhook/interlance-assistant}") String chatUrl,
            @Value("${smartmatch.assistant.scoring-n8n-url:http://n8n:5678/webhook/interlance-cv-score}") String scoringUrl,
            @Value("${smartmatch.assistant.candidate-match-url:http://n8n:5678/webhook/interlance-candidate-match}") String candidateMatchUrl,
            @Value("${smartmatch.assistant.recruiter-match-url:http://n8n:5678/webhook/interlance-recruiter-match}") String recruiterMatchUrl,
            @Value("${smartmatch.assistant.timeout-seconds:120}") long timeoutSeconds) {
        this.chatUrl = chatUrl;
        this.scoringUrl = scoringUrl;
        this.candidateMatchUrl = candidateMatchUrl;
        this.recruiterMatchUrl = recruiterMatchUrl;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
        this.http = RestClient.builder()
                .requestFactory(factory)
                .defaultHeader("Content-Type", "application/json")
                .build();
        log.info("Interlance assistant proxy — chat=" + chatUrl + " scoring=" + scoringUrl);
    }

    public AssistantChatResponse chat(AssistantChatRequest request) {
        boolean scoring = request.question() != null && SCORING_INTENT.matcher(request.question()).find();
        String target = scoring ? scoringUrl : chatUrl;

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("question", request.question());
        body.put("history", request.history() == null ? List.of() : request.history());
        body.put("sessionId", request.sessionId() == null || request.sessionId().isBlank()
                ? "default" : request.sessionId());
        try {
            String raw = http.post().uri(target).body(body).retrieve().body(String.class);
            return parse(raw);
        } catch (Exception exception) {
            log.log(Level.WARNING, "Assistant n8n request failed (" + (scoring ? "scoring" : "chat") + "): "
                    + exception.getMessage());
            String msg = scoring
                    ? "Couldn't score the resumes right now. The scoring workflow may be busy or rate-limited — try again shortly."
                    : "The assistant is unavailable right now. Make sure the n8n RAG workflow is active, then try again.";
            return new AssistantChatResponse(msg, null, List.of());
        }
    }

    /** Candidate's best-matching offers (Gemini-scored in n8n). */
    public List<MatchItem> candidateMatches(String candidateId) {
        return postMatches(candidateMatchUrl, Map.of("candidateId", candidateId), "candidate");
    }

    /** Best-matching candidates for a recruiter's offer (Gemini-scored in n8n). */
    public List<MatchItem> recruiterMatches(String offerId) {
        return postMatches(recruiterMatchUrl, Map.of("offerId", offerId), "recruiter");
    }

    private List<MatchItem> postMatches(String url, Map<String, Object> body, String label) {
        try {
            String raw = http.post().uri(url).body(body).retrieve().body(String.class);
            return parseMatches(raw);
        } catch (Exception exception) {
            log.log(Level.WARNING, "Assistant " + label + " match request failed: " + exception.getMessage());
            return List.of();
        }
    }

    private List<MatchItem> parseMatches(String raw) {
        List<MatchItem> out = new ArrayList<>();
        if (raw == null || raw.isBlank()) {
            return out;
        }
        try {
            JsonNode root = MAPPER.readTree(raw);
            if (root.isArray() && root.size() > 0) {
                root = root.get(0);
            }
            JsonNode matches = root.path("matches");
            if (matches.isArray()) {
                matches.forEach(node -> out.add(new MatchItem(
                        firstText(node, "offerId"),
                        firstText(node, "candidateId"),
                        firstText(node, "title"),
                        firstText(node, "name"),
                        firstText(node, "company"),
                        firstText(node, "type"),
                        firstText(node, "headline"),
                        node.path("score").isNumber() ? node.path("score").asInt() : null,
                        stringList(node.path("reasons")),
                        stringList(node.path("gaps")))));
            }
        } catch (Exception exception) {
            log.log(Level.WARNING, "Failed to parse match response: " + exception.getMessage());
        }
        return out;
    }

    /** n8n responses vary by node; accept an object or a single-element array and probe common keys. */
    private AssistantChatResponse parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return new AssistantChatResponse("(empty response from the assistant workflow)", null, List.of());
        }
        try {
            JsonNode node = MAPPER.readTree(raw);
            if (node.isArray() && node.size() > 0) {
                node = node.get(0);
            }
            if (node.has("json") && node.get("json").isObject()) {
                node = node.get("json");
            }
            String answer = firstText(node, "answer", "output", "text", "response", "message");
            if (answer == null) {
                answer = node.isTextual() ? node.asText() : raw.trim();
            }
            String thinking = firstText(node, "thinking", "reasoning", "thought");
            List<String> sources = stringList(node.path("sources"));
            return new AssistantChatResponse(answer, thinking, sources);
        } catch (Exception exception) {
            return new AssistantChatResponse(raw.trim(), null, List.of());
        }
    }

    private static String firstText(JsonNode node, String... keys) {
        for (String key : keys) {
            JsonNode child = node.path(key);
            if (child.isTextual() && !child.asText().isBlank()) {
                return child.asText().trim();
            }
        }
        return null;
    }

    private static List<String> stringList(JsonNode node) {
        List<String> values = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(element -> {
                String value = element.asText("").trim();
                if (!value.isEmpty()) {
                    values.add(value);
                }
            });
        }
        return values;
    }
}
