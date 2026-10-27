package com.example.TeamManger.controller;

import com.example.TeamManger.entity.Users;
import com.example.TeamManger.entity.Team;
import com.example.TeamManger.entity.Role;
import com.example.TeamManger.repository.Userrepository;
import com.example.TeamManger.repository.TeamRepository;
import com.example.TeamManger.service.UserService;
import com.example.TeamManger.util.HashUtil;
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
    private TeamRepository teamRepository;

    @Autowired
    private UserService userService;

    private Users getAuthenticatedUser() {
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByEmail(principal);
        if (user == null) {
            user = userRepository.findByUserName(principal);
        }
        return user;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Users user = getAuthenticatedUser();
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
            profile.put("isDefaultPassword", user.getIsDefaultPassword() != null ? user.getIsDefaultPassword() : false);
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
            Users currentUser = getAuthenticatedUser();
            if (currentUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");

            List<Users> users;
            if (currentUser.getRole() == Role.ADMIN) {
                users = userService.getAllUser();
            } else if (currentUser.getRole() == Role.PROJECT_MANAGER) {
                users = userRepository.findByCompanyPmIdOrId(currentUser.getId(), currentUser.getId());
                if (users.isEmpty()) {
                    users = Collections.singletonList(currentUser);
                }
            } else {
                Long pmId = currentUser.getCompanyPm() != null ? currentUser.getCompanyPm().getId() : null;
                if (pmId == null && currentUser.getTeam() != null && currentUser.getTeam().getProjectManager() != null) {
                    pmId = currentUser.getTeam().getProjectManager().getId();
                }
                if (pmId != null) {
                    users = userRepository.findByCompanyPmIdOrId(pmId, pmId);
                } else if (currentUser.getTeam() != null) {
                    users = userRepository.findByTeamId(currentUser.getTeam().getId());
                } else {
                    users = Collections.singletonList(currentUser);
                }
            }

            List<Map<String, Object>> result = users.stream().map(u -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", u.getId());
                m.put("name", u.getUserName());
                m.put("email", u.getEmail());
                m.put("role", u.getRole());
                m.put("fullName", u.getFullName());
                m.put("githubLink", u.getGithubLink());
                m.put("workloadScore", u.getWorkloadScore());
                m.put("effectiveWorkload", u.getEffectiveWorkload());
                m.put("primaryDomain", u.getPrimaryDomain());
                m.put("secondaryDomains", u.getSecondaryDomains());
                m.put("avatarConfig", u.getAvatarConfig());
                m.put("isDefaultPassword", u.getIsDefaultPassword());
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

    @GetMapping("/teams")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'JUNIOR_DEV', 'INTERN')")
    public ResponseEntity<?> getAllTeams() {
        try {
            Users currentUser = getAuthenticatedUser();
            if (currentUser == null || currentUser.getRole() == Role.ADMIN) {
                return ResponseEntity.ok(teamRepository.findAll());
            }

            if (currentUser.getRole() == Role.PROJECT_MANAGER) {
                return ResponseEntity.ok(teamRepository.findByProjectManagerId(currentUser.getId()));
            }

            Long pmId = currentUser.getCompanyPm() != null ? currentUser.getCompanyPm().getId() : null;
            if (pmId == null && currentUser.getTeam() != null && currentUser.getTeam().getProjectManager() != null) {
                pmId = currentUser.getTeam().getProjectManager().getId();
            }
            if (pmId != null) {
                return ResponseEntity.ok(teamRepository.findByProjectManagerId(pmId));
            }

            if (currentUser.getTeam() != null) {
                return ResponseEntity.ok(Collections.singletonList(currentUser.getTeam()));
            }

            return ResponseEntity.ok(Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/teams")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> createTeam(@RequestBody Map<String, String> body) {
        try {
            Users currentUser = getAuthenticatedUser();
            String teamName = body.get("teamName");
            if (teamName == null || teamName.isBlank()) throw new RuntimeException("Team name required");

            Team t = new Team();
            t.setTeamName(teamName);
            if (body.containsKey("domain")) {
                t.setDomain(body.get("domain"));
            }
            if (currentUser != null && currentUser.getRole() == Role.PROJECT_MANAGER) {
                t.setProjectManager(currentUser);
            }
            return ResponseEntity.ok(teamRepository.save(t));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/teams/build")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> buildTeam(@RequestBody Map<String, Object> body) {
        try {
            Users currentUser = getAuthenticatedUser();
            String teamName = (String) body.get("teamName");
            if (teamName == null || teamName.isBlank()) {
                return ResponseEntity.badRequest().body("Team name is required");
            }

            Team team = new Team();
            team.setTeamName(teamName);
            if (body.containsKey("domain") && body.get("domain") != null) {
                team.setDomain((String) body.get("domain"));
            }
            if (currentUser != null && currentUser.getRole() == Role.PROJECT_MANAGER) {
                team.setProjectManager(currentUser);
            }
            team = teamRepository.save(team);

            Users savedLead = null;

            // 1. Assign or Create Team Lead
            if (body.containsKey("lead") && body.get("lead") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> leadData = (Map<String, Object>) body.get("lead");
                String email = (String) leadData.get("email");
                String name = (String) leadData.get("name");
                String password = (String) leadData.get("password");
                String domain = (String) leadData.get("domain");

                if (email != null && !email.isBlank()) {
                    Users leadUser = userRepository.findByEmail(email);
                    if (leadUser == null) {
                        leadUser = new Users();
                        leadUser.setEmail(email);
                        leadUser.setUserName(name != null && !name.isBlank() ? name : email.split("@")[0]);
                        leadUser.setFullName(name);
                        String rawPwd = (password != null && !password.isBlank()) ? password : "Welcome@123";
                        leadUser.setFpassword(HashUtil.hashSHA256(rawPwd));
                        leadUser.setCpassword(HashUtil.hashSHA256(rawPwd));
                        leadUser.setIsDefaultPassword(true);
                    } else if (name != null && !name.isBlank()) {
                        leadUser.setFullName(name);
                    }
                    leadUser.setRole(Role.TEAM_LEAD);
                    leadUser.setTeam(team);
                    if (currentUser != null) {
                        leadUser.setCompanyPm(currentUser.getRole() == Role.PROJECT_MANAGER ? currentUser : currentUser.getCompanyPm());
                    }
                    if (domain != null && !domain.isBlank()) {
                        leadUser.setPrimaryDomain(domain);
                    }
                    savedLead = userRepository.save(leadUser);
                    team.setTeamLead(savedLead);
                    teamRepository.save(team);
                }
            }

            // 2. Assign or Create Members (Developers / Junior Devs)
            Map<String, Users> createdMembersByEmail = new HashMap<>();
            if (savedLead != null) {
                createdMembersByEmail.put(savedLead.getEmail().toLowerCase(), savedLead);
            }

            if (body.containsKey("members") && body.get("members") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> membersList = (List<Map<String, Object>>) body.get("members");
                for (Map<String, Object> m : membersList) {
                    String email = (String) m.get("email");
                    String name = (String) m.get("name");
                    String roleStr = (String) m.get("role");
                    String password = (String) m.get("password");
                    String domain = (String) m.get("domain");

                    if (email == null || email.isBlank()) continue;

                    Users memberUser = userRepository.findByEmail(email);
                    if (memberUser == null) {
                        memberUser = new Users();
                        memberUser.setEmail(email);
                        memberUser.setUserName(name != null && !name.isBlank() ? name : email.split("@")[0]);
                        memberUser.setFullName(name);
                        String rawPwd = (password != null && !password.isBlank()) ? password : "Welcome@123";
                        memberUser.setFpassword(HashUtil.hashSHA256(rawPwd));
                        memberUser.setCpassword(HashUtil.hashSHA256(rawPwd));
                        memberUser.setIsDefaultPassword(true);
                    } else if (name != null && !name.isBlank()) {
                        memberUser.setFullName(name);
                    }

                    Role r = Role.DEVELOPER;
                    if ("JUNIOR_DEV".equalsIgnoreCase(roleStr)) {
                        r = Role.JUNIOR_DEV;
                    }
                    memberUser.setRole(r);
                    memberUser.setTeam(team);
                    if (currentUser != null) {
                        memberUser.setCompanyPm(currentUser.getRole() == Role.PROJECT_MANAGER ? currentUser : currentUser.getCompanyPm());
                    }
                    if (domain != null && !domain.isBlank()) {
                        memberUser.setPrimaryDomain(domain);
                    }
                    Users saved = userRepository.save(memberUser);
                    createdMembersByEmail.put(saved.getEmail().toLowerCase(), saved);
                }
            }

            // 3. Assign or Create Interns
            if (body.containsKey("interns") && body.get("interns") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> internsList = (List<Map<String, Object>>) body.get("interns");
                for (Map<String, Object> intern : internsList) {
                    String email = (String) intern.get("email");
                    String name = (String) intern.get("name");
                    String password = (String) intern.get("password");
                    String domain = (String) intern.get("domain");
                    String supervisorEmail = (String) intern.get("supervisorEmail");

                    if (email == null || email.isBlank()) continue;

                    Users internUser = userRepository.findByEmail(email);
                    if (internUser == null) {
                        internUser = new Users();
                        internUser.setEmail(email);
                        internUser.setUserName(name != null && !name.isBlank() ? name : email.split("@")[0]);
                        internUser.setFullName(name);
                        String rawPwd = (password != null && !password.isBlank()) ? password : "Welcome@123";
                        internUser.setFpassword(HashUtil.hashSHA256(rawPwd));
                        internUser.setCpassword(HashUtil.hashSHA256(rawPwd));
                        internUser.setIsDefaultPassword(true);
                    } else if (name != null && !name.isBlank()) {
                        internUser.setFullName(name);
                    }

                    internUser.setRole(Role.INTERN);
                    internUser.setTeam(team);
                    if (currentUser != null) {
                        internUser.setCompanyPm(currentUser.getRole() == Role.PROJECT_MANAGER ? currentUser : currentUser.getCompanyPm());
                    }
                    if (domain != null && !domain.isBlank()) {
                        internUser.setPrimaryDomain(domain);
                    }

                    // Check supervisor
                    if (supervisorEmail != null && !supervisorEmail.isBlank()) {
                        Users sup = createdMembersByEmail.get(supervisorEmail.toLowerCase());
                        if (sup == null) sup = userRepository.findByEmail(supervisorEmail);
                        if (sup != null) internUser.setSupervisor(sup);
                    } else if (savedLead != null) {
                        internUser.setSupervisor(savedLead);
                    }

                    userRepository.save(internUser);
                }
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Team created and members assigned successfully");
            resp.put("teamId", team.getId());
            resp.put("teamName", team.getTeamName());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> addUser(@RequestBody Map<String, Object> body) {
        try {
            Users currentUser = getAuthenticatedUser();
            Users u = new Users();
            u.setFullName((String) body.get("name"));
            u.setUserName((String) body.get("name"));
            u.setEmail((String) body.get("email"));
            u.setRole(Role.valueOf((String) body.get("role")));
            u.setPrimaryDomain((String) body.get("primaryDomain"));

            if (currentUser != null) {
                if (currentUser.getRole() == Role.PROJECT_MANAGER) {
                    u.setCompanyPm(currentUser);
                } else if (currentUser.getCompanyPm() != null) {
                    u.setCompanyPm(currentUser.getCompanyPm());
                }
            }

            if (body.containsKey("teamId") && body.get("teamId") != null && !body.get("teamId").toString().isBlank()) {
                Long teamId = Long.parseLong(body.get("teamId").toString());
                Team t = teamRepository.findById(teamId).orElse(null);
                u.setTeam(t);
            }

            String rawPassword = (body.containsKey("password") && body.get("password") != null && !body.get("password").toString().isBlank())
                    ? body.get("password").toString() : "Welcome@123";
            u.setFpassword(HashUtil.hashSHA256(rawPassword));
            u.setCpassword(HashUtil.hashSHA256(rawPassword));
            u.setIsDefaultPassword(true);

            return ResponseEntity.ok(userRepository.save(u));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        try {
            Users user = getAuthenticatedUser();
            if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

            if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
            if (body.containsKey("name") && body.get("name") != null && !body.get("name").isBlank()) {
                user.setUserName(body.get("name"));
            }
            if (body.containsKey("userName") && body.get("userName") != null && !body.get("userName").isBlank()) {
                user.setUserName(body.get("userName"));
            }
            if (body.containsKey("githubLink")) user.setGithubLink(body.get("githubLink"));
            if (body.containsKey("primaryDomain")) user.setPrimaryDomain(body.get("primaryDomain"));
            if (body.containsKey("secondaryDomains")) user.setSecondaryDomains(body.get("secondaryDomains"));

            userRepository.save(user);

            Map<String, Object> res = new HashMap<>();
            res.put("id", user.getId());
            res.put("name", user.getUserName());
            res.put("fullName", user.getFullName());
            res.put("email", user.getEmail());
            res.put("role", user.getRole());
            res.put("githubLink", user.getGithubLink());
            res.put("primaryDomain", user.getPrimaryDomain());
            res.put("secondaryDomains", user.getSecondaryDomains());
            res.put("teamName", user.getTeam() != null ? user.getTeam().getTeamName() : null);
            res.put("isDefaultPassword", user.getIsDefaultPassword());
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        try {
            Users user = getAuthenticatedUser();
            if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

            String newPassword = body.get("newPassword");
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("New password must be at least 6 characters");
            }

            // Check old password if provided and user does not currently have isDefaultPassword
            if (body.containsKey("oldPassword") && body.get("oldPassword") != null && !body.get("oldPassword").isBlank()) {
                String oldHashed = HashUtil.hashSHA256(body.get("oldPassword"));
                if (user.getFpassword() != null && !user.getFpassword().equals(oldHashed)) {
                    return ResponseEntity.badRequest().body("Current password is incorrect");
                }
            }

            String hashed = HashUtil.hashSHA256(newPassword);
            user.setFpassword(hashed);
            user.setCpassword(hashed);
            user.setIsDefaultPassword(false);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/dismiss-default-password")
    public ResponseEntity<?> dismissDefaultPassword() {
        try {
            Users user = getAuthenticatedUser();
            if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

            user.setIsDefaultPassword(false);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Default password kept"));
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
                    Team team = teamRepository.findById(teamId).orElse(null);
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
            Users currentUser = getAuthenticatedUser();

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
                intern.setSupervisor(null);
            }

            userRepository.save(intern);
            return ResponseEntity.ok("Supervisor updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/me/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, String> body) {
        try {
            Users user = getAuthenticatedUser();
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
