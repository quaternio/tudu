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
    notes,
    issueDate = new Date(),
    done = false
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
    this.issueDate = issueDate;
    this.done = done;

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

  serialize() {
    return {
      id: this.id,
      title: this.title || "",
      description: this.description || "",
      dueDate: this.dueDate,
      priority: this.priority || 0,
      issuer: this.issuer || "",
      issuedTo: this.issuedTo || "",
      category: this.category || this.categories.UNSPECIFIED,
      notes: this.notes || "",
      issueDate: this.issueDate,
      done: this.done
    };
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
    tasks = {}, 
    priority = 0,
    issueDate = new Date(),
    done = false
  } = {}) {
    this.#tasks = {}; //tasks;
    if (tasks) {
      for (const tid in tasks) {
        this.#tasks[tid] = new Task(tasks[tid]);
      }   
    }

    this.id = id;
    this.priority = priority;
    this.title = title;
    this.description = description;
    this.issuedTo = issuedTo;
    this.issuer = issuer;
    this.dueDate = dueDate;
    this.issueDate = issueDate;
    this.done = done;
  }

  serialize() {
    let serialTasks = {};
    for (const tid in this.#tasks) {
      serialTasks[tid] = this.#tasks[tid].serialize();
    }

    return {
      tasks: serialTasks,
      id: this.id,
      priority: this.priority || 0,
      title: this.title || "",
      description: this.description || "",
      issuedTo: this.issuedTo || "",
      issuer: this.issuer || "",
      dueDate: this.dueDate,
      issueDate: this.issueDate,
      done: this.done
    };
  }

  addTask(task, taskID) {
    this.#tasks[taskID] = task;
  }

  deleteTask(taskID) {
    delete this.#tasks[taskID];
  }

  getOrderedTasks() {
    let taskArray = [];
    for (const id in this.#tasks) {
      taskArray.push(this.#tasks[id]); 
    }

    return taskArray.sort((a,b) => a.priority - b.priority);
  }

  markFinished() {
    this.done = true;
  }
}

/** The main application logic; Tudu has a bunch of Project instances and access
  * to the Task and Project Renderers
  **/
class Tudu {
  #projects;

  constructor({projects, nextProjectID, nextTaskID} = {}) {
    this._tuduRenderer = new TuduRenderer();

    this.#projects = {};
    if (projects) {
      // rehydrate
      for (const pid in projects) {
        this.#projects[pid] = new Project(projects[pid]);
      } 
    }

    this._nextProjectID = nextProjectID || 0;
    this._nextTaskID = nextTaskID || {};
    this._projectModal = new ProjectModal("#project-view", "#modal-new-project");
    this._taskModal = new TaskModal("#project-view", "#modal-new-task");

    $(".new-project").on("click", (e) => {
      // Prompt user with project form
      this._projectModal.load(); 
    }); 

    this._tuduRenderer.on("attach_add_ready", (data) => {
      $(data.selector).off().on("click", (e) => {
        // Trigger task modal
        this._taskModal.load(data.id);
      });
    });
    this._tuduRenderer.on("attach_expand_ready", (data) => {
      $(data.selector).off().on("click", (e) => {
        // Specify the id of the project whose tasks should be rendered
        this._tuduRenderer.renderTasks(data.id, this.#projects[data.id]); // TODO
      });
    });
    this._tuduRenderer.on("attach_contract_ready", (data) => {
      $(data.selector).off().on("click", (e) => {
        this._tuduRenderer.clearTasksByProject(data.id);
        
        this._tuduRenderer.triggerAttachExpandReady(data.id);
      });
    });
    this._tuduRenderer.on("attach_project_delete_ready", (data) => {
      //id: project.id,
      //selector: `.project-${project.id}-add`
      $(data.button_selector).off().on("click", (e) => {
        $(data.selector).remove();
        $(`[class^="container-project-task-${data.id}-"]`).remove();
        
        // Remove project from Tudu list
        delete this.#projects[data.id];
        
        // Save
        window.localStorage.setItem("app", JSON.stringify(this.serialize()));
      });
    });
    this._tuduRenderer.on("attach_task_delete_ready", (data) => {
      //project_id: projectID,
      //task_id: task.id,
      //selector: `.container-project-task-${projectID}-${task.id}`
      $(data.button_selector).off().on("click", (e) => {
        $(data.selector).remove();

        // Remove the task from its project
        this.#projects[data.project_id].deleteTask(data.task_id);

        // Save
        window.localStorage.setItem("app", JSON.stringify(this.serialize()));
      });
    });
    this._tuduRenderer.on("checkbox_attached", (data) => {
        $(data.selector).change((e) => {
          // Save
          window.localStorage.setItem("app", JSON.stringify(this.serialize()));
        });
    });
      
    this._projectModal.on("project_data_ready", (e) => {
      this._tuduRenderer.clearTasks();

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

      // Save
      window.localStorage.setItem("app", JSON.stringify(this.serialize()));
    });

    this._taskModal.on("task_data_ready", (projectID) => {
      let taskName = $("#task-name").val();
      let dueDate = $("#task-due-date").val();
      let priority = $("#task-priority").val();

      if (!taskName || !dueDate || !priority) { return }

      let newTaskID = this._nextTaskID[`project_${projectID}`];

      const task = new Task({
        id: newTaskID,
        title: taskName,
        description: "",
        dueDate: dueDate,
        priority: +priority,
        issuer: "",
        issuedTo: "",
        category: 0,
        notes: ""
      });

      this.#projects[projectID].addTask(task, newTaskID);
      this._tuduRenderer.renderTasks(projectID, this.#projects[projectID]);
      this._nextTaskID[`project_${projectID}`] += 1; 

      // Save
      window.localStorage.setItem("app", JSON.stringify(this.serialize()));
    });

    // Render projects
    this._tuduRenderer.renderProjects(this.#projects);
  }

  serialize() {
    let projectsSerial = {};
    for (const pid in this.#projects) {
      projectsSerial[pid] = this.#projects[pid].serialize();
    }

    return {
      projects: projectsSerial,
      nextProjectID: this._nextProjectID,
      nextTaskID: this._nextTaskID
    };
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
  const app_state = JSON.parse(window.localStorage.getItem("app"));
  const app = new Tudu(app_state ?? {});
})();

