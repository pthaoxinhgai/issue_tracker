package com.issuetracker.backend.statemachine;

import com.issuetracker.backend.domain.enums.IssueStatus;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class IssueStateMachine {

    private final Map<IssueStatus, Set<IssueStatus>> transitionMatrix;

    public IssueStateMachine() {
        transitionMatrix = new EnumMap<>(IssueStatus.class);

        transitionMatrix.put(IssueStatus.OPEN, EnumSet.of(IssueStatus.IN_PROGRESS, IssueStatus.CLOSED));
        transitionMatrix.put(IssueStatus.IN_PROGRESS, EnumSet.of(IssueStatus.REVIEW, IssueStatus.DONE, IssueStatus.CLOSED));
        transitionMatrix.put(IssueStatus.REVIEW, EnumSet.of(IssueStatus.IN_PROGRESS, IssueStatus.DONE, IssueStatus.CLOSED));
        transitionMatrix.put(IssueStatus.DONE, EnumSet.of(IssueStatus.REOPENED, IssueStatus.CLOSED));
        transitionMatrix.put(IssueStatus.REOPENED, EnumSet.of(IssueStatus.IN_PROGRESS, IssueStatus.CLOSED));
        transitionMatrix.put(IssueStatus.CLOSED, EnumSet.of(IssueStatus.REOPENED));
    }

    public void validateTransition(IssueStatus currentStatus, IssueStatus newStatus) {
        if (currentStatus == newStatus) {
            return; // No transition
        }

        Set<IssueStatus> allowedTransitions = transitionMatrix.get(currentStatus);
        if (allowedTransitions == null || !allowedTransitions.contains(newStatus)) {
            throw new StateTransitionException("Invalid transition from " + currentStatus + " to " + newStatus);
        }
    }
}
