package com.phantask.task.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.phantask.task.dto.AdminTaskDTO;
import com.phantask.task.dto.EmployeeTaskDTO;
import com.phantask.task.dto.TaskResponse;
import com.phantask.task.entity.TaskEntity;
import com.phantask.task.entity.TaskStatus;
import com.phantask.task.repository.TaskRepository;
import com.phantask.task.service.TaskService;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

	private final TaskRepository taskRepository;

	public TaskServiceImpl(TaskRepository taskRepository) {
		this.taskRepository = taskRepository;
	}

	// Helper: convert entity to response
	private TaskResponse toResponse(TaskEntity e) {
		TaskResponse r = new TaskResponse();
		r.setId(e.getId());
		r.setTaskName(e.getTaskName());
		r.setDescription(e.getDescription());
		r.setAssignDate(e.getAssignDate());
		r.setDueDate(e.getDueDate());
		r.setUploadDateTime(e.getUploadDateTime());
		r.setStatus(e.getStatus() == null ? null : e.getStatus().name());
		r.setDriveUrl(e.getDriveUrl());
		r.setAssignedToUser(e.getAssignedToUser());
		r.setAssignedToRole(e.getAssignedToRole());
		r.setCreatedBy(e.getCreatedBy());
		return r;
	}

	// ADMIN
	@Override
	public TaskResponse createTask(AdminTaskDTO dto, String adminUsername) {
		TaskEntity e = new TaskEntity();
		e.setTaskName(dto.getTaskName());
		e.setDescription(dto.getDescription());
		e.setAssignDate(dto.getAssignDate() == null ? LocalDate.now() : dto.getAssignDate());
		e.setDueDate(dto.getDueDate());
		e.setAssignedToUser(dto.getAssignedToUser());
		e.setAssignedToRole(dto.getAssignedToRole());
		e.setCreatedBy(adminUsername);
		e.setStatus(TaskStatus.PENDING);
		TaskEntity saved = taskRepository.save(e);
		return toResponse(saved);
	}

	@Override
	public TaskResponse updateTask(Long id, AdminTaskDTO dto) {
		TaskEntity e = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
		e.setTaskName(dto.getTaskName());
		e.setDescription(dto.getDescription());
		e.setAssignDate(dto.getAssignDate() == null ? e.getAssignDate() : dto.getAssignDate());
		e.setDueDate(dto.getDueDate());
		e.setAssignedToUser(dto.getAssignedToUser());
		e.setAssignedToRole(dto.getAssignedToRole());
		// do not change createdBy/status/uploadDateTime here
		TaskEntity saved = taskRepository.save(e);
		return toResponse(saved);
	}

	@Override
	public boolean deleteTask(Long id) {
		Optional<TaskEntity> t = taskRepository.findById(id);

		if (t.isPresent()) {
			taskRepository.delete(t.get());
			return true;
		}
		return false;
	}

	@Override
	public List<TaskResponse> getAllTasksAdmin() {
		return taskRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
	}

	// HELPER: merge lists and dedupe by id
	private List<TaskEntity> mergeAndDedup(List<TaskEntity> a, List<TaskEntity> b) {
		Map<Long, TaskEntity> map = new LinkedHashMap<>();
		if (a != null)
			a.forEach(t -> map.put(t.getId(), t));
		if (b != null)
			b.forEach(t -> map.put(t.getId(), t));
		return new ArrayList<>(map.values());
	}

	@Override
	public List<TaskResponse> getAllTasksForUser(String username, List<String> roles) {
		List<TaskEntity> userTasks = taskRepository.findByAssignedToUser(username);
		List<TaskEntity> roleTasks = new ArrayList<>();
		if (roles != null) {
			for (String r : roles) {
				List<TaskEntity> list = taskRepository.findByAssignedToRole(r);
				if (list != null)
					roleTasks.addAll(list);
			}
		}
		List<TaskEntity> merged = mergeAndDedup(userTasks, roleTasks);
		return merged.stream().map(this::toResponse).collect(Collectors.toList());
	}

	@Override
	public List<TaskResponse> getPendingTasksForUser(String username, List<String> roles) {
		List<TaskEntity> userTasks = taskRepository.findByAssignedToUserAndStatus(username, TaskStatus.PENDING);
		List<TaskEntity> roleTasks = new ArrayList<>();
		if (roles != null) {
			for (String r : roles) {
				List<TaskEntity> list = taskRepository.findByAssignedToRoleAndStatus(r, TaskStatus.PENDING);
				if (list != null)
					roleTasks.addAll(list);
			}
		}
		List<TaskEntity> merged = mergeAndDedup(userTasks, roleTasks);
		return merged.stream().map(this::toResponse).collect(Collectors.toList());
	}

	@Override
	public List<TaskResponse> getSubmittedTasksForUser(String username, List<String> roles) {
		List<TaskEntity> userTasks = taskRepository.findByAssignedToUserAndStatus(username, TaskStatus.SUBMITTED);
		List<TaskEntity> roleTasks = new ArrayList<>();
		if (roles != null) {
			for (String r : roles) {
				List<TaskEntity> list = taskRepository.findByAssignedToRoleAndStatus(r, TaskStatus.SUBMITTED);
				if (list != null)
					roleTasks.addAll(list);
			}
		}
		List<TaskEntity> merged = mergeAndDedup(userTasks, roleTasks);
		return merged.stream().map(this::toResponse).collect(Collectors.toList());
	}

	@Override
	public TaskResponse submitTask(Long taskId, EmployeeTaskDTO dto, String username) {
		TaskEntity e = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));

		// Ensure user is allowed to submit: assignedToUser == username OR
		// assignedToRole matches user's role
		// NOTE: security check should be performed by controller earlier; here assume
		// permitted.

		e.setDriveUrl(dto.getDriveUrl());
		e.setUploadDateTime(LocalDateTime.now());
		e.setStatus(TaskStatus.SUBMITTED);

		TaskEntity saved = taskRepository.save(e);
		return toResponse(saved);
	}
}
