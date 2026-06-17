package com.issuetracker.backend.service.impl;

import com.issuetracker.backend.domain.entity.Project;
import com.issuetracker.backend.dto.response.ProjectDto;
import com.issuetracker.backend.exception.ResourceNotFoundException;
import com.issuetracker.backend.repository.ProjectRepository;
import com.issuetracker.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;

    @Override
    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return mapToDto(project);
    }

    @Override
    public ProjectDto createProject(String name, String description) {
        if(projectRepository.findByName(name).isPresent()) {
            throw new RuntimeException("Project already exists with name: " + name);
        }
        Project project = Project.builder()
                .name(name)
                .description(description)
                .build();
        project = projectRepository.save(project);
        return mapToDto(project);
    }

    private ProjectDto mapToDto(Project project) {
        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .createdAt(project.getCreatedAt())
                .build();
    }
}
