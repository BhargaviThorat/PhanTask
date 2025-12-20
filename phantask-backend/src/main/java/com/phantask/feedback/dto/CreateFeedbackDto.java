package com.phantask.feedback.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

/**
 * DTO used by ADMIN to create or update a feedback template.
 *
 * This defines:
 *  - feedback title
 *  - roles to which feedback is assigned (multiple roles allowed)
 *  - list of feedback questions
 *
 * This DTO does NOT contain any database-related fields.
 */
@Data
public class CreateFeedbackDto {

    /**
     * Title of the feedback.
     * Example: "Canteen Feedback", "Library Feedback"
     */
    @NotEmpty(message = "Feedback title cannot be empty")
    private String title;

    /**
     * List of roles to which this feedback applies.
     * Example: ["HR", "IT", "DEVELOPER"]
     *
     * Stored internally as comma-separated values.
     */
    @NotEmpty(message = "At least one role must be assigned")
    private List<String> assignedRoles;

    /**
     * List of questions shown to the user while submitting feedback.
     * Example: ["Cleanliness", "Food Quality", "Service Speed"]
     */
    @NotEmpty(message = "Feedback must contain at least one question")
    private List<String> questions;
}
