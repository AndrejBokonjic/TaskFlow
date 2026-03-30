const ProjectService = require('../src/aplikacija/projectService');

const mockRepo = {
  create: jest.fn(p => Promise.resolve({ id: 1, ...p })),
  getById: jest.fn(id => Promise.resolve(id == 1 ? { id: 1, name: 'Test', description: 'Desc', ownerId: 1 } : null)),
  getAll: jest.fn(() => Promise.resolve([{ id: 1, name: 'Test' }])),
  update: jest.fn((id, name, description) => Promise.resolve({ id, name, description })),
  delete: jest.fn(id => Promise.resolve(true)),
};

// Mock broker so tests don't need ActiveMQ
jest.mock('../src/infrastruktura/messageBroker', () => ({
  publishEvent: jest.fn(),
}));

const service = new ProjectService(mockRepo);

test('createProject returns project with id', async () => {
  const project = await service.createProject('Test', 'Desc', 1);
  expect(project.id).toBe(1);
  expect(project.name).toBe('Test');
});

test('getProject returns null for unknown id', async () => {
  const project = await service.getProject(999);
  expect(project).toBeNull();
});

test('listProjects returns array', async () => {
  const projects = await service.listProjects();
  expect(Array.isArray(projects)).toBe(true);
});

test('updateProject returns updated project', async () => {
  const project = await service.updateProject(1, 'New Name', 'New Desc');
  expect(project.name).toBe('New Name');
});

test('deleteProject returns true', async () => {
  const result = await service.deleteProject(1);
  expect(result).toBe(true);
});