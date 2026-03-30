class Project {
  constructor(id, name, description, ownerId, createdAt = new Date()) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.ownerId = ownerId;
    this.createdAt = createdAt;
  }
}

module.exports = Project;