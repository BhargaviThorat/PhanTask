package com.phantask.notice.repository;

import com.phantask.notice.entity.Notice;
import com.phantask.notice.entity.NoticePriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for {@link Notice} entity database operations.
 * <p>
 * Provides CRUD operations and custom queries for notice retrieval
 * based on priority levels and target roles.
 * <p>
 * Uses JPQL queries to handle the many-to-many relationship between
 * notices and target roles stored in the junction table.
 * 
 * @author PhanTask Team
 * @version 1.0
 * @since 2025-12-25
 */
@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

	/**
	 * Finds all notices with the specified priority level.
	 * 
	 * @param priority the priority level to filter by (URGENT, IMPORTANT, GENERAL)
	 * @return List of notices matching the priority, empty list if none found
	 */
	List<Notice> findByPriority(NoticePriority priority);

	/**
	 * Finds all notices targeted to any of the specified roles.
	 * <p>
	 * Uses JPQL query to join with the targetRoles collection and filter
	 * notices that contain at least one of the provided roles.
	 * 
	 * @param roles list of role names to search for (e.g., ["HR", "TECHNICAL", "ACCOUNTS"])
	 * @return List of notices visible to the specified roles, empty list if none found
	 */
	@Query("SELECT n FROM Notice n JOIN n.targetRoles r WHERE r IN :roles")
	List<Notice> findByTargetRolesIn(@Param("roles") List<String> roles);

	/**
	 * Finds all notices targeted to specified roles and matching the given priority.
	 * <p>
	 * Combines role-based filtering with priority filtering using JPQL.
	 * Useful for retrieving filtered notices for specific user roles.
	 * 
	 * @param roles    list of role names to search for (e.g., ["HR", "TECHNICAL"])
	 * @param priority the priority level to filter by (URGENT, IMPORTANT, GENERAL)
	 * @return List of notices matching both role and priority criteria, empty list if none found
	 */
	@Query("SELECT n FROM Notice n JOIN n.targetRoles r WHERE r IN :roles AND n.priority = :priority")
	List<Notice> findByTargetRolesInAndPriority(
			@Param("roles") List<String> roles,
			@Param("priority") NoticePriority priority);
}
