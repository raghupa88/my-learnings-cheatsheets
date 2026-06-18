package com.scb.fxo.controller;

import com.scb.fxo.domain.User;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public List<User> getUsers() {
        return User.HARDCODED_USERS;
    }
}
