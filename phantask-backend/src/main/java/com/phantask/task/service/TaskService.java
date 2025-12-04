package com.phantask.task.service;

import java.util.List;

import com.phantask.task.dto.AdminTaskDTO;
import com.phantask.task.dto.EmployeeTaskDTO;
import com.phantask.task.dto.TaskResponse;

public interface TaskService {

    // Admin operations
    TaskResponse createTask(AdminTaskDTO dto, String adminUsername);
    TaskResponse updateTask(Long id, AdminTaskDTO dto);
    boolean deleteTask(Long id);
    List<TaskResponse> getAllTasksAdmin();

    // Employee operations (visibility logic)
    List<TaskResponse> getAllTasksForUser(String username, List<String> roles);
    List<TaskResponse> getPendingTasksForUser(String username, List<String> roles);
    List<TaskResponse> getSubmittedTasksForUser(String username, List<String> roles);

    // Submit
    TaskResponse submitTask(Long taskId, EmployeeTaskDTO dto, String username);
}
