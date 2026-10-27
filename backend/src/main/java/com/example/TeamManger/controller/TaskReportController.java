package com.example.TeamManger.controller;

import com.example.TeamManger.entity.TaskReport;
import com.example.TeamManger.entity.Task;
import com.example.TeamManger.entity.Users;
import com.example.TeamManger.entity.Role;
import com.example.TeamManger.repository.TaskReportRepository;
import com.example.TeamManger.repository.Taskrepository;
import com.example.TeamManger.repository.Userrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

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

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('DEVELOPER', 'JUNIOR_DEV', 'TEAM_LEAD', 'PROJECT_MANAGER', 'ADMIN')")
    public ResponseEntity<?> uploadReportFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String storedFileName = UUID.randomUUID() + (originalFilename != null ? "_" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_") : extension);
            
            Path uploadPath = Paths.get("uploads", "reports");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String contentType = file.getContentType();
            if (contentType == null) contentType = "application/octet-stream";
            
            String textContent = null;
            String lowerName = (originalFilename != null ? originalFilename : "").toLowerCase();
            if (contentType.startsWith("text/") || 
                contentType.contains("json") || 
                contentType.contains("javascript") ||
                lowerName.endsWith(".txt") ||
                lowerName.endsWith(".md") ||
                lowerName.endsWith(".js") ||
                lowerName.endsWith(".jsx") ||
                lowerName.endsWith(".json") ||
                lowerName.endsWith(".java") ||
                lowerName.endsWith(".py") ||
                lowerName.endsWith(".html") ||
                lowerName.endsWith(".css") ||
                lowerName.endsWith(".sql") ||
                lowerName.endsWith(".yml") ||
                lowerName.endsWith(".yaml")) {
                textContent = new String(file.getBytes(), StandardCharsets.UTF_8);
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("fileUrl", "/api/reports/files/" + storedFileName);
            resp.put("fileName", originalFilename);
            resp.put("fileType", contentType);
            resp.put("fileSize", file.getSize());
            resp.put("fileContent", textContent);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> getReportFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads", "reports").resolve(filename).normalize();
            if (!Files.exists(filePath)) {
                filePath = Paths.get("uploads").resolve(filename).normalize();
            }
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String lowerName = filename.toLowerCase();
            String contentType = Files.probeContentType(filePath);
            if (contentType == null || contentType.equals("application/octet-stream")) {
                if (lowerName.endsWith(".pdf")) contentType = "application/pdf";
                else if (lowerName.endsWith(".js") || lowerName.endsWith(".jsx")) contentType = "application/javascript";
                else if (lowerName.endsWith(".md")) contentType = "text/markdown";
                else if (lowerName.endsWith(".json")) contentType = "application/json";
                else if (lowerName.endsWith(".png")) contentType = "image/png";
                else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) contentType = "image/jpeg";
                else if (lowerName.endsWith(".txt")) contentType = "text/plain";
                else contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    private Users getCompanyForUser(Users u) {
        if (u == null) return null;
        if (u.getCompanyPm() != null) return u.getCompanyPm();
        if (u.getRole() == Role.PROJECT_MANAGER) return u;
        if (u.getTeam() != null && u.getTeam().getProjectManager() != null) return u.getTeam().getProjectManager();
        return u;
    }

    @PostMapping("/submit/{taskId}")
    @PreAuthorize("hasAnyRole('DEVELOPER', 'JUNIOR_DEV')")
    public ResponseEntity<?> submitReport(@PathVariable Long taskId, @RequestBody TaskReport reportReq) {
        Users currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        Users company = getCompanyForUser(currentUser);
        Long companyId = company != null ? company.getId() : currentUser.getId();

        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return ResponseEntity.badRequest().body("Task not found");

        if (task.getCompany() != null && !task.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).body("Unauthorized: Task belongs to another company");
        }

        if (task.getUser() == null || !task.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("Unauthorized: You are not assigned to this task");
        }

        List<TaskReport> existingReports = taskReportRepository.findByTaskIdAndCompanyIdOrderByVersionDesc(taskId, companyId);
        Integer nextVersion = existingReports.isEmpty() ? 1 : existingReports.get(0).getVersion() + 1;

        TaskReport report = new TaskReport();
        report.setTask(task);
        report.setDeveloper(currentUser);
        report.setCompany(company);
        report.setTitle(reportReq.getTitle());
        report.setDescription(reportReq.getDescription());
        report.setFileUrl(reportReq.getFileUrl());
        report.setFileName(reportReq.getFileName());
        report.setFileType(reportReq.getFileType());
        report.setFileSize(reportReq.getFileSize());
        report.setFileContent(reportReq.getFileContent());
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
        Users company = getCompanyForUser(currentUser);
        Long companyId = company != null ? company.getId() : currentUser.getId();

        List<TaskReport> reports;
        if (currentUser.getRole() == Role.DEVELOPER || currentUser.getRole() == Role.JUNIOR_DEV) {
            reports = taskReportRepository.findByDeveloperIdAndCompanyIdOrderBySubmissionDateDesc(currentUser.getId(), companyId);
        } else if (currentUser.getRole() == Role.TEAM_LEAD) {
            reports = taskReportRepository.findByCompanyIdOrderBySubmissionDateDesc(companyId);
            reports.removeIf(r -> r.getDeveloper() == null || r.getDeveloper().getTeam() == null || !r.getDeveloper().getTeam().getId().equals(currentUser.getTeam().getId()));
        } else {
            // ADMIN or PROJECT_MANAGER sees only reports for their specific company
            reports = taskReportRepository.findByCompanyIdOrderBySubmissionDateDesc(companyId);
        }

        return ResponseEntity.ok(reports);
    }

    @PutMapping("/review/{reportId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD')")
    public ResponseEntity<?> reviewReport(@PathVariable Long reportId, @RequestBody TaskReport reviewReq) {
        Users currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        Users company = getCompanyForUser(currentUser);
        Long companyId = company != null ? company.getId() : currentUser.getId();

        TaskReport report = taskReportRepository.findById(reportId).orElse(null);
        if (report == null) return ResponseEntity.badRequest().body("Report not found");

        if (report.getCompany() != null && !report.getCompany().getId().equals(companyId)) {
            return ResponseEntity.status(403).body("Unauthorized: You cannot review reports from other companies");
        }

        if (currentUser.getRole() == Role.TEAM_LEAD) {
            if (report.getDeveloper() == null || report.getDeveloper().getTeam() == null || !report.getDeveloper().getTeam().getId().equals(currentUser.getTeam().getId())) {
                return ResponseEntity.status(403).body("Unauthorized: You cannot review reports from other teams");
            }
        }

        report.setStatus(reviewReq.getStatus());
        report.setReviewFeedback(reviewReq.getReviewFeedback());
        taskReportRepository.save(report);

        // Synchronize Task completion status
        if ("APPROVED".equalsIgnoreCase(reviewReq.getStatus()) && report.getTask() != null) {
            Task task = report.getTask();
            task.setCompletionStatus("COMPLETED");
            taskRepository.save(task);
        } else if ("REDO_REQUESTED".equalsIgnoreCase(reviewReq.getStatus()) && report.getTask() != null) {
            Task task = report.getTask();
            task.setCompletionStatus("IN_PROGRESS");
            taskRepository.save(task);
        }

        return ResponseEntity.ok(report);
    }
}

