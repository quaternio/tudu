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

  markFinished() {}

  editPriority(priority) {}

  editNotes(updatedNotes) {}

  editTitle(newTitle) {}

  editDescription(newDescription) {}

  editDueDate(newDate) {}

  editIssuedTo(newIssuedTo) {}

  editCategory(newCategory) {}
}

/** Projects contain a bunch of tasks **/
class Project {}

class TaskRenderer {}

/** ProjectRenderers have a bunch of TaskRenderers **/
class ProjectRenderer {}

/** The main application logic; Tudu has a bunch of Project instances **/
class Tudu {}

/** Renders the main application logic; TuduRenderer has a bunch of ProjectRenderers **/
class TuduRenderer {}

