package com.phantask.notice.service;

import com.phantask.notice.dto.CreateNoticeDTO;
import com.phantask.notice.dto.NoticeResponse;
import java.util.List;

/**
 * Service interface for notice business logic operations.
 * <p>
 * Defines methods for notice management including:
 * <ul>
 *   <li>Admin operations: Create, update, delete, and view all notices</li>
 *   <li>User operations: View notices filtered by role and priority</li>
 * </ul>
 * <p>
 * Handles role-based access control to ensure users only see notices
 * targeted to their assigned roles.
 * 
 * @author PhanTask Team
 * @version 1.0
 * @since 2025-12-25
 */
public interface NoticeService {

	// ===========================================================================================
	// ADMIN OPERATIONS
	// ===========================================================================================

	/**
	 * Creates a new notice in the system.
	 * <p>
	 * Automatically sets the creation timestamp and converts priority string
	 * to enum type. Validates that target roles are provided.
	 * 
	 * @param dto the notice creation data containing title, content, priority, and target roles
	 * @return NoticeResponse containing the created notice details with generated ID
	 * @throws IllegalArgumentException if required fields are missing or invalid
	 */
	NoticeResponse createNotice(CreateNoticeDTO dto);

	/**
	 * Updates an existing notice with new information.
	 * <p>
	 * All fields from the DTO will overwrite the existing notice data.
	 * The creation timestamp remains unchanged.
	 * 
	 * @param id  the ID of the notice to update
	 * @param dto the updated notice data
	 * @return NoticeResponse containing the updated notice details
	 * @throws RuntimeException if notice with given ID is not found
	 */
	NoticeResponse updateNotice(Long id, CreateNoticeDTO dto);

	/**
	 * Deletes a notice from the system by its ID.
	 * 
	 * @param id the ID of the notice to delete
	 * @return true if the notice was successfully deleted, false if notice was not found
	 */
	boolean deleteNotice(Long id);

	/**
	 * Retrieves all notices in the system without any filtering.
	 * <p>
	 * This method is intended for admin users only and returns all notices
	 * regardless of target roles or priority.
	 * 
	 * @return List of all notices in the system, empty list if no notices exist
	 */
	List<NoticeResponse> getAllNoticesAdmin();

	// ===========================================================================================
	// USER OPERATIONS (FILTERED BY ROLES)
	// ===========================================================================================

	/**
	 * Retrieves all notices visible to users with the specified roles.
	 * <p>
	 * Filters notices based on target roles - only returns notices where at least
	 * one of the user's roles matches the notice's target roles.
	 * 
	 * @param roles list of role names the user belongs to (e.g., ["HR", "TECHNICAL"])
	 * @return List of notices targeted to any of the provided roles, empty list if none match
	 */
	List<NoticeResponse> getAllNoticesForUser(List<String> roles);

	/**
	 * Retrieves notices filtered by both role and priority level.
	 * <p>
	 * Returns notices that match the specified priority AND are targeted to
	 * at least one of the user's roles.
	 * 
	 * @param roles    list of role names the user belongs to (e.g., ["HR", "TECHNICAL"])
	 * @param priority the priority level to filter by (URGENT, IMPORTANT, GENERAL)
	 * @return List of notices matching both role and priority criteria, empty list if none match
	 */
	List<NoticeResponse> getNoticesByPriorityForUser(List<String> roles, String priority);
}
