package com.phantask.feedback.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Map;

/**
 * DTO used by USER to submit feedback.
 *
 * Contains question-wise ratings only.
 * User identity is handled separately via authentication.
 */
@Data
public class SubmitFeedbackDto {

    /**
     * Map of question to rating.
     *
     * Example:
     * {
     *   "Cleanliness": 4,
     *   "Food Quality": 5
     * }
     *
     * Ratings are expected to be between 1 and 5.
     */
    @NotEmpty(message = "Ratings cannot be empty")
    private Map<String, Integer> ratings;
}
