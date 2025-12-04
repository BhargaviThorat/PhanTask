package com.phantask.task.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskResponse {
    private Long id;
    private String taskName;
    private String description;
    private LocalDate assignDate;
    private LocalDate dueDate;
    private LocalDateTime uploadDateTime;
    private String status;
    private String driveUrl;
    private String assignedToUser;
    private String assignedToRole;
    private String createdBy;
}
