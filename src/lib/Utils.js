const $ = require("jquery");

/**
  * A loading spinner manager
  * @author Thomas Noel thomas.c.noel@gmail.com
  * @date April 6, 2024
  */
class LoadingSpinner {
    #spinnerID;
    #buttonID;
    #activated;

    constructor(spinnerID, buttonID) {
        this.#spinnerID = spinnerID;
        this.#buttonID = buttonID;
        this.#activated = false;
    }
    
    on() {
        $(this.#spinnerID).removeClass("hidden");  
        $(this.#buttonID).addClass("button-waiting");
        $(this.#buttonID).removeClass("button-idle");
        this.#activated = true;
    }

    off() {
        $(this.#spinnerID).addClass("hidden");  
        $(this.#buttonID).removeClass("button-waiting");
        $(this.#buttonID).addClass("button-idle");
        this.#activated = false;
    }
   
    get activated() {
        return this.#activated;
    }
}


/**
  * A modal message loader
  * @author Thomas Noel thomas.c.noel@gmail.com
  * @date March 4, 2024
  */
class MessageLoader {
    #messageID;
    #toggledElems;

    constructor(messageID, toggledElems) {
        this.#messageID = messageID;
        this.#toggledElems = toggledElems;
    }

    on() {
        this.#toggledElems.forEach((elem) => {
            $(elem).addClass("hidden");
        });

        $(this.#messageID).removeClass("hidden");
        $(this.#messageID).addClass("status-message");
    }

    off() {
        $(this.#messageID).addClass("hidden");
        $(this.#messageID).removeClass("status-message");

        this.#toggledElems.forEach((elem) => {
            $(elem).removeClass("hidden");
        });
    }
}

module.exports = {
    LoadingSpinner,
    MessageLoader
};
