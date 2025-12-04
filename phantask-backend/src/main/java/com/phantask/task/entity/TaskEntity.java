package com.phantask.task.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String taskName;

    @Column(length = 2000)
    private String description;

    private LocalDate assignDate;

    private LocalDate dueDate;

    private LocalDateTime uploadDateTime; // set when employee submits

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    private String driveUrl; // employee-submitted drive URL

    private String assignedToUser; // specific username
    private String assignedToRole; // role name, e.g. HR, TECHNICAL

    private String createdBy; // admin username who created the task
}
