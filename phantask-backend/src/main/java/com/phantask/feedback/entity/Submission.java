package com.phantask.feedback.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Tracks which user has submitted which feedback.
 *
 * This entity:
 *  - Prevents duplicate submissions
 *  - Stores user identity and role
 *  - Does NOT store ratings (ratings are anonymous)
 */
@Data
@Entity
@Table(
    name = "submission",
    uniqueConstraints = @UniqueConstraint(columnNames = {"feedback_id", "username"})
)
public class Submission {

    /**
     * Primary key for submission.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long submissionId;

    /**
     * Feedback for which submission was made.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feedback_id", nullable = false)
    private Feedback feedback;

    /**
     * Username of the user who submitted feedback.
     * Used only for preventing duplicate submissions.
     */
    @Column(nullable = false)
    private String username;

    /**
     * Role of the user at the time of submission.
     * Stored for audit and reporting purposes.
     */
    @Column(nullable = false)
    private String userRole;

    /**
     * Timestamp when feedback was submitted.
     */
    @Column(nullable = false)
    private LocalDateTime submittedAt;
}
