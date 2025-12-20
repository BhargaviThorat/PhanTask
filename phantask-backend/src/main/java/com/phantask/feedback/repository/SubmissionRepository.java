package com.phantask.feedback.repository;

import com.phantask.feedback.entity.Feedback;
import com.phantask.feedback.entity.Submission;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for Submission entity.
 *
 * Tracks which user has submitted which feedback.
 * Prevents duplicate submissions.
 */
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    /**
     * Checks whether a user has already submitted
     * feedback for a given feedback template.
     *
     * Used to prevent duplicate submissions.
     */
    boolean existsByFeedbackAndUsername(Feedback feedback, String username);

    /**
     * Counts total submissions for a feedback.
     * Used in admin report.
     */
    long countByFeedback(Feedback feedback);

    /**
     * Counts how many feedbacks a user has submitted.
     * Used in user dashboard.
     */
    long countByUsername(String username);

    /**
     * Deletes all submissions associated with a feedback.
     * Used when admin deletes a feedback.
     */
    void deleteByFeedback(Feedback feedback);
}
