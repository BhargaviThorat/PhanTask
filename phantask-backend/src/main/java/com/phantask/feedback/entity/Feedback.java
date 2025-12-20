package com.phantask.feedback.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Represents a feedback template created by ADMIN.
 *
 * One feedback:
 *  - has multiple questions
 *  - can be assigned to multiple roles
 *  - can receive multiple anonymous submissions
 */
@Data
@Entity
@Table(name = "feedback")
public class Feedback {

    /**
     * Primary key for feedback template.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    /**
     * Title of the feedback.
     * Example: "Canteen Feedback"
     */
    @Column(nullable = false)
    private String title;

    /**
     * Comma-separated list of roles this feedback is assigned to.
     * Example: "HR,IT,DEVELOPER"
     */
    @Column(name = "assigned_roles", nullable = false)
    private String assignedRoles;

    /**
     * Timestamp when feedback was created.
     */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Comma-separated list of questions for this feedback.
     * Stored as TEXT to support longer content.
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String questions;
}
