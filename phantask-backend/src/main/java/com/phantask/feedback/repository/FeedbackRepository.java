package com.phantask.feedback.repository;

import com.phantask.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for Feedback entity.
 *
 * Handles CRUD operations for feedback templates
 * created by admin.
 *
 * Uses feedbackId as primary key.
 */
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // No custom methods required currently
}
