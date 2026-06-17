package com.issuetracker.backend.service;

import com.issuetracker.backend.dto.response.ProjectDto;
import java.util.List;

public interface ProjectService {
    List<ProjectDto> getAllProjects();
    ProjectDto getProjectById(Long id);
    ProjectDto createProject(String name, String description);
}
