package com.phantask.task.dto;

import lombok.Data;

@Data
public class EmployeeTaskDTO {
    private String driveUrl;
    // status is implicitly set to SUBMITTED by server
}
