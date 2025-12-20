package com.phantask.feedback.controller;

import com.phantask.feedback.dto.CreateFeedbackDto;
import com.phantask.feedback.dto.FeedbackReportDto;
import com.phantask.feedback.dto.SubmitFeedbackDto;
import com.phantask.feedback.entity.Feedback;
import com.phantask.feedback.service.FeedbackService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    private final FeedbackService service;

    public FeedbackController(FeedbackService service) {
        this.service = service;
    }

    /* ========================= ADMIN APIs ========================= */

    /**
     * Admin creates a new feedback template.
     * Feedback can be assigned to multiple roles.
     */
    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody @Valid CreateFeedbackDto dto) {
        try {
            service.createFeedback(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Feedback created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    /**
     * Admin fetches all feedback templates.
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Feedback>> getAll() {
        return ResponseEntity.ok(service.getAllFeedbackTemplates());
    }

    /**
     * Admin updates a feedback template.
     * Update is blocked if at least one user has already submitted feedback.
     */
    @PutMapping("/admin/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody @Valid CreateFeedbackDto dto) {
        try {
            service.updateFeedback(id, dto);
            return ResponseEntity.ok("Feedback updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    /**
     * Admin deletes feedback completely.
     * This removes:
     *  - feedback template
     *  - all submissions
     *  - all ratings
     */
    @DeleteMapping("/admin/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteFeedback(id);
            return ResponseEntity.ok("Feedback deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    /**
     * Admin fetches feedback report.
     * Report contains:
     *  - average rating per question
     *  - overall average (scaled to 10)
     *  - total submissions
     */
    @GetMapping("/admin/report/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> report(@PathVariable Long id) {
        try {
            FeedbackReportDto report = service.getReport(id);
            return ResponseEntity.ok(report);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    /* ========================= USER APIs ========================= */

    /**
     * Logged-in user fetches feedback available for them.
     * Conditions:
     *  - At least one assigned role must match
     *  - Feedback must not be already submitted by user
     */
    @GetMapping("/user/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Feedback>> available(Authentication auth) {
        return ResponseEntity.ok(
                service.getAvailableFeedbackForUser(
                        auth.getName(),
                        getRoles(auth)
                )
        );
    }

    /**
     * Logged-in user submits feedback.
     * Submission rules:
     *  - User can submit only once
     *  - User role must match assigned role
     *  - Ratings are stored anonymously
     */
    @PostMapping("/user/{id}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> submit(@PathVariable Long id,
                                    @RequestBody @Valid SubmitFeedbackDto dto,
                                    Authentication auth) {
        try {
            service.submitFeedback(id, dto, auth.getName(), getRoles(auth));
            return ResponseEntity.ok("Feedback submitted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    /**
     * Logged-in user gets count of feedbacks they have submitted.
     */
    @GetMapping("/user/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> count(Authentication auth) {
        return ResponseEntity.ok(
                service.getSubmittedFeedbackCount(auth.getName())
        );
    }

    /* ========================= HELPER ========================= */

    /**
     * Extracts role names from Spring Security Authentication object.
     * Example:
     * ROLE_ADMIN -> ADMIN
     */
    private List<String> getRoles(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .toList();
    }
}
