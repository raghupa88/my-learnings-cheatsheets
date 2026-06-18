package com.scb.fxo.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class User {
    private String id;
    private String name;
    private String role;

    public static final List<User> HARDCODED_USERS = List.of(
        new User("U001", "Alice Chen", "SALES"),
        new User("U002", "Bob Kumar", "TRADER"),
        new User("U003", "Carol White", "OPERATIONS"),
        new User("U004", "David Park", "RISK")
    );
}
