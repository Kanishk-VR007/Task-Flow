package com.example.TeamManger.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.TeamManger.dto.AuthRequest;
import com.example.TeamManger.dto.AuthResponse;
import com.example.TeamManger.dto.RegisterRequestDto;
import com.example.TeamManger.entity.Users;
import com.example.TeamManger.repository.Userrepository;
import com.example.TeamManger.security.Jwtutil;
import com.example.TeamManger.service.UserService;
import com.example.TeamManger.util.HashUtil;
import java.util.List;

@RequestMapping("/auth")
@RestController
@CrossOrigin(origins = "*")
public class Authcontroller {
    @Autowired
    org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    Userrepository userRepository;

    @Autowired
    UserService obj;
    @Autowired
    Jwtutil obj2;
    // @PostMapping("/register")
    // ResponseEntity<?> SaveUser(@RequestBody Users data){
    // try{
    // if(obj.checkpassword(data)){
    // return ResponseEntity
    // .status(HttpStatus.BAD_REQUEST)
    // .body("Please enter your Password credentials correctly");
    // }
    // if(!obj.getByEmail(data.getEmail())){
    // return new ResponseEntity<>(obj.Register(data),HttpStatus.OK);
    // }
    // else{
    // return ResponseEntity.status(HttpStatus.BAD_REQUEST)
    // .body("The Email already exist");
    // }
    // }
    // catch(RuntimeException e){
    // return new ResponseEntity<>(e.getMessage(),HttpStatus.CONFLICT);
    // }
    // }

    @GetMapping("/drop-constraint")
    public String dropConstraint() {
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CHECK users_chk_1");
            return "Dropped constraint users_chk_1";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> userRegister(@RequestBody RegisterRequestDto data) {
        try {
            if (!data.getFirstPassword().equals(data.getConfirmPassword())) {
                return new ResponseEntity<>(
                        "Please make sure that the password in the FirstPassword and ConfirmPassword is same",
                        HttpStatus.CONFLICT);
            }
            if (obj.getByEmail(data.getEmail())) {
                return new ResponseEntity<>(
                        "This Email already exist please try to login or Register with unregistered email",
                        HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(obj.Register(data), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest data) {
        try {
            if (data == null || data.getEmail() == null || data.getEmail().trim().isEmpty()) {
                return new ResponseEntity<>("Please enter your email or username", HttpStatus.BAD_REQUEST);
            }
            if (data.getPassword() == null || data.getPassword().isEmpty()) {
                return new ResponseEntity<>("Please enter your password", HttpStatus.BAD_REQUEST);
            }

            String input = data.getEmail().trim();
            Users user = obj.getinfoByEmail(input);
            if (user == null) {
                user = userRepository.findByUserName(input);
            }
            if (user == null && !input.contains("@")) {
                user = obj.getinfoByEmail(input + "@taskflow.com");
            }
            if (user == null) {
                // Try case-insensitive scan
                List<Users> all = userRepository.findAll();
                for (Users u : all) {
                    if (u.getEmail() != null && u.getEmail().equalsIgnoreCase(input)) {
                        user = u;
                        break;
                    }
                    if (u.getUserName() != null && u.getUserName().equalsIgnoreCase(input)) {
                        user = u;
                        break;
                    }
                }
            }

            if (user == null) {
                return new ResponseEntity<>("User not found. Try your TaskFlow email (e.g. rahul@taskflow.com) or username (e.g. rahul)", HttpStatus.BAD_REQUEST);
            }

            if (!user.getFpassword().equals(HashUtil.hashSHA256(data.getPassword()))) {
                return new ResponseEntity<>("Invalid password. Default demo password is 'password'", HttpStatus.UNAUTHORIZED);
            }

            AuthResponse userdata = new AuthResponse();
            userdata.setName(user.getUserName());
            userdata.setEmail(user.getEmail());
            userdata.setRole(user.getRole());
            userdata.setId(user.getId());
            userdata.setAvatarConfig(user.getAvatarConfig());
            userdata.setToken(obj2.gen_token(user.getEmail(), user.getRole()));
            return new ResponseEntity<>(userdata, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("Login error: " + e.getMessage());
            return new ResponseEntity<>("Login failed: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/oauth-login")
    public ResponseEntity<?> oauthLogin(@RequestBody java.util.Map<String, String> body) {
        try {
            String email = body.get("email");
            String name = body.get("name");
            String provider = body.get("provider"); // "google" or "github"

            if (email == null || email.isBlank()) {
                return new ResponseEntity<>("Email is required", HttpStatus.BAD_REQUEST);
            }
            Users user = obj.getinfoByEmail(email);

            if (user == null) {
                RegisterRequestDto dto = new RegisterRequestDto();
                dto.setEmail(email);
                dto.setName(name != null ? name : email.split("@")[0]);
                String randomPass = java.util.UUID.randomUUID().toString();
                dto.setFirstPassword(randomPass);
                dto.setConfirmPassword(randomPass);
                dto.setRole(com.example.TeamManger.entity.Role.DEVELOPER);
                obj.Register(dto);
                user = obj.getinfoByEmail(email);
            }

            AuthResponse userdata = new AuthResponse();
            userdata.setName(user.getUserName());
            userdata.setEmail(user.getEmail());
            userdata.setRole(user.getRole());
            userdata.setId(user.getId());
            userdata.setAvatarConfig(user.getAvatarConfig());
            userdata.setToken(obj2.gen_token(user.getEmail(), user.getRole()));
            return new ResponseEntity<>(userdata, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>("OAuth login failed: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
