import axios from 'axios';
import ApiUtil, { handleError } from "../../../utils/api";
import { message } from 'antd';
import {getAnnotationProgress, getInspectionProgress, getAnnotators, getTaskProp} from "../../TMGT/store/actionCreators";

//获取用户担任审核员的任务
export const getMyAuditTasks = (username) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_LISTBYINSPECTOR,JSON.stringify(username),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 0){
            resolve(res.data[1]);
          }
          else{
            handleError(code,"获取用户担任审核员的任务错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获取用户担任审核员的任务错误！请检查您的网络！");
        reject();
      })
  })
};

//获取我的审核列表（进行一系列筛选）[选中任务所包含的所有除标注中以外的文件列表]
export const getMyAuditList = (auditTasks) => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      const auditProgresses = await getInspectionProgress(auditTasks); //审核进度对象列表，按task分[{file1: true},{}]
      const annotationProgresses = await getAnnotationProgress(auditTasks); //标注进度对象列表，[]
      let auditList = [];

      //audit未提交(false)并且annotation全部为true已提交，才打上标记未审核。
      //audit已提交true打上标记已审核
      let files = {}; //文件名对象
      for(let i=0; i<auditProgresses.length; i++){
        const auditProgress = auditProgresses[i];
        for(let fname in auditProgress){
          files[fname] = {};
          files[fname].taskname = auditTasks[i];
          if(auditProgress[fname] === true) files[fname].schedule = 2;
          else files[fname].schedule = 1; //可能是0或1，暂时打1
        }
      }

      //先把标注进度做好
      let annoSchedule  = {};
      for(let i=0; i<annotationProgresses.length; i++){
        const annotationProgesss = annotationProgresses[i]; //一个标注进度对象
        let filenames = [];
        for(let annotator in annotationProgesss){
          for(let fname in annotationProgesss[annotator]) filenames.push(fname);
          break; //只要知道一个
        }

        for(let j=0; j<filenames.length; j++){
          let tag = true;
          for(let annotator in annotationProgesss){
            annoSchedule[filenames[j]] = {};
            if(annotationProgesss[annotator][filenames[j]] === false){
              //有一个人没标完就是没标完
              annoSchedule[filenames[j]].schedule = 0;
              tag = false;
              break;
            }
          }
          if(tag === true) annoSchedule[filenames[j]].schedule = 1;
        }

      }

      let key = 0;
      for(let fname in files){
        key += 1;
        let schedule = files[fname].schedule;
        if(annoSchedule[fname].schedule === 0) schedule = 0;
        if(schedule > 0){
          auditList.push({
            key: key.toString(),
            filename: fname, //审核文件名
            creator: null, //创建人
            time: null, //创建时间
            taskname: files[fname].taskname, //所属任务
            schedule: schedule, //进度
          })
        }
      }
      dispatch({type: "getMyAuditList", values: auditList});
      resolve();
    })
  }
};

//获取用户担任标注员的任务
export const getMyAnnotationTasks = (username) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_LISTBYANNOTATOR,JSON.stringify(username),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 0){
            resolve(res.data[1]);
          }
          else{
            handleError(code,"获取用户担任标注员的任务错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获取用户担任标注员的任务错误！请检查您的网络！");
        reject();
      })
  })
};

//获取我的标注列表[选中任务所包含的所有文件列表]
export const getMyAnnotationList = (annotationTasks,username) => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      const annotationProgresses = await getAnnotationProgress(annotationTasks); //标注进度对象列表，[]
      let annoList = [];

      let annoSchedule = {};
      for(let i=0; i<annotationProgresses.length; i++){
        const files = annotationProgresses[i][username];
        for(let fname in files){
          annoSchedule[fname] = {};
          annoSchedule[fname].taskname = annotationTasks[i];
          if(files[fname] === true) annoSchedule[fname].schedule = 1;
          else annoSchedule[fname].schedule = 0;
        }
      }

      let key = 0;
      for(let fname in annoSchedule){
        key += 1;
        annoList.push({
          key: key.toString(),
          annotationname: fname, //审核文件名
          creator: null, //创建人
          time: null, //创建时间
          taskname: annoSchedule[fname].taskname, //所属任务
          schedule: annoSchedule[fname].schedule, //进度
          content: null, //内容
        })
      }
      dispatch({type: "getMyAnnotationList", values: annoList});
      resolve();
    })
  }
};

//获取标注结果
export const getAnnotationResult = (annotationData) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_GETANNOTATIONRESULT,JSON.stringify(annotationData),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("任务ID不存在！");
            reject();
          }
          else if(code === 0){
            resolve(res.data[1]);
          }
          else {
            handleError(code,"获取标注结果错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获取标注结果错误！请检查您的网络！");
        reject();
      })
  })
};

//获取生语料内容
export const getRawcorpusContent = (filename) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_RAWCORPUS_GETCONTENT,JSON.stringify(filename),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("生语料ID不存在！");
            reject();
          }
          else if(code === 0){
            resolve(res.data[1]);
          }
          else{
            handleError(code,"获取生语料内容错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获取生语料内容错误！请检查您的网络！");
        reject();
      })
  })
};

//获取标注结果，如果为空，则改成获取生语料内容
export const getAnnotationContent = (annotationData) => {
  const { fid, tid, uid, schedule } = annotationData;
  return async (dispatch) => {
    let annotationResult = await getAnnotationResult({tid: tid, fid: fid, uid: uid});
    if(annotationResult === null){
      annotationResult = await getRawcorpusContent(fid);
    }
    dispatch({type: "getAnnotationContent", values: {annotationname: fid, content: annotationResult, taskname: tid, schedule: schedule}});
  }
};

//设置标注成果
export const setAnnotationResult = (result) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_SETANNOTATIONRESULT,JSON.stringify(result),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("ID不存在！");
            resolve(false);
          }
          else if(code === 0){
            resolve(true);
          }
          else{
            handleError(code,"设置标注成果错误！请检查您的图文结构是否有遗漏！");
            resolve(false);
          }
        }
      })
      .catch(err => {
        message.error("设置标注成果错误！请检查您的网络！");
        resolve(false);
      })
  })
};

//提交标注成果
export const commitAnnotation = (commission) => {
  return new Promise(async (resolve) => {
    await axios.post(ApiUtil.API_TASK_COMMITANNOTATION,JSON.stringify(commission),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("ID不存在！");
            resolve(false);
          }
          else if(code === 0){
            resolve(true);
          }
          else{
            handleError(code,"提交任务成果错误！");
            resolve(false);
          }
        }
      })
      .catch(err => {
        message.error("提交任务成果错误！请检查您的网络！");
        resolve(false);
      })
  })
};

//获取审核结果
export const getInspectionResult = (inspection) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_GETINSPECTIONRESULT,JSON.stringify(inspection),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("ID不存在！");
            reject();
          }
          else if(code === 0){
            resolve(res.data[1]);
          }
          else{
            handleError(code,"获取审核结果错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获取审核结果错误！请检查您的网络！");
        reject();
      })
  })
};

//获取当前审核文件信息
export const getAuditContent = (auditData) => {
  return async (dispatch) => {
    const annotators = await getAnnotators([auditData.taskname]);
    const props =  await getTaskProp([auditData.taskname]);
    const { creator, datetime } = props[0];
    let content = await getRawcorpusContent(auditData.filename); //取生语料
    const onUpload = await getInspectionResult({tid: auditData.taskname, fid: auditData.filename}); //获取审核结果
    if(onUpload !== null && ( !onUpload.discourse || onUpload.discourse.topic !== '【新语料】')) content = onUpload;
    dispatch({type: "getAuditContent", values: {
        filename: auditData.filename,
        creator: creator,
        time: datetime,
        auditor: auditData.auditor,
        annotators: annotators[0],
        schedule: auditData.schedule,
        taskname: auditData.taskname,
        content: content,
        onUpload: onUpload,
      }});
  }
};

//设置审核成果
export const setInspectionResult = (result) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_SETINSPECTIONRESULT,JSON.stringify(result),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("ID不存在！");
            resolve(false);
          }
          else if(code === 0){
            resolve(true);
          }
          else{
            handleError(code,"设置审核成果错误！");
            resolve(false);
          }
        }
      })
      .catch(err => {
        message.error("设置审核成果错误！请检查您的网络！");
        resolve(false);
      })
  })
};

//提交审核结果
export const commitInspection = (result) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_COMMITINSPECTION,JSON.stringify(result),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("ID不存在！");
            resolve(false);
          }
          else if(code === 0){
            resolve(true);
          }
          else{
            handleError(code,"提交审核结果错误！");
            resolve(false);
          }
        }
      })
      .catch(err => {
        message.error("提交审核结果错误！请检查您的网络！");
        resolve(false);
      })
  });
};

//重置当前我的审核详情
export const resetMyCurrentAudit = () => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      await dispatch({type: 'getAuditContent', values: {
          filename: "未知文件",
          creator: "未知创建人",
          time: null,
          auditor: "未知审核员",
          annotators: ["未知标注员"],
          schedule: 1,
          taskname: "未知任务",
          content: null, //生语料内容
          onUpload: null, //待上传审核成果
        }});
      resolve();
    });
  }
};

