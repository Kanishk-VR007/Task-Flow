package com.example.TeamManger.dto;

import org.springframework.stereotype.Component;

import com.example.TeamManger.entity.Role;

@Component
public class AuthResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String token;
    private String avatarConfig;
    private Boolean isDefaultPassword = false;

    public Boolean getIsDefaultPassword() {
        return isDefaultPassword != null ? isDefaultPassword : false;
    }
    public void setIsDefaultPassword(Boolean isDefaultPassword) {
        this.isDefaultPassword = isDefaultPassword;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }
    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }
    public String getAvatarConfig() {
        return avatarConfig;
    }
    public void setAvatarConfig(String avatarConfig) {
        this.avatarConfig = avatarConfig;
    }
    public AuthResponse(Long id, String name, String email, Role role, String token, String avatarConfig) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
        this.avatarConfig = avatarConfig;
    }
    public AuthResponse() {
    }
}
