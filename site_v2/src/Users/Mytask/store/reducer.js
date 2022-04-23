const defaultState = {
  myAuditList: [], //我的审核列表
  myAnnotationList: [], //我的标注列表
  myCurrentAudit: {
    filename: "未知文件",
    creator: "未知创建人",
    time: null,
    auditor: "未知审核员",
    annotators: ["未知标注员"],
    schedule: 1,
    taskname: "未知任务",
    content: null, //生语料内容
    onUpload: null, //待上传审核成果
  },
  myCurrentAnnotation: {
    annotationname: null, //当前我的标注文件名
    content: null, //当前我的标注文件内容
    taskname: "未知任务名", //当前选中任务名
  }
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case "getMyAuditList":
      return Object.assign({},state,{myAuditList: action.values});
    case "getMyAnnotationList":
      return Object.assign({},state,{myAnnotationList: action.values});
    case "getAnnotationContent":
      return Object.assign({},state,{myCurrentAnnotation: action.values});
    case "getAuditContent":
      return Object.assign({},state,{myCurrentAudit: action.values});
    default:
      return state;
  }
};
