const { publishEvent } = require('../infrastruktura/messageBroker');
const logger = require('../logger');
const axios = require('axios');

const NALOGE_URL = process.env.NALOGE_URL || 'http://localhost:5001';

class ProjectService {
  constructor(repo) {
    this.repo = repo;
  }

  async createProject(name, description, ownerId) {
    const project = await this.repo.create({ name, description, ownerId });
    logger.info(`Project created: ${project.id}`);
    publishEvent('PROJECT_CREATED', project);
    return project;
  }

  async getProject(id) {
    const project = await this.repo.getById(id);
    if (!project) logger.warn(`Project not found: ${id}`);
    return project;
  }

  async listProjects() {
    const projects = await this.repo.getAll();
    logger.info(`Listed ${projects.length} projects`);
    return projects;
  }

  async updateProject(id, name, description) {
    const project = await this.repo.update(id, name, description);
    if (project) {
      logger.info(`Project updated: ${id}`);
      publishEvent('PROJECT_UPDATED', project);
    }
    return project;
  }

  async deleteProject(id) {
    const deleted = await this.repo.delete(id);
    if (deleted) {
      logger.info(`Project deleted: ${id}`);
      publishEvent('PROJECT_DELETED', { id });
    }
    return deleted;
  }

  async getProjectTasks(projectId) {
    try {
      const response = await axios.get(`${NALOGE_URL}/tasks`);
      const tasks = response.data.filter(t => t.project_id === parseInt(projectId));
      logger.info(`Fetched tasks for project ${projectId}`);
      return tasks;
    } catch (err) {
      logger.error(`Failed to fetch tasks from naloge: ${err.message}`);
      return [];
    }
  }
}

module.exports = ProjectService;