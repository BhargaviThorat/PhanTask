package com.phantask.notice.controller;

import com.phantask.notice.dto.CreateNoticeDTO;
import com.phantask.notice.dto.NoticeResponse;
import com.phantask.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for managing Notice operations.
 * <p>
 * Provides endpoints for:
 * <ul>
 *   <li>Admin: Create, update, delete, and view all notices</li>
 *   <li>Users: View notices assigned to their roles, filter by priority</li>
 * </ul>
 * 
 * @author PhanTask Team
 * @version 1.0
 * @since 2025-12-25
 */
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

	private final NoticeService noticeService;

	// ===========================================================================================
	// ADMIN ENDPOINTS
	// ===========================================================================================

	/**
	 * Creates a new notice (Admin only).
	 * 
	 * @param dto the notice creation data transfer object containing title, content, priority, etc.
	 * @return ResponseEntity containing the created notice details
	 */
	@PostMapping("/admin/create")
	@PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
	public ResponseEntity<NoticeResponse> createNotice(@RequestBody CreateNoticeDTO dto) {
		NoticeResponse resp = noticeService.createNotice(dto);
		return ResponseEntity.ok(resp);
	}

	/**
	 * Updates an existing notice (Admin only).
	 * 
	 * @param id  the ID of the notice to update
	 * @param dto the updated notice data
	 * @return ResponseEntity containing the updated notice details
	 */
	@PutMapping("/admin/update/{id}")
	@PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
	public ResponseEntity<NoticeResponse> updateNotice(@PathVariable Long id, @RequestBody CreateNoticeDTO dto) {
		NoticeResponse resp = noticeService.updateNotice(id, dto);
		return ResponseEntity.ok(resp);
	}

	/**
	 * Deletes a notice by ID (Admin only).
	 * 
	 * @param id the ID of the notice to delete
	 * @return ResponseEntity with success message if deleted, or NOT_FOUND status if notice doesn't exist
	 */
	@DeleteMapping("/admin/delete/{id}")
	@PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
	public ResponseEntity<String> deleteNotice(@PathVariable Long id) {
		boolean deleted = noticeService.deleteNotice(id);

		if (deleted) {
			return ResponseEntity.ok("Notice deleted successfully");
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Notice not found");
		}
	}

	/**
	 * Retrieves all notices in the system (Admin only).
	 * 
	 * @return ResponseEntity containing a list of all notices
	 */
	@GetMapping("/admin/all")
	@PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
	public ResponseEntity<List<NoticeResponse>> adminAll() {
		return ResponseEntity.ok(noticeService.getAllNoticesAdmin());
	}

	// ===========================================================================================
	// USER ENDPOINTS
	// ===========================================================================================

	/**
	 * Helper method to extract roles from Authentication object.
	 * Removes the "ROLE_" prefix from authority names.
	 * 
	 * @param auth the Authentication object from Spring Security context
	 * @return List of role names without "ROLE_" prefix, or empty list if auth is null
	 */
	private List<String> getRolesFromAuth(Authentication auth) {
		if (auth == null)
			return Collections.emptyList();
		return auth.getAuthorities().stream()
				.map(a -> a.getAuthority().replace("ROLE_", ""))
				.collect(Collectors.toList());
	}

	/**
	 * Retrieves all notices visible to the logged-in user based on their roles.
	 * 
	 * @param auth the Authentication object containing user details and roles
	 * @return ResponseEntity containing a list of notices targeted to user's roles
	 */
	@GetMapping("/my")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<NoticeResponse>> myNotices(Authentication auth) {
		List<String> roles = getRolesFromAuth(auth);
		return ResponseEntity.ok(noticeService.getAllNoticesForUser(roles));
	}

	/**
	 * Retrieves notices filtered by priority for the logged-in user.
	 * 
	 * @param priority the priority level to filter by (URGENT, IMPORTANT, GENERAL)
	 * @param auth     the Authentication object containing user details and roles
	 * @return ResponseEntity containing a list of notices matching the priority and user's roles
	 */
	@GetMapping("/my/priority/{priority}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<NoticeResponse>> myNoticesByPriority(
			@PathVariable String priority,
			Authentication auth) {
		List<String> roles = getRolesFromAuth(auth);
		return ResponseEntity.ok(noticeService.getNoticesByPriorityForUser(roles, priority));
	}
}
