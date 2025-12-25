package com.phantask.helpline.service;

import java.util.List;

import com.phantask.helpline.entity.HelplineTicket;

/**
 * Service interface for Helpline Ticket module.
 *
 * This layer:
 * - Contains business logic contracts
 * - Is called by Controller
 * - Is implemented by ServiceImpl
 *
 * Controller → Service → Repository
 */
public interface HelplineTicketService {

    /**
     * Raises a new helpline ticket.
     *
     * @param raisedByUserId   ID of the user who raised the ticket
     * @param raisedByEmail    Email of the ticket raiser (for tracking / notification)
     * @param assignedRoleName Role to which the ticket is assigned (HR, MANAGER, SUPPORT, etc.)
     * @param description     Problem description provided by the user
     * @param priority        Ticket priority (LOW / MEDIUM / HIGH)
     *
     * @return Newly created HelplineTicket
     */
    HelplineTicket raiseTicket(
            Long raisedByUserId,
            String raisedByEmail,
            String assignedRoleName,
            String description,
            String priority
    );

    /**
     * Fetches all pending tickets that the logged-in user is allowed to see.
     *
     * Visibility depends on role:
     * - Assigned role → can see
     * - SUPPORT / ADMIN → can see all
     *
     * @param userRoles Roles extracted from JWT
     * @return List of pending helpline tickets
     */
    List<HelplineTicket> getPendingTickets(List<String> userRoles);

    /**
     * Fetches all resolved tickets that the logged-in user is allowed to see.
     *
     * @param userRoles Roles extracted from JWT
     * @return List of resolved helpline tickets
     */
    List<HelplineTicket> getResolvedTickets(List<String> userRoles);

    /**
     * Fetches all tickets raised by a specific user.
     *
     * This method is used for:
     * - "My Raised Tickets" feature
     *
     * NOTE:
     * This method earlier caused error when missing in implementation,
     * hence must be implemented properly in ServiceImpl.
     *
     * @param userId ID of the ticket raiser
     * @return List of tickets raised by the user
     */
    List<HelplineTicket> getTicketsRaisedByUser(Long userId);

    /**
     * Resolves a helpline ticket.
     *
     * Business rules handled in implementation:
     * - Ticket must exist
     * - Ticket must not already be resolved
     * - Resolver must be:
     *   - Assigned role user OR
     *   - SUPPORT OR
     *   - ADMIN
     *
     * @param ticketId         ID of the ticket to resolve
     * @param resolverUserId  ID of the resolving user
     * @param resolverRoles   Roles of the resolver
     *
     * @return Updated resolved HelplineTicket
     */
    HelplineTicket resolveTicket(
            Long ticketId,
            Long resolverUserId,
            List<String> resolverRoles
    );
}
