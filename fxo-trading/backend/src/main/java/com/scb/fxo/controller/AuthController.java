package com.scb.fxo.controller;

import com.scb.fxo.domain.User;
import com.scb.fxo.dto.LoginRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest request) {
        return User.HARDCODED_USERS.stream()
            .filter(u -> u.getId().equals(request.getUserId()))
            .findFirst()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(401).build());
    }
}
