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

        transitionMatrix.put(IssueStatus.NEW, EnumSet.of(IssueStatus.TRIAGED, IssueStatus.CLOSED));
        transitionMatrix.put(IssueStatus.TRIAGED, EnumSet.of(IssueStatus.ESCALATED, IssueStatus.ASSIGNED, IssueStatus.CLOSED));
        transitionMatrix.put(IssueStatus.ESCALATED, EnumSet.of(IssueStatus.ASSIGNED, IssueStatus.CLOSED));
        transitionMatrix.put(IssueStatus.ASSIGNED, EnumSet.of(IssueStatus.IN_PROGRESS, IssueStatus.CLOSED));
        transitionMatrix.put(IssueStatus.IN_PROGRESS, EnumSet.of(IssueStatus.READY_FOR_QA, IssueStatus.CLOSED));
        transitionMatrix.put(IssueStatus.READY_FOR_QA, EnumSet.of(IssueStatus.RESOLVED, IssueStatus.IN_PROGRESS));
        transitionMatrix.put(IssueStatus.RESOLVED, EnumSet.of(IssueStatus.CLOSED, IssueStatus.REOPENED));
        transitionMatrix.put(IssueStatus.CLOSED, EnumSet.of(IssueStatus.REOPENED));
        transitionMatrix.put(IssueStatus.REOPENED, EnumSet.of(IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS));
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
