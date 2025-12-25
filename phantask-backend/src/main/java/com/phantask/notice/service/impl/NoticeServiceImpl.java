package com.phantask.notice.service.impl;

import com.phantask.notice.dto.CreateNoticeDTO;
import com.phantask.notice.dto.NoticeResponse;
import com.phantask.notice.entity.Notice;
import com.phantask.notice.entity.NoticePriority;
import com.phantask.notice.repository.NoticeRepository;
import com.phantask.notice.service.NoticeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of {@link NoticeService} interface.
 * <p>
 * Provides business logic for notice management operations including:
 * <ul>
 *   <li>CRUD operations for notices (admin)</li>
 *   <li>Role-based notice retrieval (users)</li>
 *   <li>Priority-based filtering</li>
 * </ul>
 * <p>
 * All public methods are transactional to ensure data consistency.
 * 
 * @author PhanTask Team
 * @version 1.0
 * @since 2025-12-25
 */
@Service
@Transactional
public class NoticeServiceImpl implements NoticeService {

	private final NoticeRepository noticeRepository;

	/**
	 * Constructs a new NoticeServiceImpl with the required repository.
	 * 
	 * @param noticeRepository the repository for notice database operations
	 */
	public NoticeServiceImpl(NoticeRepository noticeRepository) {
		this.noticeRepository = noticeRepository;
	}

	// ===========================================================================================
	// HELPER METHODS
	// ===========================================================================================

	/**
	 * Converts a Notice entity to a NoticeResponse DTO.
	 * <p>
	 * Maps all entity fields to response fields, converting enum to string
	 * for priority level.
	 * 
	 * @param n the Notice entity to convert
	 * @return NoticeResponse DTO containing notice data
	 */
	private NoticeResponse toResponse(Notice n) {
		NoticeResponse r = new NoticeResponse();
		r.setId(n.getId());
		r.setTitle(n.getTitle());
		r.setContent(n.getContent());
		r.setPostedBy(n.getPostedBy());
		r.setPriority(n.getPriority() == null ? null : n.getPriority().name());
		r.setTargetRoles(n.getTargetRoles());
		r.setCreatedAt(n.getCreatedAt());
		return r;
	}

	// ===========================================================================================
	// ADMIN OPERATIONS
	// ===========================================================================================

	/**
	 * {@inheritDoc}
	 * <p>
	 * Implementation notes:
	 * <ul>
	 *   <li>Converts priority string to enum type</li>
	 *   <li>Sets creation timestamp to current time</li>
	 *   <li>Persists notice to database</li>
	 * </ul>
	 */
	@Override
	public NoticeResponse createNotice(CreateNoticeDTO dto) {
		Notice notice = new Notice();
		notice.setTitle(dto.getTitle());
		notice.setContent(dto.getContent());
		notice.setPostedBy(dto.getPostedBy());
		notice.setPriority(NoticePriority.valueOf(dto.getPriority()));
		notice.setTargetRoles(dto.getTargetRoles());
		notice.setCreatedAt(LocalDateTime.now());

		Notice saved = noticeRepository.save(notice);
		return toResponse(saved);
	}

	/**
	 * {@inheritDoc}
	 * <p>
	 * Implementation notes:
	 * <ul>
	 *   <li>Fetches existing notice or throws exception</li>
	 *   <li>Updates all mutable fields</li>
	 *   <li>Preserves original creation timestamp</li>
	 * </ul>
	 */
	@Override
	public NoticeResponse updateNotice(Long id, CreateNoticeDTO dto) {
		Notice notice = noticeRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Notice not found"));

		notice.setTitle(dto.getTitle());
		notice.setContent(dto.getContent());
		notice.setPostedBy(dto.getPostedBy());
		notice.setPriority(NoticePriority.valueOf(dto.getPriority()));
		notice.setTargetRoles(dto.getTargetRoles());
		// Note: createdAt is not updated

		Notice saved = noticeRepository.save(notice);
		return toResponse(saved);
	}

	/**
	 * {@inheritDoc}
	 * <p>
	 * Implementation notes:
	 * <ul>
	 *   <li>Checks existence before deletion</li>
	 *   <li>Returns true only if notice existed and was deleted</li>
	 * </ul>
	 */
	@Override
	public boolean deleteNotice(Long id) {
		if (noticeRepository.existsById(id)) {
			noticeRepository.deleteById(id);
			return true;
		}
		return false;
	}

	/**
	 * {@inheritDoc}
	 * <p>
	 * Implementation notes:
	 * <ul>
	 *   <li>Retrieves all notices from database</li>
	 *   <li>No filtering applied</li>
	 *   <li>Converts entities to response DTOs</li>
	 * </ul>
	 */
	@Override
	public List<NoticeResponse> getAllNoticesAdmin() {
		return noticeRepository.findAll().stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	// ===========================================================================================
	// USER OPERATIONS (FILTERED BY ROLES)
	// ===========================================================================================

	/**
	 * {@inheritDoc}
	 * <p>
	 * Implementation notes:
	 * <ul>
	 *   <li>Returns empty list if roles parameter is null or empty</li>
	 *   <li>Uses repository query to find notices matching any provided role</li>
	 *   <li>Converts entities to response DTOs</li>
	 * </ul>
	 */
	@Override
	public List<NoticeResponse> getAllNoticesForUser(List<String> roles) {
		if (roles == null || roles.isEmpty()) {
			return List.of();
		}

		return noticeRepository.findByTargetRolesIn(roles).stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	/**
	 * {@inheritDoc}
	 * <p>
	 * Implementation notes:
	 * <ul>
	 *   <li>Returns empty list if roles parameter is null or empty</li>
	 *   <li>Converts priority string to enum type</li>
	 *   <li>Uses repository query to filter by both role and priority</li>
	 *   <li>Converts entities to response DTOs</li>
	 * </ul>
	 */
	@Override
	public List<NoticeResponse> getNoticesByPriorityForUser(List<String> roles, String priority) {
		if (roles == null || roles.isEmpty()) {
			return List.of();
		}

		NoticePriority noticePriority = NoticePriority.valueOf(priority);
		return noticeRepository.findByTargetRolesInAndPriority(roles, noticePriority).stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}
}
