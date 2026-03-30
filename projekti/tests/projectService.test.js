const ProjectService = require('../src/aplikacija/projectService');
const { publishEvent } = require('../src/infrastruktura/messageBroker');

const mockRepo = {
  create: jest.fn(p => Promise.resolve({ id: 1, ...p })),
  getById: jest.fn(id => Promise.resolve(id == 1 ? { id: 1, name: 'Test', description: 'Desc', ownerId: 1 } : null)),
  getAll: jest.fn(() => Promise.resolve([{ id: 1, name: 'Test' }])),
  update: jest.fn((id, name, description) => Promise.resolve({ id, name, description })),
  delete: jest.fn(id => Promise.resolve(true)),
};

jest.mock('../src/infrastruktura/messageBroker', () => ({
  publishEvent: jest.fn(),
}));

const service = new ProjectService(mockRepo);

beforeEach(() => {
  jest.clearAllMocks();
});

test('createProject returns project with id', async () => {
  const project = await service.createProject('Test', 'Desc', 1);
  expect(project.id).toBe(1);
  expect(project.name).toBe('Test');
});

test('createProject publishes PROJECT_CREATED event', async () => {
  await service.createProject('Test', 'Desc', 1);
  expect(publishEvent).toHaveBeenCalledWith('PROJECT_CREATED', expect.objectContaining({ name: 'Test' }));
});

test('updateProject publishes PROJECT_UPDATED event', async () => {
  await service.updateProject(1, 'New Name', 'New Desc');
  expect(publishEvent).toHaveBeenCalledWith('PROJECT_UPDATED', expect.objectContaining({ name: 'New Name' }));
});

test('deleteProject publishes PROJECT_DELETED event', async () => {
  await service.deleteProject(1);
  expect(publishEvent).toHaveBeenCalledWith('PROJECT_DELETED', { id: 1 });
});

test('getProject returns null for unknown id', async () => {
  const project = await service.getProject(999);
  expect(project).toBeNull();
});

test('listProjects returns array', async () => {
  const projects = await service.listProjects();
  expect(Array.isArray(projects)).toBe(true);
});

test('deleteProject returns true', async () => {
  const result = await service.deleteProject(1);
  expect(result).toBe(true);
});