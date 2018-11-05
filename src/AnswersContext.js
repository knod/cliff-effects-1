import React from 'react';
import { cloneDeep } from 'lodash';

import { CLIENT_DEFAULTS } from './utils/CLIENT_DEFAULTS';

let context = {};
context.defaults     = cloneDeep(CLIENT_DEFAULTS);
context.answers      = cloneDeep(CLIENT_DEFAULTS);
context.loaded       = null;
context.load         = (toLoad) => {
  context.loaded = toLoad;
};
context.updateAnswer = (answer) => {
  Object.assign(context.answers, answer);
};

let AnswersContext = React.createContext(context);


export { AnswersContext };
