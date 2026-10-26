package com.example.TeamManger.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class Securityconfig {
    private final Jwtfilter jwtfilter;
    public Securityconfig(Jwtfilter jwtfilter){
        this.jwtfilter=jwtfilter; //to prevent the self-injection error and dependency intialization error we use constructor type injection
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http
        .cors(Customizer.withDefaults())
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(auth->
        auth
        .requestMatchers(
            "/auth/login",
            "/auth/login/**",
            "/auth/register",
            "/auth/register/**",
            "/auth/oauth-login",
            "/auth/drop-constraint",
            "/swagger-ui/**",
            "/v3/api-docs/**"
        ).permitAll()
        .anyRequest()
        .authenticated()
        )
        .addFilterBefore(jwtfilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
