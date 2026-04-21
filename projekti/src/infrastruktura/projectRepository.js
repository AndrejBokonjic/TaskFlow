const { pool } = require('./database');
const Project = require('../domena/project');

class ProjectRepository {
  async create(project) {
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [project.name, project.description, project.ownerId]
    );
    const r = result.rows[0];
    const p = new Project(r.id, r.name, r.description, r.owner_id, r.created_at);
    await this.addMember(p.id, p.ownerId, 'owner');
    return p;
  }

  async getById(id) {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!result.rows.length) return null;
    const r = result.rows[0];
    const p = new Project(r.id, r.name, r.description, r.owner_id, r.created_at);
    p.members = await this.getMembers(id);
    return p;
  }

  async getAll() {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    return result.rows.map(r => new Project(r.id, r.name, r.description, r.owner_id, r.created_at));
  }

  async update(id, name, description) {
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    if (!result.rows.length) return null;
    const r = result.rows[0];
    return new Project(r.id, r.name, r.description, r.owner_id, r.created_at);
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }

  async addMember(projectId, userId, role = 'member') {
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3`,
      [projectId, userId, role]
    );
  }

  async removeMember(projectId, userId) {
    const result = await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *',
      [projectId, userId]
    );
    return result.rows.length > 0;
  }

  async getMembers(projectId) {
    const result = await pool.query(
      'SELECT user_id, role, added_at FROM project_members WHERE project_id = $1 ORDER BY added_at',
      [projectId]
    );
    return result.rows;
  }

  async getByMember(userId) {
    const result = await pool.query(
      `SELECT p.* FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1 ORDER BY p.created_at DESC`,
      [userId]
    );
    return result.rows.map(r => new Project(r.id, r.name, r.description, r.owner_id, r.created_at));
  }
}

module.exports = ProjectRepository;
