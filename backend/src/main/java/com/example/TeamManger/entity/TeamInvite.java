package com.example.TeamManger.entity;

import jakarta.persistence.*;

@Entity
public class TeamInvite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne
    @JoinColumn(name = "invitee_id", nullable = false)
    private Users invitee;

    // PENDING, ACCEPTED, REJECTED
    @Column(nullable = false)
    private String status = "PENDING";

    public TeamInvite() {}

    public TeamInvite(Team team, Users invitee) {
        this.team = team;
        this.invitee = invitee;
        this.status = "PENDING";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public Users getInvitee() {
        return invitee;
    }

    public void setInvitee(Users invitee) {
        this.invitee = invitee;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
