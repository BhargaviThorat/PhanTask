package com.phantask.notice.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity representing a notice in the system.
 * <p>
 * Notices are announcements created by administrators and targeted to specific roles.
 * They have priority levels (URGENT, IMPORTANT, GENERAL) and are stored with creation timestamps.
 * <p>
 * Database Table: {@code notices}
 * <p>
 * Related Tables:
 * <ul>
 *   <li>{@code notice_target_roles} - Junction table storing target roles for each notice</li>
 * </ul>
 * 
 * @author PhanTask Team
 * @version 1.0
 * @since 2025-12-25
 */
@Entity
@Table(name = "notices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notice {

	/**
	 * Unique identifier for the notice.
	 * Auto-generated using database identity strategy.
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/**
	 * The title/heading of the notice.
	 * Displayed prominently in the notice board.
	 */
	private String title;

	/**
	 * The detailed content/body of the notice.
	 * Maximum length: 1000 characters.
	 */
	@Column(length = 1000)
	private String content;

	/**
	 * The name of the person or department that posted the notice.
	 * Examples: "HR_DEPARTMENT", "ADMIN", "IT_TEAM"
	 */
	private String postedBy;

	/**
	 * The priority level of the notice.
	 * Determines visual representation and filtering options.
	 * Stored as string in database.
	 * 
	 * @see NoticePriority
	 */
	@Enumerated(EnumType.STRING)
	private NoticePriority priority;

	/**
	 * List of role names that should have access to view this notice.
	 * <p>
	 * Stored in a separate junction table {@code notice_target_roles}.
	 * Uses eager fetching to load roles along with the notice.
	 * <p>
	 * Example roles: "HR", "TECHNICAL", "ACCOUNTS", "ADMIN"
	 */
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "notice_target_roles", joinColumns = @JoinColumn(name = "notice_id"))
	@Column(name = "role")
	private List<String> targetRoles;

	/**
	 * Timestamp when the notice was created.
	 * Automatically set by the service layer upon notice creation.
	 */
	private LocalDateTime createdAt;
}
