package com.phantask.feedback.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Represents an anonymous rating for a single question.
 *
 * Important:
 *  - No user identifier is stored here
 *  - Ratings cannot be mapped back to a user
 *  - Used only for aggregation and reporting
 */
@Data
@Entity
@Table(name = "rating")
public class Rating {

    /**
     * Primary key for rating.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ratingId;

    /**
     * Feedback to which this rating belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feedback_id", nullable = false)
    private Feedback feedback;

    /**
     * Question text for which rating is given.
     * Example: "Cleanliness"
     */
    @Column(nullable = false)
    private String question;

    /**
     * Rating value given by user.
     * Expected range: 1–5
     */
    @Column(nullable = false)
    private int rating;
}
