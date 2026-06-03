package com.smartmatch.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Offline keyword-based skill extractor used when the AI client is disabled. */
public final class HeuristicSkillExtractor {
    private HeuristicSkillExtractor() {}

    private static final List<String> HINTS = List.of(
            "React", "React Native", "Angular", "Vue", "JavaScript", "TypeScript", "Node.js", "Express",
            "Java", "Spring", "Spring Boot", "Python", "Django", "Flask", "FastAPI", "C#", ".NET", "Go",
            "Rust", "Kotlin", "Swift", "Flutter", "Dart",
            "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Jenkins",
            "Figma", "Git", "HTML", "CSS", "Tailwind", "Next.js", "GraphQL", "REST API",
            "Machine Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn"
    );

    public static List<String> extract(String resumeText) {
        if (resumeText == null) return List.of();
        String lower = resumeText.toLowerCase(Locale.ROOT);
        List<String> found = new ArrayList<>();
        for (String hint : HINTS) {
            if (lower.contains(hint.toLowerCase(Locale.ROOT)) && !found.contains(hint)) {
                found.add(hint);
            }
        }
        return found;
    }
}
