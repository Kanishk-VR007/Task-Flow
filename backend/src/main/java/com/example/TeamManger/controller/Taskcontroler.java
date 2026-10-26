package com.example.TeamManger.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import jakarta.validation.Valid;

import com.example.TeamManger.entity.Task;
import com.example.TeamManger.service.TaskService;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class Taskcontroler {
    @org.springframework.web.bind.annotation.ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(
            org.springframework.web.bind.MethodArgumentNotValidException ex) {
        return new ResponseEntity<>("Validation failed", HttpStatus.BAD_REQUEST);
    }

    @Autowired
    TaskService obj;

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV')")
    @PostMapping("/save")
    ResponseEntity<?> SaveTask(@Valid @RequestBody Task data) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return new ResponseEntity<>(obj.SaveTask(data, email), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Some Conflicted", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/getById/{id}")
    ResponseEntity<?> GetDataById(@PathVariable Long id) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return new ResponseEntity<>(obj.getTaskById(id, email), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("No data found for the id", HttpStatus.NOT_FOUND);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV', 'INTERN')")
    @GetMapping("/GetallData")
    ResponseEntity<?> GetAllData() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return new ResponseEntity<>(obj.getAllTasks(email), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("No data is found", HttpStatus.NOT_FOUND);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER','TEAM_LEAD')")
    @DeleteMapping("/delete/{id}")
    ResponseEntity<String> DeleteTask(@PathVariable Long id) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            obj.DeleteTask(id, email);
            return new ResponseEntity<>("Deleted Sucessfully", HttpStatus.OK);
        } catch (Exception error) {
            return new ResponseEntity<>(error.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV')")
    @PutMapping("/update/{id}")
    ResponseEntity<?> UpdateTask(@PathVariable Long id, @Valid @RequestBody Task data) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return new ResponseEntity<>(obj.UpdateTask(id, data, email), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @Autowired
    private com.example.TeamManger.repository.Userrepository userRepo;

    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV')")
    @GetMapping("/suggestions/{domain}")
    public ResponseEntity<?> getSuggestions(@PathVariable String domain) {
        try {
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            com.example.TeamManger.entity.Users currentUser = userRepo.findAll().stream()
                    .filter(u -> currentUserEmail.equals(u.getEmail()))
                    .findFirst().orElse(null);

            java.util.List<com.example.TeamManger.entity.Users> developers = userRepo.findAll().stream()
                    .filter(u -> u.getRole() == com.example.TeamManger.entity.Role.DEVELOPER
                            || u.getRole() == com.example.TeamManger.entity.Role.JUNIOR_DEV
                            || u.getRole() == com.example.TeamManger.entity.Role.INTERN)
                    .filter(u -> {
                        if (currentUser == null)
                            return false;

                        // Check Team scope
                        if (currentUser.getRole() == com.example.TeamManger.entity.Role.TEAM_LEAD
                                || currentUser.getRole() == com.example.TeamManger.entity.Role.DEVELOPER
                                || currentUser.getRole() == com.example.TeamManger.entity.Role.JUNIOR_DEV) {
                            if (currentUser.getTeam() == null || u.getTeam() == null
                                    || !currentUser.getTeam().getId().equals(u.getTeam().getId())) {
                                return false;
                            }
                        }

                        // Check Intern scope for developers
                        if (u.getRole() == com.example.TeamManger.entity.Role.INTERN) {
                            if (currentUser.getRole() == com.example.TeamManger.entity.Role.DEVELOPER
                                    || currentUser.getRole() == com.example.TeamManger.entity.Role.JUNIOR_DEV) {
                                return u.getSupervisor() != null
                                        && u.getSupervisor().getId().equals(currentUser.getId());
                            }
                        }

                        // Check Developer scope for developers (can only assign themselves as primary)
                        if (u.getRole() == com.example.TeamManger.entity.Role.DEVELOPER
                                || u.getRole() == com.example.TeamManger.entity.Role.JUNIOR_DEV) {
                            if (currentUser.getRole() == com.example.TeamManger.entity.Role.DEVELOPER
                                    || currentUser.getRole() == com.example.TeamManger.entity.Role.JUNIOR_DEV) {
                                return u.getId().equals(currentUser.getId());
                            }
                        }

                        return true;
                    })
                    .sorted((u1, u2) -> {
                        // Sort primarily by workload
                        int w1 = u1.getEffectiveWorkload();
                        int w2 = u2.getEffectiveWorkload();
                        if (w1 != w2)
                            return Integer.compare(w1, w2);
                        // Then prioritize those whose primary domain matches
                        boolean m1 = domain.equalsIgnoreCase(u1.getPrimaryDomain());
                        boolean m2 = domain.equalsIgnoreCase(u2.getPrimaryDomain());
                        if (m1 && !m2)
                            return -1;
                        if (!m1 && m2)
                            return 1;
                        return 0;
                    })
                    .collect(java.util.stream.Collectors.toList());

            java.util.List<java.util.Map<String, Object>> result = developers.stream().map(u -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", u.getId());
                map.put("name", u.getFullName());
                map.put("role", u.getRole().toString());
                map.put("primaryDomain", u.getPrimaryDomain());
                map.put("workload", u.getEffectiveWorkload());
                map.put("domainMatch", domain.equalsIgnoreCase(u.getPrimaryDomain()) ? "HIGH" : "LOW");
                return map;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
