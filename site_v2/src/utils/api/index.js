import {message} from "antd";

export default class ApiUtil {
  //static URL_IP = 'http://47.101.35.106:5000';

  static URL_ROOT = '/api'; //挂载的根节点

  //auth
  static API_AUTH = ApiUtil.URL_ROOT + '/auth';

  static API_AUTH_GETPRIVLIST = ApiUtil.API_AUTH + '/get_privlist'; //获取权限表
  static API_AUTH_LOGIN = ApiUtil.API_AUTH + '/login'; //登录账户
  static API_AUTH_LOGOUT = ApiUtil.API_AUTH + '/logout'; //登出账户
  static API_AUTH_WHOAMI = ApiUtil.API_AUTH + '/whoami'; //获得当前登录账户ID

  //corpus
  static API_CORPUS = ApiUtil.URL_ROOT + '/corpus';

  static API_CORPUS_CREATE = ApiUtil.API_CORPUS + '/create'; //创建语料
  static API_CORPUS_DELETE = ApiUtil.API_CORPUS + '/delete'; //删除语料
  static API_CORPUS_GETCONTENT = ApiUtil.API_CORPUS + '/get_content'; //读取语料内容
  static API_CORPUS_GETPROP = ApiUtil.API_CORPUS + '/get_prop'; //获取语料的只读属性
  static API_CORPUS_LISTALL = ApiUtil.API_CORPUS + '/list_all'; //列出所有语料ID
  static API_CORPUS_RENAME = ApiUtil.API_CORPUS + '/rename'; //改变语料ID
  static API_CORPUS_SETCONTENT = ApiUtil.API_CORPUS + '/set_content'; //修改语料内容

  //relations
  static API_RELATIONS = ApiUtil.URL_ROOT + '/relations';

  static API_RELATIONS_GET = ApiUtil.API_RELATIONS + '/get'
  static API_RELATIONS_ADD = ApiUtil.API_RELATIONS + '/add'
  static API_RELATIONS_DEL = ApiUtil.API_RELATIONS + '/delete'

  //formatter
  static API_FORMATTER = ApiUtil.URL_ROOT + '/formatter';

  static API_FORMATTER_CARBON2CHTB = ApiUtil.API_FORMATTER + '/carbon2chtb'; //CARBON转CHTB类型
  static API_FORMATTER_CHTB2CARBON = ApiUtil.API_FORMATTER + '/chtb2carbon'; //CHTB转CARBON类型
  static API_FORMATTER_XINCMN2CARBON = ApiUtil.API_FORMATTER + '/xin_cmn2carbon'; //xin_cmn转CARBON类型

  //raw-corpus
  static API_RAWCORPUS = ApiUtil.URL_ROOT + '/raw-corpus';

  static API_RAWCORPUS_CREATE = ApiUtil.API_RAWCORPUS + '/create'; //创建生语料
  static API_RAWCORPUS_DELETE = ApiUtil.API_RAWCORPUS + '/delete'; //删除生语料
  static API_RAWCORPUS_GETCONTENT = ApiUtil.API_RAWCORPUS + '/get_content'; //读取生语料内容
  static API_RAWCORPUS_GETPROP = ApiUtil.API_RAWCORPUS + '/get_prop'; //获取生语料的只读属性
  static API_RAWCORPUS_LISTALL = ApiUtil.API_RAWCORPUS + '/list_all'; //列出所有生语料ID
  static API_RAWCORPUS_RENAME = ApiUtil.API_RAWCORPUS + '/rename'; //改变生语料ID
  static API_RAWCORPUS_SETCONTENT = ApiUtil.API_RAWCORPUS + '/set_content'; //修改生语料内容

  //task
  static API_TASK = ApiUtil.URL_ROOT + '/task';

  static API_TASK_ADDANNOTATOR = ApiUtil.API_TASK + '/add_annotator'; //给任务添加标注员
  static API_TASK_ADDFILE = ApiUtil.API_TASK + '/add_file'; //向任务添加文件
  static API_TASK_COMMITANNOTATION = ApiUtil.API_TASK + '/commit_annotation'; //提交标注结果
  static API_TASK_COMMITINSPECTION = ApiUtil.API_TASK + '/commit_inspection'; //提交审核结果
  static API_TASK_CREATE = ApiUtil.API_TASK + '/create'; //创建新任务
  static API_TASK_DELETE = ApiUtil.API_TASK + '/delete'; //删除任务
  static API_TASK_GETANNOTATIONPROGRESS = ApiUtil.API_TASK + '/get_annotation_progress'; //获取标注进度
  static API_TASK_GETANNOTATIONRESULT = ApiUtil.API_TASK + '/get_annotation_result'; //获取标注结果
  static API_TASK_GETFILETARGET = ApiUtil.API_TASK + '/get_file_target'; //获取文件完成时的目标入库ID
  static API_TASK_GETINSPECTIONPROGRESS = ApiUtil.API_TASK + '/get_inspection_progress'; //获取审核进度
  static API_TASK_GETINSPECTIONRESULT = ApiUtil.API_TASK + '/get_inspection_result'; //获取审核结果
  static API_TASK_GETINSPECTOR = ApiUtil.API_TASK + '/get_inspector'; //查询任务的审核员
  static API_TASK_GETPROP = ApiUtil.API_TASK + '/get_prop'; //获取任务只读属性
  static API_TASK_LISTALL = ApiUtil.API_TASK + '/list_all'; //列出所有任务
  static API_TASK_LISTANNOTATORS = ApiUtil.API_TASK + '/list_annotators'; //列出所有的标注员
  static API_TASK_LISTBYANNOTATOR = ApiUtil.API_TASK + '/list_by_annotator'; //列出用户担任标注员的任务
  static API_TASK_LISTBYINSPECTOR = ApiUtil.API_TASK + '/list_by_inspector'; //列出用户担任审核员的任务
  static API_TASK_LISTFILES = ApiUtil.API_TASK + '/list_files'; //列出任务包含的所有文件
  static API_TASK_REMOVEANNOTATOR = ApiUtil.API_TASK + '/remove_annotator'; //移除标注员
  static API_TASK_REMOVEFILE = ApiUtil.API_TASK + '/remove_file'; //从任务移除文件
  static API_TASK_RENAME = ApiUtil.API_TASK + '/rename'; //修改任务ID
  static API_TASK_REPLACEANNOTATOR = ApiUtil.API_TASK + '/replace_annotator'; //替换标注员
  static API_TASK_SETANNOTATIONRESULT = ApiUtil.API_TASK + '/set_annotation_result'; //设置标注结果
  static API_TASK_SETFILETARGET = ApiUtil.API_TASK + '/set_file_target'; //设置文件审核完成时的目标入库ID
  static API_TASK_SETINSPECTIONRESULT = ApiUtil.API_TASK + '/set_inspection_result'; //设置审核结果
  static API_TASK_SETINSPECTOR = ApiUtil.API_TASK + '/set_inspector'; //设置任务的审核员

  //user
  static API_USER = ApiUtil.URL_ROOT + '/user';

  static API_USER_CREATE = ApiUtil.API_USER + '/create'; //创建新用户
  static API_USER_DELETE = ApiUtil.API_USER + '/delete'; //删除用户
  static API_USER_GRANTPRIV = ApiUtil.API_USER + '/grant_priv'; //授予用户权限
  static API_USER_LISTALL = ApiUtil.API_USER + '/list_all'; //列出所有用户的ID
  static API_USER_LISTPRIV = ApiUtil.API_USER + '/list_priv'; //列出用户所有的权限
  static API_USER_RENAME = ApiUtil.API_USER + '/rename'; //改变用户ID
  static API_USER_REVOKEPRIV = ApiUtil.API_USER + '/revoke_priv'; //收回用户权限
  static API_USER_SETPW = ApiUtil.API_USER + '/set_pw'; //设置用户密码


}

//转化成批处理的函数
export const toBatch = (url) => {
  return (url+'?batch=1');
};

//错误处理函数，传入错误码，报相应的错，
export const handleError = (code,text) => {
  switch (code) {
    case -1: {
      message.error("未知错误！");
      return ;
    }
    case -10: {
      message.error("视图层错误！");
      return ;
    }
    case -11: {
      message.error("未登录！请返回重新登录！");
      return ;
    }
    case -12: {
      message.error("无权限操作！");
      return ;
    }
    case -13: {
      message.error("参数无效！");
      return ;
    }
    case -20: {
      message.error("数据层错误！");
      return ;
    }
    case -21: {
      message.error("数据类型错误！");
      return ;
    }
    case -22: {
      message.error("数据格式错误！");
      return ;
    }
    case -23: {
      message.error("前置状态错误！");
      return ;
    }
    default: {
      message.error(text);
      return ;
    }
  }
};
