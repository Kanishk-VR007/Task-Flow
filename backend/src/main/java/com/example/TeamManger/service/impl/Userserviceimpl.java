package com.example.TeamManger.service.impl;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.TeamManger.dto.RegisterRequestDto;
import com.example.TeamManger.entity.Users;
import com.example.TeamManger.repository.Userrepository;
import com.example.TeamManger.service.UserService;
import com.example.TeamManger.util.HashUtil;
@Service
public class Userserviceimpl implements UserService{
    @Autowired
    Userrepository obj;
public Boolean checkpassword(Users data){
    if(data.getCpassword().equals(data.getFpassword())){
           return false;
        }
    else{
        return true;
    }
}
 public String Register(RegisterRequestDto data){
        Users user=new Users();
        user.setEmail(data.getEmail());
        user.setFpassword(HashUtil.hashSHA256(data.getFirstPassword()));
        user.setCpassword(HashUtil.hashSHA256(data.getConfirmPassword()));
        user.setRole(data.getRole());
        user.setUserName(data.getName());
        obj.save(user);
         return "Sucessfully Registered";
 }
 public Users getUser(Long id){
    return obj.findById(id).orElseThrow(()->new RuntimeException("No User Found"));
 }
 public Boolean getByEmail(String email){
    return obj.existsByEmail(email);
 }
 public List<Users> getAllUser(){
    return obj.findAll();
 }
 public String UpdateUser(Long id,Users data){
    Users user=obj.findById(id).orElseThrow(()->new RuntimeException("No Suitable data is found for Update"));
   try{ 
if(data.getFpassword().equals(data.getCpassword())){
    if(data.getUserName()!=null){
        user.setUserName(data.getUserName());
    }
    if(data.getEmail()!=null){
        user.setEmail(data.getEmail());
    }
    if(data.getRole()!=null){
        user.setRole(data.getRole());
    }
    if(data.getFpassword()!=null){
        user.setFpassword(HashUtil.hashSHA256(data.getFpassword()));
    }
    if(data.getCpassword()!=null){
        user.setCpassword(HashUtil.hashSHA256(data.getCpassword()));
    }
    obj.save(user);
    return "Updated Sucessfully";}
    else
    throw new RuntimeException("Please Enter your passwords correctly");}
    catch(RuntimeException e){
        return e.getMessage();
    }
}
 public Users getinfoByEmail(String data){
    Users user=obj.findByEmail(data);
    return user;
 }
 public String deleteuser(long id){
    Users user=obj.findById(id).orElseThrow(()->new RuntimeException("No data found to delete"));
    obj.delete(user);
    return "Deleted User";
 }   
} 
