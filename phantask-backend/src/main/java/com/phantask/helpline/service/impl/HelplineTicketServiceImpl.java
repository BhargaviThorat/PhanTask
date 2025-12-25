package com.phantask.helpline.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.phantask.helpline.entity.HelplineTicket;
import com.phantask.helpline.repository.HelplineTicketRepository;
import com.phantask.helpline.service.HelplineTicketService;

import lombok.RequiredArgsConstructor;

/**
 * Service implementation for Helpline Ticket module.
 *
 * This class:
 * - Implements business logic
 * - Handles authorization checks
 * - Communicates with repository
 */
@Service
@RequiredArgsConstructor
public class HelplineTicketServiceImpl implements HelplineTicketService {

    // Repository for DB operations on helpline tickets
    private final HelplineTicketRepository helplineTicketRepository;

    // -------- RAISE HELPLINE TICKET --------
    @Override
    public HelplineTicket raiseTicket(
            Long raisedByUserId,
            String raisedByEmail,
            String assignedRoleName,
            String description,
            String priority
    ) {
        // Create new ticket entity
        HelplineTicket ticket = new HelplineTicket();

        // Store ticket raiser details
        ticket.setRaisedByUserId(raisedByUserId);
        ticket.setRaisedByEmail(raisedByEmail);

        // Assign ticket to a role (HR / MANAGER / SUPPORT etc.)
        ticket.setAssignedRoleName(assignedRoleName);

        // Store problem details
        ticket.setDescription(description);
        ticket.setPriority(priority);

        // Initial status is always PENDING
        ticket.setStatus("PENDING");

        // Set creation time
        ticket.setRaisedAt(LocalDateTime.now());

        // Calculate due date based on priority
        ticket.setDueDate(calculateDueDate(priority));

        // Persist ticket in database
        return helplineTicketRepository.save(ticket);
    }

    // -------- VIEW PENDING TICKETS --------
    @Override
    public List<HelplineTicket> getPendingTickets(List<String> userRoles) {

        // ADMIN and SUPPORT can view all pending tickets
        if (userRoles.contains("ADMIN") || userRoles.contains("SUPPORT")) {
            return helplineTicketRepository.findByStatus("PENDING");
        }

        // Other roles can view only tickets assigned to them
        return helplineTicketRepository
                .findByAssignedRoleNameInAndStatus(userRoles, "PENDING");
    }

    // -------- VIEW RESOLVED TICKETS --------
    @Override
    public List<HelplineTicket> getResolvedTickets(List<String> userRoles) {

        // ADMIN and SUPPORT can view all resolved tickets
        if (userRoles.contains("ADMIN") || userRoles.contains("SUPPORT")) {
            return helplineTicketRepository.findByStatus("RESOLVED");
        }

        // Other roles can view only tickets assigned to them
        return helplineTicketRepository
                .findByAssignedRoleNameInAndStatus(userRoles, "RESOLVED");
    }

    // -------- RESOLVE HELPLINE TICKET --------
    @Override
    public HelplineTicket resolveTicket(
            Long ticketId,
            Long resolverUserId,
            List<String> resolverRoles
    ) {
        // Fetch ticket by ID
        HelplineTicket ticket = helplineTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Prevent resolving an already resolved ticket
        if (!"PENDING".equals(ticket.getStatus())) {
            throw new RuntimeException("Ticket already resolved");
        }

        // Authorization check:
        // Only ADMIN, SUPPORT, or assigned role user can resolve
        if (!resolverRoles.contains("ADMIN")
                && !resolverRoles.contains("SUPPORT")
                && !resolverRoles.contains(ticket.getAssignedRoleName())) {
            throw new RuntimeException("Not authorized to resolve this ticket");
        }

        // Update resolution details
        ticket.setStatus("RESOLVED");
        ticket.setResolvedAt(LocalDateTime.now());

        // Store who resolved the ticket (cleanup applied)
        ticket.setResolvedByUserId(resolverUserId);

        // Save updated ticket
        return helplineTicketRepository.save(ticket);
    }

    // -------- VIEW MY RAISED TICKETS --------
    @Override
    public List<HelplineTicket> getTicketsRaisedByUser(Long userId) {
        // Fetch all tickets raised by a specific user
        return helplineTicketRepository.findByRaisedByUserId(userId);
    }

    // -------- HELPER METHOD --------
    /**
     * Calculates due date based on ticket priority.
     *
     * HIGH   → 1 day
     * MEDIUM → 3 days
     * LOW    → 5 days
     */
    private LocalDateTime calculateDueDate(String priority) {
        return switch (priority.toUpperCase()) {
            case "HIGH" -> LocalDateTime.now().plusDays(1);
            case "MEDIUM" -> LocalDateTime.now().plusDays(3);
            case "LOW" -> LocalDateTime.now().plusDays(5);
            default -> LocalDateTime.now().plusDays(3);
        };
    }
}
