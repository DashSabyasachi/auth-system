package com.example.auth.dto;

import java.util.Map;

public record ApiError(String message, Map<String, String> fieldErrors) {
}
