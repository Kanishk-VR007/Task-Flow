package com.example.TeamManger.controller;

import com.example.TeamManger.entity.TaskReport;
import com.example.TeamManger.entity.Task;
import com.example.TeamManger.entity.Users;
import com.example.TeamManger.entity.Role;
import com.example.TeamManger.repository.TaskReportRepository;
import com.example.TeamManger.repository.Taskrepository;
import com.example.TeamManger.repository.Userrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class TaskReportController {

    @Autowired
    private TaskReportRepository taskReportRepository;
    @Autowired
    private Taskrepository taskRepository;
    @Autowired
    private Userrepository userRepository;

    private Users getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        if (username == null) return null;
        Users user = userRepository.findByUserName(username);
        return user != null ? user : userRepository.findByEmail(username);
    }

    @PostMapping("/submit/{taskId}")
    @PreAuthorize("hasAnyRole('DEVELOPER', 'JUNIOR_DEV')")
    public ResponseEntity<?> submitReport(@PathVariable Long taskId, @RequestBody TaskReport reportReq) {
        Users currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();

        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return ResponseEntity.badRequest().body("Task not found");

        if (task.getUser() == null || !task.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Unauthorized: You are not assigned to this task");
        }

        List<TaskReport> existingReports = taskReportRepository.findByTaskIdOrderByVersionDesc(taskId);
        Integer nextVersion = existingReports.isEmpty() ? 1 : existingReports.get(0).getVersion() + 1;

        TaskReport report = new TaskReport();
        report.setTask(task);
        report.setDeveloper(currentUser);
        report.setTitle(reportReq.getTitle());
        report.setDescription(reportReq.getDescription());
        report.setFileUrl(reportReq.getFileUrl());
        report.setStatus("SUBMITTED");
        report.setVersion(nextVersion);

        taskReportRepository.save(report);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV')")
    public ResponseEntity<?> getReports() {
        Users currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();

        List<TaskReport> reports = taskReportRepository.findAll();
        // Basic filtering based on role
        if (currentUser.getRole() == Role.DEVELOPER || currentUser.getRole() == Role.JUNIOR_DEV) {
            reports = taskReportRepository.findByDeveloperId(currentUser.getId());
        } else if (currentUser.getRole() == Role.TEAM_LEAD) {
            reports.removeIf(r -> r.getDeveloper().getTeam() == null || !r.getDeveloper().getTeam().getId().equals(currentUser.getTeam().getId()));
        }

        return ResponseEntity.ok(reports);
    }

    @PutMapping("/review/{reportId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD')")
    public ResponseEntity<?> reviewReport(@PathVariable Long reportId, @RequestBody TaskReport reviewReq) {
        Users currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();

        TaskReport report = taskReportRepository.findById(reportId).orElse(null);
        if (report == null) return ResponseEntity.badRequest().body("Report not found");

        if (currentUser.getRole() == Role.TEAM_LEAD) {
            if (report.getDeveloper().getTeam() == null || !report.getDeveloper().getTeam().getId().equals(currentUser.getTeam().getId())) {
                return ResponseEntity.status(403).body("Unauthorized: You cannot review reports from other teams");
            }
        }

        report.setStatus(reviewReq.getStatus());
        report.setReviewFeedback(reviewReq.getReviewFeedback());
        taskReportRepository.save(report);

        return ResponseEntity.ok(report);
    }
}
