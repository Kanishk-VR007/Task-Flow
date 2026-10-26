package com.example.TeamManger.service;

import java.util.List;

import com.example.TeamManger.dto.RegisterRequestDto;
import com.example.TeamManger.entity.Users;

public interface UserService {
    public String Register(RegisterRequestDto data);
 public Users getUser(Long id);
 public List<Users> getAllUser();
 public String UpdateUser(Long id,Users Data);
 public String deleteuser(long id);
 public Boolean getByEmail(String email);
 public Boolean checkpassword(Users data);
 public Users getinfoByEmail(String data);
}
