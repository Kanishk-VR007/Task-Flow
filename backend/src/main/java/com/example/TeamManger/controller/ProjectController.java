package com.example.TeamManger.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
public class ProjectController {

    @GetMapping("/trends")
    public ResponseEntity<String> getProjectTrends() {
        return ResponseEntity.ok("Project trends data");
    }

    @PostMapping("/epics")
    public ResponseEntity<String> createEpic() {
        return ResponseEntity.ok("Epic created successfully");
    }
}
