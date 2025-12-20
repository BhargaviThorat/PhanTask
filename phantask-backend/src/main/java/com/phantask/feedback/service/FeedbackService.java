package com.phantask.feedback.service;

import com.phantask.feedback.dto.CreateFeedbackDto;
import com.phantask.feedback.dto.FeedbackReportDto;
import com.phantask.feedback.dto.SubmitFeedbackDto;
import com.phantask.feedback.entity.Feedback;
import com.phantask.feedback.entity.Rating;
import com.phantask.feedback.entity.Submission;
import com.phantask.feedback.repository.FeedbackRepository;
import com.phantask.feedback.repository.RatingRepository;
import com.phantask.feedback.repository.SubmissionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    /**
     * Repository for feedback templates (admin-created).
     */
    private final FeedbackRepository feedbackRepo;

    /**
     * Repository to track which user submitted which feedback.
     * Used for duplicate prevention and counts.
     */
    private final SubmissionRepository submissionRepo;

    /**
     * Repository for anonymous ratings.
     */
    private final RatingRepository ratingRepo;

    /* ========================= ADMIN ========================= */

    /**
     * Creates a new feedback template.
     * Multiple roles are stored as a comma-separated string.
     */
    public void createFeedback(CreateFeedbackDto dto) {

        Feedback feedback = new Feedback();
        feedback.setTitle(dto.getTitle());

        // Store multiple roles as CSV for simplicity
        feedback.setAssignedRoles(String.join(",", dto.getAssignedRoles()));

        // Store questions as CSV
        feedback.setQuestions(String.join(",", dto.getQuestions()));
        feedback.setCreatedAt(LocalDateTime.now());

        feedbackRepo.save(feedback);
    }

    /**
     * Fetches all feedback templates.
     * Used by admin dashboard.
     */
    public List<Feedback> getAllFeedbackTemplates() {
        return feedbackRepo.findAll();
    }

    /**
     * Updates a feedback template.
     * Update is not allowed once any user has submitted feedback.
     */
    public void updateFeedback(Long feedbackId, CreateFeedbackDto dto) {

        Feedback feedback = feedbackRepo.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        // Prevent modification after submission
        if (submissionRepo.countByFeedback(feedback) > 0) {
            throw new RuntimeException("Cannot update feedback after submission");
        }

        feedback.setTitle(dto.getTitle());
        feedback.setAssignedRoles(String.join(",", dto.getAssignedRoles()));
        feedback.setQuestions(String.join(",", dto.getQuestions()));

        feedbackRepo.save(feedback);
    }

    /**
     * Deletes feedback completely.
     * Removes:
     *  - feedback template
     *  - all submissions
     *  - all anonymous ratings
     */
    @Transactional
    public void deleteFeedback(Long feedbackId) {

        Feedback feedback = feedbackRepo.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        submissionRepo.deleteByFeedback(feedback);
        ratingRepo.deleteByFeedback(feedback);
        feedbackRepo.delete(feedback);
    }

    /* ========================= USER ========================= */

    /**
     * Returns feedbacks available for the logged-in user.
     *
     * Conditions:
     *  - User must have at least one matching role
     *  - Feedback must not be already submitted by the user
     */
    public List<Feedback> getAvailableFeedbackForUser(String username, List<String> userRoles) {

        return feedbackRepo.findAll().stream()
                .filter(feedback -> {

                    // Extract assigned roles from CSV
                    List<String> assignedRoles = Arrays.stream(
                                    feedback.getAssignedRoles().split(","))
                            .map(String::trim)
                            .toList();

                    // At least one role should match
                    return assignedRoles.stream().anyMatch(userRoles::contains);
                })
                .filter(feedback ->
                        !submissionRepo.existsByFeedbackAndUsername(feedback, username)
                )
                .toList();
    }

    /**
     * Submits feedback for a user.
     *
     * Rules:
     *  - User must have a matching role
     *  - User can submit only once
     *  - Ratings are stored anonymously
     */
    @Transactional
    public void submitFeedback(Long feedbackId,
                               SubmitFeedbackDto dto,
                               String username,
                               List<String> userRoles) {

        Feedback feedback = feedbackRepo.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        // Extract assigned roles
        List<String> assignedRoles = Arrays.stream(
                        feedback.getAssignedRoles().split(","))
                .map(String::trim)
                .toList();

        // Find the role that matched
        String matchedRole = userRoles.stream()
                .filter(assignedRoles::contains)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User role not allowed"));

        // Prevent duplicate submission
        if (submissionRepo.existsByFeedbackAndUsername(feedback, username)) {
            throw new RuntimeException("Feedback already submitted");
        }

        // Save submission for tracking only
        Submission submission = new Submission();
        submission.setFeedback(feedback);
        submission.setUsername(username);
        submission.setUserRole(matchedRole);
        submission.setSubmittedAt(LocalDateTime.now());
        submissionRepo.save(submission);

        // Shuffle ratings to avoid any ordering correlation
        List<Map.Entry<String, Integer>> entries =
                new ArrayList<>(dto.getRatings().entrySet());
        Collections.shuffle(entries);

        // Store anonymous ratings
        for (Map.Entry<String, Integer> entry : entries) {
            Rating rating = new Rating();
            rating.setFeedback(feedback);
            rating.setQuestion(entry.getKey());
            rating.setRating(entry.getValue());
            ratingRepo.save(rating);
        }
    }

    /* ========================= REPORT ========================= */

    /**
     * Generates feedback report for admin.
     *
     * Report includes:
     *  - average rating per question (1–5)
     *  - overall average (scaled to 10)
     *  - total submissions
     */
    public FeedbackReportDto getReport(Long feedbackId) {

        Feedback feedback = feedbackRepo.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        List<Rating> ratings = ratingRepo.findByFeedback(feedback);

        // Aggregate ratings per question
        Map<String, Integer> sumMap = new HashMap<>();
        Map<String, Integer> countMap = new HashMap<>();

        for (Rating r : ratings) {
            sumMap.merge(r.getQuestion(), r.getRating(), Integer::sum);
            countMap.merge(r.getQuestion(), 1, Integer::sum);
        }

        // Calculate rounded average per question
        Map<String, Integer> avgPerQuestion = new LinkedHashMap<>();
        for (String q : sumMap.keySet()) {
            avgPerQuestion.put(
                    q,
                    Math.round((float) sumMap.get(q) / countMap.get(q))
            );
        }

        // Calculate overall average (1–5 → 1–10)
        double overallAvg5 = avgPerQuestion.values()
                .stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0);

        int overallAvg10 = (int) Math.round(overallAvg5 * 2);

        FeedbackReportDto dto = new FeedbackReportDto();
        dto.setAveragePerQuestion(avgPerQuestion);
        dto.setOverallAverage(overallAvg10);
        dto.setTotalSubmissions(submissionRepo.countByFeedback(feedback));

        return dto;
    }

    /* ========================= COUNT ========================= */

    /**
     * Returns number of feedbacks submitted by a user.
     */
    public long getSubmittedFeedbackCount(String username) {
        return submissionRepo.countByUsername(username);
    }
}
