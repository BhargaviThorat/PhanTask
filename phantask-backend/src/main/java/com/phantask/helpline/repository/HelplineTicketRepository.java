package com.phantask.helpline.repository;

import com.phantask.helpline.entity.HelplineTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository layer for HelplineTicket entity.
 *
 * This interface:
 * - Extends JpaRepository to get CRUD methods
 * - Uses Spring Data JPA query derivation
 * - Contains DB-level ticket filtering logic
 */
@Repository
public interface HelplineTicketRepository extends JpaRepository<HelplineTicket, Long> {

    /**
     * Fetches tickets assigned to any of the given roles
     * and having the specified status.
     *
     * Used when:
     * - User is NOT ADMIN or SUPPORT
     * - User can only view tickets assigned to their role
     *
     * Example:
     * roles = [HR, MANAGER]
     * status = PENDING
     *
     * @param assignedRoleNames List of role names from JWT
     * @param status Ticket status (PENDING / RESOLVED)
     * @return List of matching helpline tickets
     */
    List<HelplineTicket> findByAssignedRoleNameInAndStatus(
            List<String> assignedRoleNames,
            String status
    );

    /**
     * Fetches all tickets having the given status.
     *
     * Used when:
     * - User has ADMIN or SUPPORT role
     * - Full visibility is allowed
     *
     * @param status Ticket status (PENDING / RESOLVED)
     * @return List of helpline tickets
     */
    List<HelplineTicket> findByStatus(String status);

    /**
     * Fetches all tickets raised by a specific user.
     *
     * Used for:
     * - "My Raised Tickets" feature
     *
     * @param raisedByUserId ID of the user who raised the ticket
     * @return List of tickets raised by the user
     */
    List<HelplineTicket> findByRaisedByUserId(Long raisedByUserId);
}
