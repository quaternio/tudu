import _ from 'lodash';
import $ from 'jQuery';

import html from "./index.html";

class Task {
  constructor({
    title, 
    description, 
    dueDate, 
    priority, 
    issuer, 
    issuedTo, 
    category, 
    notes
  } = {}) {
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
    title, 
    description, 
    issuedTo, 
    issuer, 
    dueDate, 
    tasks = [], 
    priority = 0
  } = {}) {
    this.#tasks = tasks;
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

/** The main application logic; Tudu has a bunch of Project instances **/
class Tudu {}

class TaskRenderer {}

/** ProjectRenderers have a bunch of TaskRenderers **/
class ProjectRenderer {}

/** Renders the main application logic; TuduRenderer has a bunch of ProjectRenderers **/
class TuduRenderer {}

