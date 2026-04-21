const express = require('express');
const router = express.Router();
const c = require('./projectController');

router.get('/projects', c.listProjects);
router.post('/projects', c.createProject);
router.get('/projects/:id', c.getProject);
router.put('/projects/:id', c.updateProject);
router.delete('/projects/:id', c.deleteProject);
router.get('/projects/:id/tasks', c.getProjectTasks);
router.post('/projects/:id/members', c.addMember);
router.delete('/projects/:id/members/:userId', c.removeMember);

module.exports = router;
