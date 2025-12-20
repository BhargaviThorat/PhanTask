package com.phantask.feedback.repository;

import com.phantask.feedback.entity.Feedback;
import com.phantask.feedback.entity.Rating;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for Rating entity.
 *
 * Stores anonymous ratings for feedback questions.
 * No user identity is stored here.
 */
public interface RatingRepository extends JpaRepository<Rating, Long> {

    /**
     * Fetch all ratings associated with a specific feedback.
     * Used during report generation.
     */
    List<Rating> findByFeedback(Feedback feedback);

    /**
     * Delete all ratings associated with a feedback.
     * Used when admin deletes a feedback.
     */
    void deleteByFeedback(Feedback feedback);
}
