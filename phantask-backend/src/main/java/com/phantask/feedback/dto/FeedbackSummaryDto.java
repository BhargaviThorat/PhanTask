package com.phantask.feedback.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Summary DTO used by ADMIN to view feedback templates.
 * This avoids exposing entity directly.
 */
@Data
public class FeedbackSummaryDto {

    private Long feedbackId;

    private String title;

    /**
     * Roles to which this feedback is assigned.
     * Example: ["HR", "IT", "DEVELOPER"]
     */
    private List<String> assignedRoles;

    /**
     * List of feedback questions.
     */
    private List<String> questions;

    /**
     * Feedback creation timestamp.
     */
    private LocalDateTime createdAt;

    /**
     * Number of users who submitted this feedback.
     */
    private long submissionCount;
}
