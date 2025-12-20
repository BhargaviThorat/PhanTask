package com.phantask.feedback.dto;

import java.util.Map;
import lombok.Data;

/**
 * DTO returned to ADMIN when viewing feedback report.
 *
 * This DTO contains only aggregated data.
 * Individual user ratings or identities are never exposed.
 */
@Data
public class FeedbackReportDto {

    /**
     * Average rating per question.
     * Values are rounded and range from 1 to 5.
     *
     * Example:
     * {
     *   "Cleanliness": 4,
     *   "Food Quality": 5
     * }
     */
    private Map<String, Integer> averagePerQuestion;

    /**
     * Overall average rating scaled to 10.
     * Calculation:
     *  - Average of per-question averages
     *  - Multiply by 2
     *  - Round off
     *
     * Example: 8
     */
    private int overallAverage;

    /**
     * Total number of users who submitted this feedback.
     */
    private long totalSubmissions;
}
