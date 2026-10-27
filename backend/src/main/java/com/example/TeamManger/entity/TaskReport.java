package com.example.TeamManger.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class TaskReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="task_id")
    private Task task;

    @ManyToOne
    @JoinColumn(name="developer_id")
    private Users developer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Users company;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String fileContent;

    private String status; // SUBMITTED, UNDER_REVIEW, APPROVED, REDO_REQUESTED
    
    @Column(columnDefinition = "TEXT")
    private String reviewFeedback;

    private Integer version = 1;
    private LocalDateTime submissionDate;

    @PrePersist
    protected void onCreate() {
        this.submissionDate = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public Users getDeveloper() { return developer; }
    public void setDeveloper(Users developer) { this.developer = developer; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getFileContent() { return fileContent; }
    public void setFileContent(String fileContent) { this.fileContent = fileContent; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReviewFeedback() { return reviewFeedback; }
    public void setReviewFeedback(String reviewFeedback) { this.reviewFeedback = reviewFeedback; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }
    public Users getCompany() { return company; }
    public void setCompany(Users company) { this.company = company; }
}
