const ProjectRepository = require('../infrastruktura/projectRepository');
const ProjectService = require('../aplikacija/projectService');
const logger = require('../logger');

const service = new ProjectService(new ProjectRepository());

const createProject = async (req, res) => {
  try {
    const { name, description, owner_id } = req.body;
    const project = await service.createProject(name, description, owner_id);
    res.status(201).json(project);
  } catch (err) {
    logger.error(`createProject error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await service.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listProjects = async (req, res) => {
  try {
    const { user_id } = req.query;
    const projects = user_id
      ? await service.listProjectsByMember(user_id)
      : await service.listProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await service.updateProject(req.params.id, name, description);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const deleted = await service.deleteProject(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const tasks = await service.getProjectTasks(req.params.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { user_id, role } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    const project = await service.addMember(req.params.id, user_id, role || 'member');
    if (!project) return res.status(404).json({ error: 'Project or user not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const removed = await service.removeMember(req.params.id, req.params.userId);
    if (!removed) return res.status(404).json({ error: 'Member not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createProject, getProject, listProjects, updateProject, deleteProject, getProjectTasks, addMember, removeMember };
