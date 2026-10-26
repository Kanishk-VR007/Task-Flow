package com.example.TeamManger.dto;

public class AssignMemberRequest {
    private Long teamId;
    private String memberUsername;

    public AssignMemberRequest() {}

    public AssignMemberRequest(Long teamId, String memberUsername) {
        this.teamId = teamId;
        this.memberUsername = memberUsername;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getMemberUsername() {
        return memberUsername;
    }

    public void setMemberUsername(String memberUsername) {
        this.memberUsername = memberUsername;
    }
}
