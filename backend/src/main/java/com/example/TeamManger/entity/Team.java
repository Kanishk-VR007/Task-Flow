package com.example.TeamManger.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String teamName;

    private String domain;

    @ManyToOne
    @JoinColumn(name = "team_lead_id")
    private Users teamLead;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_manager_id")
    private Users projectManager;

    @OneToMany(mappedBy = "team")
    private List<Users> members;

    public Team() {}

    public Team(String teamName, String domain, Users teamLead) {
        this.teamName = teamName;
        this.domain = domain;
        this.teamLead = teamLead;
    }

    public Team(String teamName, String domain, Users teamLead, Users projectManager) {
        this.teamName = teamName;
        this.domain = domain;
        this.teamLead = teamLead;
        this.projectManager = projectManager;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public Users getTeamLead() {
        return teamLead;
    }

    public void setTeamLead(Users teamLead) {
        this.teamLead = teamLead;
    }

    public Users getProjectManager() {
        return projectManager;
    }

    public void setProjectManager(Users projectManager) {
        this.projectManager = projectManager;
    }

    public List<Users> getMembers() {
        return members;
    }

    public void setMembers(List<Users> members) {
        this.members = members;
    }
}
