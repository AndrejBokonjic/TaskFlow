const { publishEvent } = require('../infrastruktura/messageBroker');
const logger = require('../logger');
const axios = require('axios');

const NALOGE_URL = process.env.NALOGE_URL || 'http://localhost:5001';
const UPORABNIKI_URL = process.env.UPORABNIKI_URL || 'http://localhost:8000';

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
    return this.repo.getAll();
  }

  async listProjectsByMember(userId) {
    return this.repo.getByMember(userId);
  }

  async updateProject(id, name, description) {
    const project = await this.repo.update(id, name, description);
    if (project) {
      publishEvent('PROJECT_UPDATED', project);
    }
    return project;
  }

  async deleteProject(id) {
    const deleted = await this.repo.delete(id);
    if (deleted) {
      publishEvent('PROJECT_DELETED', { id });
    }
    return deleted;
  }

  async addMember(projectId, userId, role = 'member') {
    const project = await this.repo.getById(projectId);
    if (!project) return null;
    try {
      await axios.get(`${UPORABNIKI_URL}/users/${userId}`);
    } catch {
      logger.warn(`User ${userId} not found in uporabniki service`);
      return null;
    }
    await this.repo.addMember(projectId, userId, role);
    logger.info(`Added user ${userId} to project ${projectId} as ${role}`);
    publishEvent('PROJECT_MEMBER_ADDED', { projectId, userId, role });
    return this.repo.getById(projectId);
  }

  async removeMember(projectId, userId) {
    const removed = await this.repo.removeMember(projectId, userId);
    if (removed) {
      publishEvent('PROJECT_MEMBER_REMOVED', { projectId, userId });
    }
    return removed;
  }

  async getProjectTasks(projectId) {
    try {
      const response = await axios.get(`${NALOGE_URL}/tasks?project_id=${projectId}`);
      return response.data;
    } catch (err) {
      logger.error(`Failed to fetch tasks: ${err.message}`);
      return [];
    }
  }
}

module.exports = ProjectService;
