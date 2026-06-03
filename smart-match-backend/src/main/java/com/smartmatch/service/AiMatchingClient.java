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
 * Smart Match AI client. Calls an OpenAI-compatible Chat Completions endpoint to turn
 * candidate/offer text into structured matching results. Disabled when no API key is
 * configured; the platform falls back to a deterministic heuristic in {@link AIService}.
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
            log.info("Smart Match AI client enabled with model " + model);
        } else {
            log.info("AiMatchingClient disabled (no OPENROUTER_API_KEY); using heuristic fallback.");
        }
    }

    public record MatchResult(double score, List<String> reasons, List<String> gaps) {
    }

    public record SkillScore(String name, int level) {
    }

    public record CvAnalysis(double score, List<String> extractedSkills, List<SkillScore> skillLevels,
                             String profileType, String primaryStack, String seniority,
                             String recommendation, String conclusion, String details) {
    }

    public record ProfileSuggestions(double score, String recommendation, String details) {
    }

    public record StructuredExperience(String role, String org, String start, String end, boolean current, String description) {
    }

    public record StructuredEducation(String school, String degree, String field, String start, String end) {
    }

    public record StructuredProfile(
            String headline,
            String bio,
            String location,
            String fieldOfStudy,
            String educationLevel,
            List<String> languages,
            List<SkillScore> skillLevels,
            List<StructuredExperience> experiences,
            List<StructuredEducation> educations) {
    }

    /** Semantic 0-100 match score between a candidate profile and an offer, with reasons and gaps. */
    public MatchResult scoreMatch(String candidateText, String offerText) {
        String prompt = "You are a senior tech recruiter. Score how well this candidate fits this job offer using this rubric:\n"
                + "- Required-skill coverage (40%): proportion of required skills that the candidate demonstrably has, weighted by depth.\n"
                + "- Skill depth and recency (25%): years of practice, recency, project complexity for the matched skills.\n"
                + "- Experience relevance (20%): industries, roles, scale of past work versus what the offer needs.\n"
                + "- Education and languages (10%): degree level, field alignment, language fluency.\n"
                + "- Soft signals (5%): portfolio quality, ownership, certifications.\n"
                + "Be strict: do not inflate. If a required skill is missing, list it in gaps.\n\n"
                + "CANDIDATE:\n" + candidateText + "\n\nOFFER:\n" + offerText + "\n\n"
                + "Return ONLY JSON: {\"score\": <0-100 integer>, "
                + "\"reasons\": [<3-5 short, concrete strings citing evidence>], "
                + "\"gaps\": [<2-5 short strings naming missing or weak skills/experience>]}.";
        JsonNode json = callJson(prompt);
        return new MatchResult(
                json.path("score").asDouble(0.0),
                stringList(json.path("reasons")),
                stringList(json.path("gaps")));
    }

    /** Analyze a candidate profile plus optional parsed resume text; extract skills with proficiency levels. */
    public CvAnalysis analyzeCv(String profileText, boolean resumeTextIncluded) {
        String resumeHint = resumeTextIncluded
                ? "Use the RESUME FILE TEXT section as the primary source for skills and experience."
                : "No resume file text was available; infer only from the profile fields.";
        String prompt = "You are a senior technical recruiter. Analyze this candidate for recruiter readiness.\n"
                + resumeHint + "\n\n"
                + profileText + "\n\n"
                + "Classify the candidate into a concise role title (profileType) such as 'React Frontend Engineer', "
                + "'Full-Stack JavaScript Engineer', 'Backend Java/Spring Engineer', 'Data Analyst', 'Data Scientist', "
                + "'ML Engineer', 'DevOps Engineer', 'Mobile React Native Engineer', 'iOS Engineer', 'Android Engineer', "
                + "'UI/UX Designer', 'Cybersecurity Analyst', 'Cloud Engineer', etc. Pick the role that best fits the evidence.\n"
                + "Identify the primaryStack (top 2-4 technologies that define the candidate, comma-separated).\n"
                + "Estimate seniority as one of: 'Student', 'Intern', 'Junior', 'Mid', 'Senior', 'Lead' based on years of "
                + "experience and project depth.\n"
                + "For each skill estimate a proficiency level on this scale: 90-100 expert (multiple production projects, years of use), "
                + "70-89 advanced (built real projects, deep knowledge), 50-69 intermediate (used in coursework or a single project), "
                + "30-49 basic (familiar, can read code), 1-29 exposure only. "
                + "Only include skills evidenced in the resume or profile. Limit to the top 15 most relevant skills.\n"
                + "Return ONLY JSON: {\"score\": <0-100 integer overall readiness>, "
                + "\"profileType\": <role title>, "
                + "\"primaryStack\": <comma-separated top techs>, "
                + "\"seniority\": <Student|Intern|Junior|Mid|Senior|Lead>, "
                + "\"extractedSkills\": [<skill strings, same order as skillLevels>], "
                + "\"skillLevels\": [{\"name\": <skill>, \"level\": <1-100 integer>}], "
                + "\"recommendation\": <one paragraph: hireability summary and what to ask in interview>, "
                + "\"conclusion\": <one or two sentences: who this candidate is and what they are best suited for>, "
                + "\"details\": <one paragraph evidence summary citing the resume>}.";
        JsonNode json = callJson(prompt);
        return new CvAnalysis(
                json.path("score").asDouble(0.0),
                stringList(json.path("extractedSkills")),
                skillList(json.path("skillLevels")),
                json.path("profileType").asText(""),
                json.path("primaryStack").asText(""),
                json.path("seniority").asText(""),
                json.path("recommendation").asText(""),
                json.path("conclusion").asText(""),
                json.path("details").asText(""));
    }

    /** Parse a raw CV (resume) into structured profile fields the platform can autofill. */
    public StructuredProfile extractStructuredProfile(String resumeText) {
        String prompt = "You read a candidate resume and extract structured information for a recruiting platform.\n"
                + "Do not invent data — if a field is not present, omit it (skip, do not write 'unknown').\n"
                + "For skills, infer a proficiency level 1-100 using this rubric: 90-100 expert, 70-89 advanced, "
                + "50-69 intermediate, 30-49 basic, 1-29 exposure only.\n\n"
                + "RESUME TEXT:\n" + resumeText + "\n\n"
                + "Return ONLY JSON with this exact shape:\n"
                + "{"
                + "\"headline\": <short professional title, max 100 chars>, "
                + "\"bio\": <2-3 sentence summary>, "
                + "\"location\": <city, country>, "
                + "\"fieldOfStudy\": <single field>, "
                + "\"educationLevel\": <e.g. Bachelor, Master, PhD, Engineering Degree>, "
                + "\"languages\": [<spoken languages>], "
                + "\"skillLevels\": [{\"name\": <skill>, \"level\": <1-100>}], "
                + "\"experiences\": [{\"role\": <>, \"org\": <>, \"start\": <YYYY-MM or YYYY>, \"end\": <YYYY-MM or YYYY or empty>, \"current\": <true|false>, \"description\": <one line>}], "
                + "\"educations\": [{\"school\": <>, \"degree\": <>, \"field\": <>, \"start\": <YYYY>, \"end\": <YYYY>}]"
                + "}.";
        JsonNode json = callJson(prompt);
        return new StructuredProfile(
                text(json, "headline"),
                text(json, "bio"),
                text(json, "location"),
                text(json, "fieldOfStudy"),
                text(json, "educationLevel"),
                stringList(json.path("languages")),
                skillList(json.path("skillLevels")),
                experienceList(json.path("experiences")),
                educationList(json.path("educations")));
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
            log.log(Level.WARNING, "AI request failed: " + exception.getMessage());
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

    private static String text(JsonNode parent, String field) {
        JsonNode child = parent.path(field);
        if (child.isMissingNode() || child.isNull()) {
            return null;
        }
        String value = child.asText("");
        return value.isBlank() ? null : value.trim();
    }

    private static List<SkillScore> skillList(JsonNode node) {
        List<SkillScore> values = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(element -> {
                String name = element.path("name").asText("").trim();
                int level = clampLevel(element.path("level").asInt(0));
                if (!name.isEmpty()) {
                    values.add(new SkillScore(name, level));
                }
            });
        }
        return values;
    }

    private static int clampLevel(int value) {
        if (value < 0) return 0;
        return Math.min(value, 100);
    }

    private static List<StructuredExperience> experienceList(JsonNode node) {
        List<StructuredExperience> values = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(element -> values.add(new StructuredExperience(
                    optText(element, "role"),
                    optText(element, "org"),
                    optText(element, "start"),
                    optText(element, "end"),
                    element.path("current").asBoolean(false),
                    optText(element, "description"))));
        }
        return values;
    }

    private static List<StructuredEducation> educationList(JsonNode node) {
        List<StructuredEducation> values = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(element -> values.add(new StructuredEducation(
                    optText(element, "school"),
                    optText(element, "degree"),
                    optText(element, "field"),
                    optText(element, "start"),
                    optText(element, "end"))));
        }
        return values;
    }

    private static String optText(JsonNode node, String field) {
        String value = node.path(field).asText("");
        return value.isBlank() ? null : value.trim();
    }
}
