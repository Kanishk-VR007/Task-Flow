package com.example.TeamManger.dto;

public class TeamCreateRequest {
    private String teamName;
    private String domain;
    private String teamLeadUsername;

    public TeamCreateRequest() {}

    public TeamCreateRequest(String teamName, String domain, String teamLeadUsername) {
        this.teamName = teamName;
        this.domain = domain;
        this.teamLeadUsername = teamLeadUsername;
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

    public String getTeamLeadUsername() {
        return teamLeadUsername;
    }

    public void setTeamLeadUsername(String teamLeadUsername) {
        this.teamLeadUsername = teamLeadUsername;
    }
}
