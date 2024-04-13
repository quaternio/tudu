const _ = require('lodash');
const $ = require('jquery');
const { ProjectModal, TaskModal } = require("./lib/Modals");
const { TuduRenderer } = require("./lib/Renderers");

const html = require('./index.html');

class Task {
  constructor({
    id,
    title, 
    description, 
    dueDate, 
    priority, 
    issuer, 
    issuedTo, 
    category, 
    notes
  } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.issuer = issuer;
    this.issuedTo = issuedTo;
    this.category = category;
    this.notes = notes;
    this.issueDate = new Date();
    this.done = false;

    // Category enumeration
    this.categories = Object.freeze({
      UNSPECIFIED: 0,
      MEETING: 1,
      MAINTENANCE: 2,
      OVERHEAD: 3,
      DEPLOYMENT: 4,
      DEVELOPMENT: 5
    });
  }

  markFinished() {
    this.done = true;
  }

  editPriority(priority) {
    this.priority = priority;
  }

  editNotes(updatedNotes) {
    this.notes = updatedNotes;
  }

  editTitle(newTitle) {
    this.title = newTitle;
  }

  editDescription(newDescription) {
    this.description = newDescription;
  }

  editDueDate(newDate) {
    this.dueDate = newDate;
  }

  editIssuedTo(newIssuedTo) {
    this.issuedTo = newIssuedTo; 
  }

  editCategory(newCategory) {
    valid = false;
    this.categories.forEach((item) => {
      if (newCategory === item) {
        valid = true;
      }
    });

    if (valid) {
      this.category = newCategory;
    }
  }
}


/** Projects contain a bunch of tasks **/
class Project {
  #tasks;
  constructor({
    id,
    title, 
    description, 
    issuedTo, 
    issuer, 
    dueDate, 
    tasks = [], 
    priority = 0
  } = {}) {
    this.#tasks = tasks;
    this.id = id;
    this.priority = priority;
    this.title = title;
    this.description = description;
    this.issuedTo = issuedTo;
    this.issuer = issuer;
    this.dueDate = dueDate;
    this.issueDate = new Date();
    this.done = false;
  }

  addTask(task) {
    this.#tasks.push(task);
  }

  getOrderedTasks() {
    return this.#tasks.sort((a, b) => b.priority - a.priority);
  }

  markFinished() {
    this.done = true;
  }

  /**
    * In case a project is marked complete too soon
    */
  resuscitate() {
    this.done = false;
  }

  editPriority(newPriority) {
    this.priority = newPriority;
  }

  deleteDeadTasks() {
    deadIdxs = [];
    this.#tasks.forEach((elem, idx) => {
      if (elem.done) {
        deadIdxs.push(idx);
      }
    });

    // Want to delete higher indices first
    orderedDeadIdxs = deadIdxs.reverse();
    orderedDeadIdxs.forEach((idx) => {
      this.#tasks.splice(idx, 1);
    });
  }

  // for debugging
  get tasks() {
    return this.#tasks;
  }
}

/** The main application logic; Tudu has a bunch of Project instances and access
  * to the Task and Project Renderers
  **/
class Tudu {
  #projects;

  constructor() {
    this.#projects = {};
    this._tuduRenderer = new TuduRenderer();

    this._nextProjectID = 0;
    this._nextTaskID = {};
    this._projectModal = new ProjectModal("#project-view", "#modal-new-project");
    this._taskModal = new TaskModal("#project-view", "#modal-new-task");

    $(".new-project").on("click", (e) => {
      // Prompt user with project form
      this._projectModal.load(); 
    }); 

    this._tuduRenderer.on("attach_add_ready", (data) => {
      $(data.selector).off().on("click", (e) => {
        // Trigger task modal
        this._taskModal.load(data.id); // TODO
      });
    });
    this._tuduRenderer.on("attach_expand_ready", (data) => {
      $(data.selector).off().on("click", (e) => {
        // Specify the id of the project whose tasks should be rendered
        this._tuduRenderer.renderTasks(data.id, this.#projects[data.id]); // TODO
      });
    });

    this._projectModal.on("project_data_ready", (e) => {
      let projectName = $("#project-name").val();
      let owner = $("#project-owner").val();
      let dueDate = $("#project-due-date").val();
      let priority = $("#project-priority").val();

      if (!projectName || !owner || !dueDate || !priority) { return }

      const project = new Project({
        id: this._nextProjectID, // FIXME HACK
        title: projectName,
        description: "",
        issuedTo: owner,
        issuer: "",
        dueDate: dueDate,
        tasks: [],
        priority: +priority
      });

      this.#projects[this._nextProjectID] = project;
      this._tuduRenderer.renderProjects(this.#projects);

      this._nextTaskID[`project_${project.id}`] = 0;
      this._nextProjectID += 1;
    });

    this._taskModal.on("task_data_ready", (projectID) => {
      let taskName = $("#task-name").val();
      let dueDate = $("#task-due-date").val();
      let priority = $("#task-priority").val();

      if (!taskName || !dueDate || !priority) { return }

      const task = new Task({
        id: this._nextTaskID[`project_${projectID}`], // FIXME HACK
        title: taskName,
        description: "",
        dueDate: dueDate,
        priority: +priority,
        issuer: "",
        issuedTo: "",
        category: 0,
        notes: ""
      });

      this.#projects[projectID].addTask(task);
      console.log("projectID: ", projectID);
      this._tuduRenderer.renderTasks(projectID, this.#projects[projectID]);
      this._nextTaskID[`project_${projectID}`] += 1; 
    });
  }

  // For debugging
  addProject(project) {
    this.#projects[project.id] = project;
    this._nextTaskID[`project_${project.id}`] = 0;
    this._nextProjectID = project.id + 1;
  }
  get projects() {
    return this.#projects;
  }
}

(() => {
  const app = new Tudu();

  const project0 = new Project({
    id: 0,
    title: "PostGIS DB Schema Init.",
    description: "Figure out how to initialize PostGIS docker container with schema",
    issuedTo: "Thomas Noel",
    issuer: "Thomas Noel",
    dueDate: "2024-04-05",
    tasks: [],
    priority: 10
  });
  app.addProject(project0);
  app._tuduRenderer.renderProjects(app.projects);

  const project1 = new Project({
    id: 1,
    title: "Dockerize Slam Manager",
    description: "Write Docker Compose File that Builds Slam Manager",
    issuedTo: "Thomas Noel",
    issuer: "Thomas Noel",
    dueDate: "2024-04-05",
    tasks: [],
    priority: 9
  });
  app.addProject(project1);
  app._tuduRenderer.renderProjects(app.projects);
})();

