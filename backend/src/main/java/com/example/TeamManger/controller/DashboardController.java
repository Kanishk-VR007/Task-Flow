package com.example.TeamManger.controller;

import com.example.TeamManger.entity.Users;
import com.example.TeamManger.entity.Role;
import com.example.TeamManger.repository.Userrepository;
import com.example.TeamManger.repository.Taskrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private Taskrepository taskRepository;

    @Autowired
    private Userrepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Users user = userRepository.findByEmail(email);
            if (user == null) user = userRepository.findByUserName(email);

            var allTasks = taskRepository.findAll();
            
            long totalTasks = allTasks.size();
            long completed = allTasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getCompletionStatus())).count();
            long inProgress = allTasks.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getCompletionStatus())).count();
            long pending = allTasks.stream().filter(t -> "PENDING".equalsIgnoreCase(t.getCompletionStatus())).count();
            long overdue = allTasks.stream().filter(t -> t.getEndTime() != null && t.getEndTime().isBefore(java.time.LocalDateTime.now()) && !"COMPLETED".equalsIgnoreCase(t.getCompletionStatus())).count();
            long totalUsers = userRepository.count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTasks", totalTasks);
            stats.put("completedTasks", completed);
            stats.put("inProgressTasks", inProgress);
            stats.put("pendingTasks", pending);
            stats.put("overdueTasks", overdue);
            stats.put("totalUsers", totalUsers);
            stats.put("completionRate", totalTasks > 0 ? Math.round((completed * 100.0) / totalTasks) : 0);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
