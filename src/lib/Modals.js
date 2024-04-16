const { LoadingSpinner, MessageLoader } = require("./Utils");
const $ = require("jquery");
const EventEmitter = require("events").EventEmitter;

/**
 * New Project Modal
 *
 * Show a modal where a new project can be ingested
 *
 * @author Thomas Noel thomas.c.noel@gmail.com
 * @date April, 2024
 */
class ProjectModal extends EventEmitter {
    
    /**
    * @param {object} container CSS selector of the outer container
    * @param {object} id CSS selector of modal container
    */
    constructor(container, id) {
        super();
        this._container = container;
        this._id = id;
    }

    /**
     * Load and configure the modal
     */
    async load() {
        // In case a project has already been submitted in this session
        $("#project-submit").prop("disabled", false);

        $(this._id).css({"display": "block"});
        $(this._container).addClass("blurred");

        $("#header-new-project").html(`<div class="justify-self-center">Project Info</div>`);

        // If the cancel button is clicked, shut 'er down
        $("#project-cancel").on("click", () => {
            $(this._container).removeClass("blurred");
            this.close();
        });

        $("#project-submit").off().on("click", () => { 
            // disable button so there's only one submission
            $("#project-submit").prop("disabled", true);
            this.on_submission();
        });
    }

    async on_submission() {
        const spinner = new LoadingSpinner("#spinner-project-submit", "#project-submit");

        // Activate spinner
        spinner.on();

        const finish = async () => {
            // Turn off spinner
            spinner.off();

            // Unblur map view
            $(this._container).removeClass("blurred");
            this.close();

            this.emit("project_data_ready");
        }
        
        // So that spinner is perceptible
        setTimeout(finish, 500);
    }

    close()
    {
        $(this._id).css({"display": "none"});
    }
}

/**
 * New Task Modal
 *
 * Show a modal where a new task can be ingested
 *
 * @author Thomas Noel thomas.c.noel@gmail.com
 * @date April, 2024
 */
class TaskModal extends EventEmitter {
    
    /**
    * @param {object} container CSS selector of the outer container
    * @param {object} id CSS selector of modal container
    */
    constructor(container, id) {
        super();
        this._container = container;
        this._id = id;
    }

    /**
     * Load and configure the modal
     */
    async load(project_id) {
        // In case a task has already been submitted in this session
        $("#task-submit").prop("disabled", false);

        $(this._id).css({"display": "block"});
        $(this._container).addClass("blurred");

        $("#header-new-task").html(`<div class="justify-self-center">Task Info</div>`);

        // If the cancel button is clicked, shut 'er down
        $("#task-cancel").on("click", () => {
            $(this._container).removeClass("blurred");
            this.close();
        });

        $("#task-submit").off().on("click", () => { 
            console.log("TASK SBMTTTTED");
            // disable button so there's only one submission
            $("#task-submit").prop("disabled", true);
            this.on_submission(project_id);
        });
    }

    async on_submission(project_id) {
        const spinner = new LoadingSpinner("#spinner-task-submit", "#task-submit");

        // Activate spinner
        spinner.on();

        const finish = async () => {
            // Turn off spinner
            spinner.off();

            // Unblur map view
            $(this._container).removeClass("blurred");
            this.close();

            this.emit("task_data_ready", project_id);
        }
        
        // So that spinner is perceptible
        setTimeout(finish, 500);
    }

    close()
    {
        $(this._id).css({"display": "none"});
    }
}

module.exports = {
    ProjectModal,
    TaskModal
};
