package com.phantask.task.controller;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.phantask.task.dto.AdminTaskDTO;
import com.phantask.task.dto.EmployeeTaskDTO;
import com.phantask.task.dto.TaskResponse;
import com.phantask.task.service.TaskService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

	private final TaskService taskService;

	// ----------------- ADMIN endpoints -----------------
	// Admin or HR can create tasks
	@PostMapping("/admin/create")
	@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
	public ResponseEntity<TaskResponse> createTask(@RequestBody AdminTaskDTO dto, Authentication auth) {
		String admin = auth.getName();
		TaskResponse resp = taskService.createTask(dto, admin);
		return ResponseEntity.ok(resp);
	}

	@PutMapping("/admin/update/{id}")
	@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
	public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id, @RequestBody AdminTaskDTO dto) {
		TaskResponse resp = taskService.updateTask(id, dto);
		return ResponseEntity.ok(resp);
	}

	@DeleteMapping("/admin/delete/{id}")
	@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
	public ResponseEntity<String> deleteTask(@PathVariable Long id) {
		boolean deleted = taskService.deleteTask(id);

		if (deleted) {
			return ResponseEntity.ok("Task deleted successfully");
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
		}
	}

	@GetMapping("/admin/all")
	@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
	public ResponseEntity<List<TaskResponse>> adminAll() {
		return ResponseEntity.ok(taskService.getAllTasksAdmin());
	}

	// ----------------- EMPLOYEE endpoints -----------------
	// Helper to extract roles (without ROLE_ prefix)
	private List<String> getRolesFromAuth(Authentication auth) {
		if (auth == null)
			return Collections.emptyList();
		return auth.getAuthorities().stream().map(a -> a.getAuthority().replace("ROLE_", ""))
				.collect(Collectors.toList());
	}

	// Get all tasks visible to logged-in user
	@GetMapping("/my")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<TaskResponse>> myTasks(Authentication auth) {
		String username = auth.getName();
		List<String> roles = getRolesFromAuth(auth);
		return ResponseEntity.ok(taskService.getAllTasksForUser(username, roles));
	}

	// Get pending tasks visible to logged-in user
	@GetMapping("/my/pending")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<TaskResponse>> myPending(Authentication auth) {
		String username = auth.getName();
		List<String> roles = getRolesFromAuth(auth);
		return ResponseEntity.ok(taskService.getPendingTasksForUser(username, roles));
	}

	// Get submitted tasks visible to logged-in user
	@GetMapping("/my/submitted")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<TaskResponse>> mySubmitted(Authentication auth) {
		String username = auth.getName();
		List<String> roles = getRolesFromAuth(auth);
		return ResponseEntity.ok(taskService.getSubmittedTasksForUser(username, roles));
	}

	// Submit task by logged in user (provide driveUrl)
	@PutMapping("/my/submit/{id}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<TaskResponse> submitTask(@PathVariable Long id, @RequestBody EmployeeTaskDTO dto,
			Authentication auth) {
		String username = auth.getName();
		TaskResponse resp = taskService.submitTask(id, dto, username);
		return ResponseEntity.ok(resp);
	}
}
