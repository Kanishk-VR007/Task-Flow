package com.example.TeamManger.security;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class Jwtfilter extends OncePerRequestFilter{
    @Autowired
    Jwtutil obj;
    @Override
    public void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain filter)throws IOException,ServletException{
        if("OPTIONS".equalsIgnoreCase(request.getMethod())){
           filter.doFilter(request, response);
            return;
        }
        String header=request.getHeader("Authorization");
        if(header==null || !header.startsWith("Bearer ")){
            filter.doFilter(request, response);
            return;
        }
        String Token=header.substring(7);

        if(obj.validation(Token)){
            String email=obj.ExtractEmail(Token);
            String role=obj.ExtractRole(Token);
            if(email!=null && SecurityContextHolder.getContext().getAuthentication()==null){
                UsernamePasswordAuthenticationToken auth;
                if(role!=null){
                    auth=new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_"+role)));
                }
                else{
                    auth=new UsernamePasswordAuthenticationToken(email,null,null);
                }
                auth.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        filter.doFilter(request, response);
    }
}
