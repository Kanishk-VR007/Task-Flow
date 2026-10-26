package com.example.TeamManger.dto;

import com.example.TeamManger.entity.Role;

public class RegisterRequestDto {
    private String name;
    private String email;
    private String firstPassword;
    private String confirmPassword;
    private Role role;
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
    public String getFirstPassword() {
        return firstPassword;
    }
    public void setFirstPassword(String firstPassword) {
        this.firstPassword = firstPassword;
    }
    public String getConfirmPassword() {
        return confirmPassword;
    }
    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
    
    public RegisterRequestDto(String name, String email, String firstPassword, String confirmPassword,Role role) {
        this.name = name;
        this.email = email;
        this.firstPassword = firstPassword;
        this.confirmPassword = confirmPassword;
        this.role=role;
    }
    public RegisterRequestDto() {
    }
    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }
    
}
