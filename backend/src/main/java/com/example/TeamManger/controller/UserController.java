package com.example.TeamManger.controller;

import com.example.TeamManger.entity.Users;
import com.example.TeamManger.entity.Role;
import com.example.TeamManger.repository.Userrepository;
import com.example.TeamManger.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private Userrepository userRepository;

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Users user = userRepository.findByEmail(email);
            if (user == null) user = userRepository.findByUserName(email);
            if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("name", user.getUserName());
            profile.put("email", user.getEmail());
            profile.put("role", user.getRole());
            profile.put("fullName", user.getFullName());
            profile.put("githubLink", user.getGithubLink());
            profile.put("workloadScore", user.getWorkloadScore());
            profile.put("effectiveWorkload", user.getEffectiveWorkload());
            profile.put("primaryDomain", user.getPrimaryDomain());
            profile.put("secondaryDomains", user.getSecondaryDomains());
            profile.put("avatarConfig", user.getAvatarConfig());
            profile.put("teamId", user.getTeam() != null ? user.getTeam().getId() : null);
            profile.put("teamName", user.getTeam() != null ? user.getTeam().getTeamName() : null);

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV', 'INTERN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<Users> users = userService.getAllUser();
            List<Map<String, Object>> result = users.stream().map(u -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", u.getId());
                m.put("name", u.getUserName());
                m.put("email", u.getEmail());
                m.put("role", u.getRole());
                m.put("fullName", u.getFullName());
                m.put("workloadScore", u.getWorkloadScore());
                m.put("effectiveWorkload", u.getEffectiveWorkload());
                m.put("primaryDomain", u.getPrimaryDomain());
                m.put("secondaryDomains", u.getSecondaryDomains());
                m.put("avatarConfig", u.getAvatarConfig());
                m.put("teamId", u.getTeam() != null ? u.getTeam().getId() : null);
                m.put("teamName", u.getTeam() != null ? u.getTeam().getTeamName() : null);
                m.put("supervisorId", u.getSupervisor() != null ? u.getSupervisor().getId() : null);
                if (u.getSupervisedInterns() != null) {
                    m.put("supervisedInterns", u.getSupervisedInterns().stream().map(intern -> {
                        Map<String, Object> im = new HashMap<>();
                        im.put("id", intern.getId());
                        im.put("name", intern.getUserName());
                        return im;
                    }).collect(Collectors.toList()));
                }
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Users user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            
            if (body.containsKey("role")) {
                Role newRole = Role.valueOf(body.get("role"));
                user.setRole(newRole);
            }
            if (body.containsKey("teamId")) {
                if (body.get("teamId") != null && !body.get("teamId").toString().isEmpty()) {
                    Long teamId = Long.parseLong(body.get("teamId").toString());
                    com.example.TeamManger.entity.Team team = teamRepository.findById(teamId).orElse(null);
                    user.setTeam(team);
                } else {
                    user.setTeam(null);
                }
            }
            if (body.containsKey("primaryDomain")) {
                user.setPrimaryDomain(body.get("primaryDomain"));
            }
            userRepository.save(user);
            return ResponseEntity.ok("User updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/supervisor")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD')")
    public ResponseEntity<?> updateSupervisor(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Users intern = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Intern not found"));
            
            // Check if current user is allowed
            String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            Users currentUser = userRepository.findByEmail(currentEmail);
            if (currentUser == null) currentUser = userRepository.findByUserName(currentEmail);
            
            if (currentUser.getRole() == Role.TEAM_LEAD) {
                if (intern.getTeam() == null || currentUser.getTeam() == null || !intern.getTeam().getId().equals(currentUser.getTeam().getId())) {
                    throw new SecurityException("Cannot assign intern from another team");
                }
            }

            if (body.containsKey("supervisorId") && body.get("supervisorId") != null) {
                Long supervisorId = Long.parseLong(body.get("supervisorId").toString());
                Users supervisor = userRepository.findById(supervisorId).orElseThrow(() -> new RuntimeException("Supervisor not found"));
                if (currentUser.getRole() == Role.TEAM_LEAD) {
                    if (supervisor.getTeam() == null || !supervisor.getTeam().getId().equals(currentUser.getTeam().getId())) {
                        throw new SecurityException("Cannot assign to developer from another team");
                    }
                }
                intern.setSupervisor(supervisor);
            } else {
                intern.setSupervisor(null); // Remove assignment
            }
            
            userRepository.save(intern);
            return ResponseEntity.ok("Supervisor updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Autowired
    private com.example.TeamManger.repository.TeamRepository teamRepository;

    @GetMapping("/teams")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV', 'INTERN')")
    public ResponseEntity<?> getAllTeams() {
        try {
            return ResponseEntity.ok(teamRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/teams")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> createTeam(@RequestBody Map<String, String> body) {
        try {
            String teamName = body.get("teamName");
            if (teamName == null || teamName.isBlank()) throw new RuntimeException("Team name required");
            com.example.TeamManger.entity.Team t = new com.example.TeamManger.entity.Team();
            t.setTeamName(teamName);
            return ResponseEntity.ok(teamRepository.save(t));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> addUser(@RequestBody Map<String, Object> body) {
        try {
            Users u = new Users();
            u.setFullName((String) body.get("name"));
            u.setUserName((String) body.get("name"));
            u.setEmail((String) body.get("email"));
            u.setRole(Role.valueOf((String) body.get("role")));
            u.setPrimaryDomain((String) body.get("primaryDomain"));
            
            if (body.containsKey("teamId") && body.get("teamId") != null) {
                Long teamId = Long.parseLong(body.get("teamId").toString());
                com.example.TeamManger.entity.Team t = teamRepository.findById(teamId).orElse(null);
                u.setTeam(t);
            }

            u.setFpassword(com.example.TeamManger.util.HashUtil.hashSHA256("password"));
            u.setCpassword(com.example.TeamManger.util.HashUtil.hashSHA256("password"));
            
            return ResponseEntity.ok(userRepository.save(u));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/me/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, String> body) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Users user = userRepository.findByEmail(email);
            if (user == null) user = userRepository.findByUserName(email);
            if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            
            if (body.containsKey("avatarConfig")) {
                user.setAvatarConfig(body.get("avatarConfig"));
                userRepository.save(user);
            }
            return ResponseEntity.ok("Avatar updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
