package com.example.TeamManger.security;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import com.example.TeamManger.entity.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class Jwtutil{
    String base="huricanetheonly12tyhggej0amzp9wxjnpsbfvccxhypgfNWEFHBFZSIGVIAUZBB";
    int Expiration=1000*60*60*24;
    private final Key Actual_Key=Keys.hmacShaKeyFor(base.getBytes());
    public String gen_token(String Email,Role role){
        return Jwts.builder()
                   .setSubject(Email)
                   .setIssuedAt(new Date(System.currentTimeMillis()))
                   .setExpiration(new Date(System.currentTimeMillis()+Expiration))
                   .claim("role", role)
                   .signWith(Actual_Key,SignatureAlgorithm.HS256)
                   .compact();
    }
    private Claims getAllClaims(String Token){
        return Jwts.parserBuilder()
                   .setSigningKey(Actual_Key)
                   .build()
                   .parseClaimsJws(Token)
                   .getBody();
    }
    public String ExtractEmail(String Token){
        return getAllClaims(Token).getSubject();
    }
    public String ExtractRole(String Token){
        Object role=getAllClaims(Token).get("role");
        if(role!=null){
            return role.toString();
        }else{
            return null;
        }
    }
    public boolean validation(String Token){
        try{
            getAllClaims(Token);
            return true;
        }catch(Exception e){
            return false;
        }
    }
}
