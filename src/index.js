const _ = require('lodash');
const $ = require('jquery');

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
      DEVELOPMENT: 0,
      MEETING: 1,
      MAINTENANCE: 2,
      OVERHEAD: 3,
      DEPLOYMENT: 4
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
    this.#tasks.append(task);
  }

  getOrderedTasks() {
    return this.#tasks.toSorted((a, b) => a.priority - b.priority);
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
        deadIdxs.append(idx);
      }
    });

    // Want to delete higher indices first
    orderedDeadIdxs = deadIdxs.reverse();
    orderedDeadIdxs.forEach((idx) => {
      this.#tasks.splice(idx, 1);
    });
  }
}

/** ProjectRenderers have a bunch of TaskRenderers **/
class ProjectRenderer {
  _add_div(parent, class_id, text) {
    parent.append(`
      <div class="${class_id}">
        ${text}
      </div>
    `);

    return $(`.${class_id}`);
  }

  _add_checkbox(parent, class_id, is_checked) {
    let checked = is_checked ? " checked" : "";
    parent.append(`<input type=checkbox class="${class_id}"${checked}>`);
  }

  _add_button_material() {}

  render(project) {
    $(".project-view").append(`<div class="container-project-${project.id}"></div>`);
    const projectElem = $(`.container-project-${project.id}`);

    const projectClasses = [
      'grid',
      'grid-cols-7',
      'justify-items-start',
      'm-[0.25rem]',
      'bg-teal-500',
      'text-white',
      'rounded-md'
    ];
    projectElem.addClass(projectClasses);

    projectElem.append(`<button class="project-${project.id}-expand justify-self-center">+</div>`);
    this._add_div(projectElem, `project-${project.id}-title`, `${project.title}`);
    this._add_div(projectElem, `project-${project.id}-owner`, `${project.issuedTo}`);
    this._add_div(projectElem, `project-${project.id}-due-date`, `${project.dueDate.toLocaleDateString()}`);
    this._add_div(projectElem, `project-${project.id}-priority`, `${project.priority}`);

    this._add_checkbox(projectElem, `project-${project.id}-done ml-[0.75rem]`, project.done);
    projectElem.append(`<button class="project-${project.id}-expand justify-self-center">...</div>`);

    //*********** TODO: Make buttons responsive *****************//

    // TODO: Add these divs inside of projectElem
    // 1) [X] "Expand" button ([ ] "plus" material design icon)
    // 2) [X] project.title = title;
    // 3) project.issuedTo = issuedTo;
    // 4) project.dueDate = dueDate;
    // 5) project.priority = priority;
    // 6) project.done = false;
    // 7) "More" button ("vertical ellipses" material design icon)
    //        -> project.description = description;
    //        -> project.issuer = issuer;
    //        -> project.issueDate = new Date();
  }
}

class TaskRenderer {
  static render() {}
}

/** Renders the main application logic; TuduRenderer has a bunch of ProjectRenderers **/
class TuduRenderer {
  constructor() {
    this.projectRenderer = new ProjectRenderer();
  } 

  renderProjects(projects) {
    for (const project of projects) {
      this.projectRenderer.render(project); 
    }
  }
}


/** The main application logic; Tudu has a bunch of Project instances and access
  * to the Task and Project Renderers
  **/
class Tudu {}

(() => {
  projRenderer = new ProjectRenderer();
  const project0 = new Project({
    id: 0,
    title: "PostGIS DB Schema Init.",
    description: "Figure out how to initialize PostGIS docker container with schema",
    issuedTo: "Thomas Noel",
    issuer: "Thomas Noel",
    dueDate: new Date(),
    tasks: [],
    priority: 10
  });

  projRenderer.render(project0);

  const project1 = new Project({
    id: 1,
    title: "Dockerize Slam Manager",
    description: "Write Docker Compose File that Builds Slam Manager",
    issuedTo: "Thomas Noel",
    issuer: "Thomas Noel",
    dueDate: new Date(),
    tasks: [],
    priority: 9
  });

  projRenderer.render(project1);
})();

