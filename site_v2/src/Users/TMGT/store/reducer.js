const defaultState = {
  taskList: [], //任务列表
  taskFileList: [], //当前任务包含的所有文件列表
  currentTaskFile: {
    filename: "未知文件名",
    targetname: "未知入库ID",
    taskname: "未知任务",
    schedule: 0, //0是未标注，1是未审核，2是已完成
    auditor: "未知审核员",
    annotators: ["未知标注员"],
    creator: "未知创建人",
    time: null,
    content: null,
  }, //当前任务包含的当前文件
  currentPage: 1, //当前页
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'getTaskList':
      return Object.assign({},state,{taskList: [...action.value]});
    case 'getTaskProps': {
      let _state = {...state}; //先做一份浅拷贝
      let ttaskList = JSON.stringify(_state.taskList);
      for(let i=0; i<action.value.length; i++){
        let actionData = JSON.stringify(action.value[i]);
        //定义要替换的字符串
        let re = new RegExp("{\"key\":" + JSON.stringify(action.value[i].key) + "[^}]+}}");
        ttaskList = ttaskList.replace(re,actionData);
      }
      let new_taskList =  JSON.parse("{\"taskList\":" + ttaskList + "}").taskList;
      return Object.assign({},_state,{taskList: new_taskList});
    }
    case 'listTaskFiles':
      return Object.assign({},state,{taskFileList: action.value});
    case 'setCurrentTask':
      return Object.assign({},state,{currentTaskFile: action.value});
    default:
      return state;
  }
};
