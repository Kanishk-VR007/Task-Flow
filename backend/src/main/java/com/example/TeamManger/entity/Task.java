package com.example.TeamManger.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
public class Task {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;
    @NotBlank(message = "Task name is mandatory")
    private String taskName;
    
    private String description;
    
    private String domain; // FRONTEND, BACKEND, etc.
    
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    
    private Double estimatedHours;
    private Double actualHours;
    
    private Integer progress = 0;

    @NotNull(message = "Start time is mandatory")
    private LocalDateTime startTime;
    @NotNull(message = "End time is mandatory")
    private LocalDateTime endTime;
    @NotBlank(message = "Status is mandatory")
    private String completionStatus;
    @ManyToOne
    @JoinColumn(name="user")
    private Users user;
    @ManyToOne
    @JoinColumn(name="project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name="intern_id")
    private Users intern;

    public Long getId(){
        return id;
    }
    public String getTaskName() {
        return taskName;
    }
    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public Double getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Double estimatedHours) { this.estimatedHours = estimatedHours; }
    public Double getActualHours() { return actualHours; }
    public void setActualHours(Double actualHours) { this.actualHours = actualHours; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Users getIntern() { return intern; }
    public void setIntern(Users intern) { this.intern = intern; }
    public LocalDateTime getStartTime() {
        return startTime;
    }
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    public LocalDateTime getEndTime() {
        return endTime;
    }
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    public String getCompletionStatus() {
        return completionStatus;
    }
    public void setCompletionStatus(String completionStatus) {
        this.completionStatus = completionStatus;
    }
    public Users getUser(){
        return user;
    }
    public void setUser(Users user){
        this.user=user;
    }
    public Task(){}
    public Task(String taskName,LocalDateTime startTime,LocalDateTime endTime,String completionStatus,Users user){
        this.taskName=taskName;
        this.startTime=startTime;
        this.endTime=endTime;
        this.completionStatus=completionStatus;
        this.user=user;
    }
}
