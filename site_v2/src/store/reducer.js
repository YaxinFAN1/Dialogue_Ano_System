import { combineReducers } from "redux";
import { reducer as loginReducer } from '../Login/store';
import { reducer as corpusReducer } from '../Users/CMGT/store';
import { reducer as userReducer } from '../Users/UMGT/store';
import { reducer as taskReducer } from '../Users/TMGT/store';
import { reducer as myReducer } from '../Users/Mytask/store';

const appReducer = combineReducers({
  login: loginReducer, //登录
  corpus: corpusReducer, //熟语料展示和管理
  user: userReducer, //用户管理
  task: taskReducer, //任务管理
  mine: myReducer, //我的任务
});

const rootReducer = (state, action) => {
  if (action.type === 'reset_app') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
