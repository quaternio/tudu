import _ from 'lodash';
import $ from 'jQuery';

import html from "./index.html";

function component() {
  const element = document.createElement('div');

  // Lodash, now imported by this script
  element.innerHTML = _.join(['Hello', 'Mr.', 'Webpack'], ' ');

  return element;
}

// document.body.appendChild(component());
