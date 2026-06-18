package com.scb.fxo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String id;
    private String name;
    private String role;
}
