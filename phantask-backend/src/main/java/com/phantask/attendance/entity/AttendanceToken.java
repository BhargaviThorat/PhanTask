package com.phantask.attendance.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.phantask.authentication.entity.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "attendance_tokens",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"uid", "date"})
    }
)
@Getter
@Setter
public class AttendanceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uid", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;
}
