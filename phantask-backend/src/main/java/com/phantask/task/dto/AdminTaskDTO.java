package com.phantask.task.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AdminTaskDTO {
    private String taskName;
    private String description;
    private LocalDate assignDate;   // optional, if null server will set LocalDate.now()
    private LocalDate dueDate;
    private String assignedToUser;  // optional
    private String assignedToRole;  // optional
}
