package com.phantask.helpline.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "helpline_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HelplineTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Long ticketId;

    // -------- Ticket Raised By --------
    @Column(name = "raised_by_user_id", nullable = false)
    private Long raisedByUserId;

    @Column(name = "raised_by_email", nullable = false)
    private String raisedByEmail;

    // -------- Assignment (Role Based) --------
    @Column(name = "assigned_role_name", nullable = false)
    private String assignedRoleName;   // HR, MANAGER, SUPPORT, etc.

    // -------- Ticket Details --------
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority", nullable = false)
    private String priority;   // HIGH, MEDIUM, LOW

    @Column(name = "status", nullable = false)
    private String status;     // PENDING, RESOLVED

    // -------- Time Tracking --------
    @Column(name = "raised_at", nullable = false)
    private LocalDateTime raisedAt;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // -------- Resolution Info --------
    @Column(name = "resolved_by_user_id")
    private Long resolvedByUserId;
}
