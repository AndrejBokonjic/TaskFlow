const { pool } = require('./database');
const Project = require('../domena/project');

class ProjectRepository {
  async create(project) {
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [project.name, project.description, project.ownerId]
    );
    const r = result.rows[0];
    return new Project(r.id, r.name, r.description, r.owner_id, r.created_at);
  }

  async getById(id) {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!result.rows.length) return null;
    const r = result.rows[0];
    return new Project(r.id, r.name, r.description, r.owner_id, r.created_at);
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
}

module.exports = ProjectRepository;