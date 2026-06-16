package com.issuetracker.backend.statemachine;

public class StateTransitionException extends RuntimeException {
    public StateTransitionException(String message) {
        super(message);
    }
}
