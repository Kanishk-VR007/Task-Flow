package com.example.TeamManger.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import jakarta.persistence.Column;
import java.util.List;

@Entity
public class Users {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;
    private String userName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Column(name = "github_link")
    private String githubLink;
    
    @Column(name = "workload_score")
    private Integer workloadScore = 0;
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;
    
    private Role role=Role.DEVELOPER;
    private String fpassword;
    private String cpassword;

    private String primaryDomain; // e.g. BACKEND, FRONTEND
    private String secondaryDomains; // e.g. DEVOPS, DATABASE (comma separated)

    @Column(columnDefinition = "TEXT")
    private String avatarConfig;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private Users supervisor; // For tracking who supervises interns

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "supervisor")
    private List<Users> supervisedInterns;

    private Integer mentoringWorkload = 0;
    private Integer supportWorkload = 0;
    private Integer codeReviewWorkload = 0;
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Task> task;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGithubLink() {
        return githubLink;
    }

    public void setGithubLink(String githubLink) {
        this.githubLink = githubLink;
    }

    public Integer getWorkloadScore() {
        return workloadScore;
    }

    public void setWorkloadScore(Integer workloadScore) {
        this.workloadScore = workloadScore;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getFpassword() {
        return fpassword;
    }

    public void setFpassword(String fpassword) {
        this.fpassword = fpassword;
    }

    public void setCpassword(String cpassword) {
        this.cpassword = cpassword;
    }

    public String getCpassword() {
        return cpassword;
    }

    public Users() {

    }
    
    public Team getTeam() {
        return team;
    }
    
    public void setTeam(Team team) {
        this.team = team;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public List<Task> getTasks() {
        return task;
    }

    public void setTasks(List<Task> task) {
        this.task = task;
    }

    public String getPrimaryDomain() { return primaryDomain; }
    public void setPrimaryDomain(String primaryDomain) { this.primaryDomain = primaryDomain; }
    public String getSecondaryDomains() { return secondaryDomains; }
    public void setSecondaryDomains(String secondaryDomains) { this.secondaryDomains = secondaryDomains; }
    public String getAvatarConfig() { return avatarConfig; }
    public void setAvatarConfig(String avatarConfig) { this.avatarConfig = avatarConfig; }
    public Users getSupervisor() { return supervisor; }
    public void setSupervisor(Users supervisor) { this.supervisor = supervisor; }
    public List<Users> getSupervisedInterns() { return supervisedInterns; }
    public void setSupervisedInterns(List<Users> supervisedInterns) { this.supervisedInterns = supervisedInterns; }
    public Integer getMentoringWorkload() { return mentoringWorkload; }
    public void setMentoringWorkload(Integer mentoringWorkload) { this.mentoringWorkload = mentoringWorkload; }
    public Integer getSupportWorkload() { return supportWorkload; }
    public void setSupportWorkload(Integer supportWorkload) { this.supportWorkload = supportWorkload; }
    public Integer getCodeReviewWorkload() { return codeReviewWorkload; }
    public void setCodeReviewWorkload(Integer codeReviewWorkload) { this.codeReviewWorkload = codeReviewWorkload; }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public Integer getEffectiveWorkload() {
        if (task == null) return 0;
        int directTaskWorkload = (int) task.stream().filter(t -> !"COMPLETED".equalsIgnoreCase(t.getCompletionStatus())).count() * 10;
        int mentoring = mentoringWorkload != null ? mentoringWorkload : 0;
        int support = supportWorkload != null ? supportWorkload : 0;
        int review = codeReviewWorkload != null ? codeReviewWorkload : 0;
        return directTaskWorkload + mentoring + support + review;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("tasksCompleted")
    public int getTasksCompleted() {
        if (task == null) return 0;
        return (int) task.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getCompletionStatus())).count();
    }

    @com.fasterxml.jackson.annotation.JsonProperty("completionRate")
    public int getCompletionRate() {
        if (task == null || task.isEmpty()) return 0;
        return (int) ((getTasksCompleted() / (double) task.size()) * 100);
    }

    @com.fasterxml.jackson.annotation.JsonProperty("averageCompletionTime")
    public double getAverageCompletionTime() {
        if (task == null) return 0.0;
        List<Task> completed = task.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getCompletionStatus())).toList();
        if (completed.isEmpty()) return 0.0;
        return Math.round(completed.stream().mapToDouble(t -> t.getActualHours() != null ? t.getActualHours() : 0.0).average().orElse(0.0) * 10.0) / 10.0;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("currentProgress")
    public int getCurrentProgress() {
        if (task == null) return 0;
        List<Task> active = task.stream().filter(t -> !"COMPLETED".equalsIgnoreCase(t.getCompletionStatus())).toList();
        if (active.isEmpty()) return 0;
        return (int) active.stream().mapToInt(t -> t.getProgress() != null ? t.getProgress() : 0).average().orElse(0.0);
    }

    public Users(Long id, String userName, String email, Role role, String fpassword, String cpassword,
            List<Task> task) {
        this.id = id;
        this.userName = userName;
        this.email = email;
        this.role = role;
        this.fpassword = fpassword;
        this.cpassword = cpassword;
        this.task = task;
    }
}
