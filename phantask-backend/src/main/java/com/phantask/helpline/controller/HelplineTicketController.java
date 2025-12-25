package com.phantask.helpline.controller;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.phantask.authentication.entity.User;
import com.phantask.authentication.repository.UserRepository;
import com.phantask.helpline.dto.RaiseHelplineTicketDTO;
import com.phantask.helpline.dto.ResolveHelplineTicketDTO;
import com.phantask.helpline.entity.HelplineTicket;
import com.phantask.helpline.service.HelplineTicketService;

import lombok.RequiredArgsConstructor;

/**
 * REST Controller for Helpline Ticket operations
 * Handles raising, viewing, and resolving tickets
 */
@RestController
@RequestMapping("/api/helpline")
@RequiredArgsConstructor
public class HelplineTicketController {

    // Service layer for helpline ticket business logic
    private final HelplineTicketService helplineTicketService;

    // Repository to fetch logged-in user details
    private final UserRepository userRepository;

    // -------- Helper Method --------
    /**
     * Extracts roles from JWT Authentication object
     * Example: ROLE_ADMIN → ADMIN
     */
    private List<String> getRolesFromAuth(Authentication auth) {
        if (auth == null) {
            return Collections.emptyList();
        }
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .collect(Collectors.toList());
    }

    // -------- RAISE HELPLINE TICKET --------
    /**
     * Allows an authenticated user to raise a helpline ticket
     */
    @PostMapping("/raise")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> raiseTicket(
            @RequestBody RaiseHelplineTicketDTO dto,
            Authentication auth
    ) {
        try {
            String username = auth.getName();

            // Fetch logged-in user
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Delegate ticket creation to service layer
            HelplineTicket ticket = helplineTicketService.raiseTicket(
                    user.getUid(),
                    user.getEmail(),
                    dto.getAssignedRoleName(),
                    dto.getDescription(),
                    dto.getPriority()
            );

            // 200 OK with created ticket
            return ResponseEntity.ok(ticket);

        } catch (RuntimeException ex) {
            // Known business errors
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ex.getMessage());

        } catch (Exception ex) {
            // Unexpected server errors
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to raise helpline ticket");
        }
    }

    // -------- VIEW TICKETS RAISED BY ME --------
    /**
     * Fetches all tickets raised by the logged-in user
     */
    @GetMapping("/my/raised")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> myRaised(Authentication auth) {
        try {
            String username = auth.getName();

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(
                    helplineTicketService.getTicketsRaisedByUser(user.getUid())
            );

        } catch (RuntimeException ex) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ex.getMessage());
        }
    }

    // -------- VIEW PENDING TICKETS --------
    /**
     * Fetches pending tickets assigned to user's role
     */
    @GetMapping("/my/pending")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> myPending(Authentication auth) {
        try {
            List<String> roles = getRolesFromAuth(auth);

            return ResponseEntity.ok(
                    helplineTicketService.getPendingTickets(roles)
            );

        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to fetch pending tickets");
        }
    }

    // -------- VIEW RESOLVED TICKETS --------
    /**
     * Fetches resolved tickets assigned to user's role
     */
    @GetMapping("/my/resolved")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> myResolved(Authentication auth) {
        try {
            List<String> roles = getRolesFromAuth(auth);

            return ResponseEntity.ok(
                    helplineTicketService.getResolvedTickets(roles)
            );

        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to fetch resolved tickets");
        }
    }

    // -------- RESOLVE HELPLINE TICKET --------
    /**
     * Resolves a helpline ticket if user is authorized
     */
    @PutMapping("/resolve/{ticketId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> resolveTicket(
            @PathVariable Long ticketId,
            @RequestBody(required = false) ResolveHelplineTicketDTO dto,
            Authentication auth
    ) {
        try {
            String username = auth.getName();

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<String> roles = getRolesFromAuth(auth);

            // Delegate resolution logic to service layer
            HelplineTicket resolvedTicket =
                    helplineTicketService.resolveTicket(
                            ticketId,
                            user.getUid(),
                            roles
                    );

            return ResponseEntity.ok(resolvedTicket);

        } catch (RuntimeException ex) {
            // Authorization, validation, or business rule failures
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ex.getMessage());

        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to resolve ticket");
        }
    }
}
