const $ = require("jquery");
const EventEmitter = require("events").EventEmitter;

/** ProjectRenderers have a bunch of TaskRenderers **/
class ProjectRenderer extends EventEmitter {
  constructor() {
    super();
  }

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

    let selector = "." + class_id.split(' ')[0];

    this.emit("checkbox_attached", {
      selector: selector
    });
  }

  render(project) {
    $("#project-view").append(`<div class="container-project-${project.id} pl-[1rem]"></div>`);
    const projectElem = $(`.container-project-${project.id}`);

    const projectClasses = [
      'grid',
      'grid-cols-7',
      'justify-items-start',
      'm-[0.25rem]',
      'bg-red-400',
      'text-white',
      'rounded-md'
    ];
    projectElem.addClass(projectClasses);

    projectElem.append(`
      <button title="Show Project Tasks" class="project-${project.id}-expand justify-self-center pl-[0.75rem]">
        <span class="material-symbols-outlined">arrow_drop_down</span>
      </button>
    `);
    projectElem.append(`
      <button title="Add Task to Project" class="project-${project.id}-add justify-self-center pr-[0.75rem]">
        <span class="material-symbols-outlined">add</span> 
      </button>
    `);
    this._add_div(projectElem, `project-${project.id}-title`, `${project.title}`);
    this._add_div(projectElem, `project-${project.id}-owner`, `${project.issuedTo}`);
    this._add_div(projectElem, `project-${project.id}-due-date`, `${project.dueDate}`);
    this._add_div(projectElem, `project-${project.id}-priority`, `${project.priority}`);

    this._add_checkbox(projectElem, `checkbox-project-${project.id}-done ml-[0.75rem]`, project.done);
    projectElem.append(`
      <button title="Delete Project" class="project-${project.id}-delete justify-self-center mr-[0.75rem]">
        <span class="material-symbols-outlined">delete</span>
      </button>`);

    this.emit("attach_expand_ready", {
      id: project.id, 
      selector: `.project-${project.id}-expand`,
      project: project
    }); 
    this.emit("attach_add_ready", {
      id: project.id, 
      selector: `.project-${project.id}-add`
    });
    this.emit("attach_project_delete_ready", {
      id: project.id,
      selector: `.container-project-${project.id}`,
      button_selector: `.project-${project.id}-delete`
    });

    //$(`.project-${project.id}-delete`).on("click", (e) => {
    //  projectElem.remove();
    //});
  }
}

class TaskRenderer extends EventEmitter {
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

    let selector = "." + class_id.split(' ')[0];

    this.emit("checkbox_attached", {
      selector: selector
    });
  }

  render(projectID, task) {
    // Create tas
    $(`<div id="project-task-view-${projectID}-${task.id}" class="ml-[1rem]"></div>`).insertAfter(`.container-project-${projectID}`);
    $(`#project-task-view-${projectID}-${task.id}`).append(`<div class="container-project-task-${projectID}-${task.id} bg-red-300"></div>`);

    const taskElem = $(`.container-project-task-${projectID}-${task.id}`);

    const taskClasses = [
      'grid',
      'grid-cols-7', // Title, Due Date, Priority, Done, Delete
      'justify-items-start',
      'm-[0.25rem]',
      'bg-red-300',
      'text-white',
      'rounded-md'
    ];
    taskElem.addClass(taskClasses);

    taskElem.append(`<div class="spacer"></div>`);
    taskElem.append(`<div class="spacer"></div>`);
    this._add_div(taskElem, `task-${task.id}-title`, `${task.title}`);
    this._add_div(taskElem, `task-${task.id}-owner`, `${task.issuedTo}`);
    this._add_div(taskElem, `task-${task.id}-due-date`, `${task.dueDate}`);
    this._add_div(taskElem, `task-${task.id}-priority`, `${task.priority}`);

    this._add_checkbox(taskElem, `checkbox-project-task-${projectID}-${task.id}-done ml-[0.75rem]`, task.done);
    taskElem.append(`
      <button title="Delete Task" class="task-${task.id}-delete justify-self-center mr-[0.75rem]">
        <span class="material-symbols-outlined">delete</span>
      </button>
    `);

    this.emit("attach_task_delete_ready", {
      project_id: projectID,
      task_id: task.id,
      selector: `.container-project-task-${projectID}-${task.id}`,
      button_selector: `.task-${task.id}-delete`
    });
    

    //$(`.task-${task.id}-delete`).on("click", (e) => {
    //  taskElem.remove();
    //});
    
  }
}

/** Renders the main application logic; TuduRenderer has a bunch of ProjectRenderers **/
class TuduRenderer extends EventEmitter {
  constructor() {
    super();
    this.projectRenderer = new ProjectRenderer();
    this.taskRenderer = new TaskRenderer();
  } 

  clearProjects() {
    $(`div[class^="container-project-"]`).remove();
  }

  clearTasks() {
    //$(`div[class^="container-task-"]`).remove();
    $(`div[id^="project-task-view-"]`).remove();
  }

  clearTasksByProject(projectID) {
    $(`div[id^="project-task-view-${projectID}"]`).remove();

    $(`.project-${projectID}-expand`).empty();
    $(`.project-${projectID}-expand`).append(`
      <span class="material-symbols-outlined">
        arrow_drop_down
      </span>
    `);
  }

  triggerAttachExpandReady(projectID) {
    this.emit("attach_expand_ready", {
      id: projectID, 
      selector: `.project-${projectID}-expand`
      // project: project
    }); 
  }

  getOrderedProjects(projects) {
    let projArray = [];
    for (const id in projects) {
      projArray.push(projects[id]); 
    }

    return projArray.sort((a,b) => b.priority - a.priority);
  }

  renderProjects(projects) {
    this.clearProjects();

    // sort in descending order of priority
    let orderedProjects = this.getOrderedProjects(projects);
    for (const project of orderedProjects) {
      this.projectRenderer.on("attach_expand_ready", (data) => {
        this.emit("attach_expand_ready", data);
      });
      this.projectRenderer.on("attach_add_ready", (data) => {
        this.emit("attach_add_ready", data);
      });
      this.projectRenderer.on("attach_project_delete_ready", (data) => {
        this.emit("attach_project_delete_ready", data);
      });
      this.projectRenderer.on("checkbox_attached", (data) => {
        this.emit("checkbox_attached", data);
      });
      this.projectRenderer.render(project); 
    }

    $("#project-info-form").trigger("reset");
  }

  renderTasks(projectID, project) {
    this.clearTasksByProject(projectID);

    let tasks = project.getOrderedTasks();
    for (const task of tasks) {
      this.taskRenderer.on("attach_task_delete_ready", (data) => {
        this.emit("attach_task_delete_ready", data);
      });
      this.projectRenderer.on("checkbox_attached", (data) => {
        this.emit("checkbox_attached", data);
      });
      this.taskRenderer.render(projectID, task);
    }

    // Alter expand button
    $(`.project-${projectID}-expand`).empty();
    $(`.project-${projectID}-expand`).append(`
      <span class="material-symbols-outlined">
        arrow_drop_up
      </span>
    `);

    this.emit("attach_contract_ready", {
      id: projectID, 
      selector: `.project-${projectID}-expand`
    });

    $("#task-info-form").trigger("reset");
  }
}

module.exports = {
  ProjectRenderer,
  TaskRenderer,
  TuduRenderer
}
