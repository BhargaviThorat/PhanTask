package com.phantask.notice.dto;

import lombok.Data;
import java.util.List;

/**
 * Data Transfer Object for creating a new notice.
 * <p>
 * Used by admin users to create notices with specified priority levels
 * and target specific roles within the organization.
 * 
 * @author PhanTask Team
 * @version 1.0
 * @since 2025-12-25
 */
@Data
public class CreateNoticeDTO {

	/**
	 * The title of the notice.
	 * Maximum length: 150 characters (enforced at entity level).
	 */
	private String title;

	/**
	 * The content/body of the notice.
	 * Maximum length: 1000 characters (enforced at entity level).
	 */
	private String content;

	/**
	 * The name of the person or department posting the notice.
	 * Example: "HR_DEPARTMENT", "ADMIN", "IT_TEAM"
	 * Maximum length: 100 characters (enforced at entity level).
	 */
	private String postedBy;

	/**
	 * The priority level of the notice.
	 * Valid values: "URGENT", "IMPORTANT", "GENERAL"
	 */
	private String priority;

	/**
	 * List of role names that should see this notice.
	 * Example: ["HR", "TECHNICAL", "ACCOUNTS"]
	 * Users with any of these roles will be able to view the notice.
	 */
	private List<String> targetRoles;
}
