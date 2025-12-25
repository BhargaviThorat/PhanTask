package com.phantask.notice.entity;

/**
 * Enumeration representing the priority levels for notices.
 * <p>
 * Priority levels determine the visual representation, filtering options,
 * and importance of notices displayed to users.
 * <p>
 * Visual Representation:
 * <ul>
 *   <li>{@code URGENT} - Red indicator, highest priority</li>
 *   <li>{@code IMPORTANT} - Yellow indicator, medium priority</li>
 *   <li>{@code GENERAL} - Pink indicator, standard priority</li>
 * </ul>
 * 
 * @author PhanTask Team
 * @version 1.0
 * @since 2025-12-25
 */
public enum NoticePriority {

	/**
	 * General/standard priority notice.
	 * Used for routine announcements and non-urgent information.
	 * Visual indicator: Pink
	 */
	GENERAL,

	/**
	 * Important priority notice.
	 * Used for significant announcements requiring attention.
	 * Visual indicator: Yellow
	 */
	IMPORTANT,

	/**
	 * Urgent/critical priority notice.
	 * Used for time-sensitive or critical announcements requiring immediate attention.
	 * Visual indicator: Red
	 */
	URGENT
}
