import axios from 'axios';
import ApiUtil, { toBatch, handleError } from "../../../utils/api";
import { message} from "antd";
import {getRawcorpusContent} from "../../Mytask/store/actionCreators";

//获取任务列表
export const getTaskList = () => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      let newTaskList = [];
      await axios.post(ApiUtil.API_TASK_LISTALL,JSON.stringify(''),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
        .then(res => {
          const code = res.data[0];
          if(code === 0) {
            for(let i=0; i<res.data[1].length; i++){
              newTaskList.push({
                key: (i+1).toString(),
                taskname: res.data[1][i],
                creator: '未知创建人',
                time: null,
                auditor: '未知审核员',
                annotators: ['未知标注员'],
                schedule: {annotating: 0, auditing: 0, completed: 0}//各标注文件进度
              });
            }
            dispatch({type: "getTaskList", value: newTaskList});
            resolve();
          }
          else{
            handleError(code,"获取任务列表错误！");
            reject();
          }
        })
        .catch(err => {
          message.error("获取任务列表错误！请检查您的网络！");
          reject();
        })
    })
  }
};

//获取任务属性
export const getTaskProp = (tasknames) => {
  let taskProps = [];
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_GETPROP),JSON.stringify(tasknames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            const prop = res.data[i][1];
            if(code === 1){
              message.error("任务ID不存在！");
              reject();
            }
            else if(code === 0){
              taskProps.push(prop);
            }
            else {
              handleError(code,"获取任务属性错误！");
              reject();
            }
          }
          resolve(taskProps);
        }
      })
      .catch(err => {
        message.error("获取任务属性错误！请检查您的网络！");
        reject();
      })
  })
};

//获取审核员
const getInspectors = (tasknames) => {
  let inspectors = [];
  return new Promise(async (resolve, reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_GETINSPECTOR),JSON.stringify(tasknames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            const inspector = res.data[i][1];
            if(code === 1){
              message.error("任务ID不存在！");
              reject();
            }
            else if(code === 0){
              inspectors.push(inspector);
            }
            else{
              handleError(code,"获取审核员错误！");
              reject();
            }
          }
          resolve(inspectors);
        }
      })
      .catch(err => {
        message.error("获取审核员错误！请检查您的网络！");
        reject();
      })
  });
};

//获取标注员
export const getAnnotators = (tasknames) => {
  let annotators = [];
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_LISTANNOTATORS),JSON.stringify(tasknames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            const annotator = res.data[i][1];
            if(code === 1){
              message.error("任务ID不存在！");
              reject();
            }
            else if(code === 0){
              annotators.push(annotator);
            }
            else {
              handleError("获取标注员错误！");
              reject();
            }
          }
          resolve(annotators);
        }
      })
      .catch(err => {
        message.error("获取标注员错误！请检查您的网络！");
        reject();
      })
  })
};

//获取审核进度
export const getInspectionProgress = (tasknames) => {
  let progresses = [];
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_GETINSPECTIONPROGRESS),JSON.stringify(tasknames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            const progress = res.data[i][1];
            if(code === 1){
              message.error("任务ID不存在！");
              reject();
            }
            else if(code === 0){
              progresses.push(progress);
            }
            else{
              handleError(code,"获取审核进度错误！");
              reject();
            }
          }
          resolve(progresses);
        }
      })
      .catch(err => {
        message.error("获取审核进度错误！请检查您的网络！");
        reject();
      })
  })
};

//获取标注进度
export const getAnnotationProgress = (tasknames) => {
  let progresses = [];
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_GETANNOTATIONPROGRESS),JSON.stringify(tasknames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            const progress = res.data[i][1];
            if(code === 1){
              message.error("任务ID不存在！");
              reject();
            }
            else if(code === 0){
              progresses.push(progress);
            }
            else{
              handleError(code,"获取标注进度错误！");
              reject();
            }
          }
          resolve(progresses);
        }
      })
      .catch(err => {
        message.error("获取标注进度错误！请检查您的网络！");
        reject();
      })
  })
};

//获取任务属性的总的步骤
export const getTaskProps = (taskList) => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      const tasknames = [];
      let newTask = [];
      taskList.forEach(item => {
        tasknames.push(item.taskname);
      });
      const taskProps = await getTaskProp(tasknames);
      const inspectors = await getInspectors(tasknames);
      const annotators = await getAnnotators(tasknames);
      const inspectionProgress = await getInspectionProgress(tasknames);
      const annotationProgress = await getAnnotationProgress(tasknames);

      for(let i=0; i<taskList.length; i++){
        let task = {
          key: taskList[i].key,
          taskname: taskList[i].taskname,
          creator: taskProps[i].creator,
          time: taskProps[i].datetime,
          auditor: inspectors[i],
          annotators: annotators[i],
          schedule: {annotating: 0, auditing: 0, completed: 0} //各标注文件进度
        };

        //计算各个文件数
        let annotating = 0;
        let auditing = 0;
        let completed = 0;
        let total = 0;
        for(let file in inspectionProgress[i]){
          total += 1;
          if(inspectionProgress[i][file] === true){
            completed += 1;
          }
        }

        for(let file in annotationProgress[i][task.annotators[0]]){ //最外层是文件循环
          let filestate = true;
          task.annotators.forEach(pname => {
            filestate = filestate && annotationProgress[i][pname][file];
          });
          if(filestate === false){ //一旦有某人该文件没有标注完成，该份文件就处于标注中
            annotating += 1;
          }
        }

        auditing = total - completed - annotating;
        task.schedule = {annotating: annotating, auditing: auditing, completed: completed};

        newTask.push(task);
      }
      dispatch({type: "getTaskProps", value: newTask});
      resolve();
      //假设输入长度为n
      //处理得到任务名列表， 1n
      //批处理获得创建时间和创建人， 一次请求 + 1n
      //批处理获得审核员，一次请求 + 1n
      //批处理获得标注员，一次请求 + 1n
      //做一次关于文件审核进度的请求，[文件状态列表],计算得到已完成数，审核中数 + 1n
      //做一次关于标注进度的请求，得到[{基于标注员的信息}] 1n
    });
  }
};

//创建新任务
export const createNewTask = (taskname) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_CREATE,JSON.stringify(taskname),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("任务名ID已被占用！");
            reject();
          }
          else if(code === 0){
            resolve();
          }
          else{
            handleError(code,"创建新任务错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("创建新任务错误！请检查您的网络！");
        reject();
      })
  })
};

//创建新文件
export const createFiles = (files) => {
  let count = 0;
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_RAWCORPUS_CREATE),JSON.stringify(files),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              count += 1;
            }
            else if(code === 0){

            }
            else{
              handleError(code,"创建新文件错误！");
              reject();
            }
          }
          if(count > 0){
            message.info("有"+count+"个生语料文件ID重复，已自动为您忽略。");
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("创建新文件错误！请检查您的网络！");
        reject();
      })
  })
};

//向任务添加新文件
export const addFiles = (files) => {
  let count = 0;
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_ADDFILE),JSON.stringify(files),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("任务ID不存在！");
              reject();
            }
            else if(code === 2){
              count += 1;
            }
            else if(code === 0){

            }
            else {
              handleError(code,"向任务添加新文件错误！");
              reject();
            }
          }
          if(count > 0){
            message.info("有"+count+"个生语料ID重复或不存在，已自动为您忽略。");
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("向任务添加新文件错误！请检查您的网络！");
        reject();
      })
  })
};

//批量设置入库ID
export const setFileTargets = (files) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_SETFILETARGET),JSON.stringify(files),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("任务或生语料ID不存在！");
              reject();
            }
            else if(code === 0){

            }
            else{
              handleError(code,"批量设置入库ID错误！");
              reject();
            }
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("批量设置入库ID错误！请检查您的网络！");
        reject();
      })
  })
};

//设置单个任务审核员
export const setInspector = (inspector) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_SETINSPECTOR,JSON.stringify(inspector),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("任务ID不存在！");
            reject();
          }
          else if(code === 2){
            message.error("用户ID不存在或重复！");
            reject();
          }
          else if(code === 0){
            resolve();
          }
          else{
            handleError(code,"设置单个任务审核员错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("设置单个任务审核员错误！请检查您的网络！");
        reject();
      })
  })
};

//给任务添加标注员
export const addAnnotators = (annotators) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_ADDANNOTATOR),JSON.stringify(annotators),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("任务ID不存在！");
              reject();
            }
            else if(code === 2){
              message.error("用户ID不存在或重复！");
              reject();
            }
            else if(code === 0){

            }
            else {
              handleError(code,"给任务添加标注员错误！");
              reject();
            }
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("给任务添加标注员错误！请检查您的网络！");
      })
  })
};

//批量删除任务
export const deleteTasks = (taskList) => {
  const tasknames = [];
  taskList.forEach(item => {
    tasknames.push(item.taskname);
  });
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_DELETE),JSON.stringify(tasknames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("任务ID不存在！");
              resolve(false);
            }
            else if(code === 0){

            }
            else {
              handleError(code,"批量删除任务错误！");
              resolve(false);
            }
          }
          resolve(true);
        }
      })
      .catch(err => {
        message.error("批量删除任务错误！请检查您的网络！");
        resolve(false);
      })
  })
};

//修改任务名
export const renameTask = (taskname) => {
  return new Promise(async (resolve, reject) => {
    await axios.post(ApiUtil.API_TASK_RENAME,JSON.stringify(taskname),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("任务ID不存在！");
            reject();
          }
          else if(code === 2){
            message.error("任务ID已被占用！");
            reject();
          }
          else if(code === 0){
            resolve();
          }
          else {
            handleError(code,"修改任务名错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("修改任务名错误！请检查您的网络！");
        reject();
      })
  });
};

//批量删除标注员
export const removeAnnotators = (annotators) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_REMOVEANNOTATOR),JSON.stringify(annotators),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("任务ID不存在！");
              reject();
            }
            else if(code === 2){
              message.error("用户ID不存在或重复！");
              reject();
            }
            else if(code === 0){

            }
            else{
              handleError(code,"批量删除标注员错误！");
              reject();
            }
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("批量删除标注员错误！请检查您的网络！");
        reject();
      })
  })
};

//批量替换标注员（保留任务成果）
const replaceAnnotators = (rpc) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_TASK_REPLACEANNOTATOR),JSON.stringify(rpc),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("任务ID不存在！");
              reject();
            }
            else if(code === 0){

            }
            else {
              handleError(code,"批量替换标注员错误！");
              reject();
            }
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("批量替换标注员错误！请检查您的网络！");
        reject();
      })
  })
};

//修改标注员（任意标注员->任意标注员）
export const editAnnotators = (annotators) => {
  return new Promise(async (resolve,reject) => {
    const { oldAnnotators, newAnnotators, taskname } = annotators;
    let prv = [];
    let cur = [];
    oldAnnotators.forEach(item => {
      //原来有，现在没了(删除了）
      if(!newAnnotators.includes(item)){
        prv.push(item);
      }
    });
    newAnnotators.forEach(item => {
      //现在有，原来没有（新增了）
      if(!oldAnnotators.includes(item)){
        cur.push(item);
      }
    });

    //[a,b]删
    //[c,d,e]增
    //ac,bd,+e
    //[a,b,c]删
    //[d,e]增
    //ad,be,-c
    //一般用法。1.纯增加 2.纯删除 3.等量替换一个（这时替换是唯一的）
    if(cur.length > 0 && prv.length === 0){
      //纯增加
      let annotators = [];
      cur.forEach(item => {
        annotators.push({tid: taskname, uid: item});
      });
      await addAnnotators(annotators);
    }

    else if(prv.length > 0 && cur.length === 0){
      //纯删除
      let annotators = [];
      prv.forEach(item => {
        annotators.push({tid: taskname, uid: item});
      });
      await removeAnnotators(annotators);
    }

    else if(cur.length > 0 && prv.length > 0){
      if(cur.length >= prv.length){
        //先换再增
        const rpc = [];
        for(let i=0; i<prv.length; i++){
          //替换
          rpc.push({tid: taskname, old_uid: prv[i], new_uid: cur[i]});
        }
        await replaceAnnotators(rpc);
        let add = [];
        for(let i=prv.length; i<cur.length; i++){
          add.push({tid: taskname, uid: cur[i]});
        }
        await addAnnotators(add);
      }
      else{
        //先换再删
        const rpc = [];
        for(let i=0; i<cur.length; i++){
          //替换
          rpc.push({tid: taskname, old_uid: prv[i], new_uid: cur[i]});
        }
        await replaceAnnotators(rpc);
        let del = [];
        for(let i=cur.length; i<prv.length; i++){
          del.push({tid: taskname, uid: prv[i]});
        }
        await removeAnnotators(del);
      }
    }
    resolve();
  });
};

//批量列出任务包含的所有文件
const listFiles = (taskname) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_LISTFILES,JSON.stringify(taskname),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
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
            handleError(code,"列出任务包含的所有文件错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("批量列出任务包含的所有文件错误！请检查您的网络！");
        reject();
      })
  })
};

//获得一个任务的文件列表和已知属性
export const listTaskFiles = (currentTask) => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      const { taskname, auditor, annotators } = currentTask;
      let taskFileList = [];
      const filenames = await listFiles(taskname);

      const auditProgresses = await getInspectionProgress([taskname]); //审核进度对象列表，按task分[{file1: true},{}]
      const annotationProgresses = await getAnnotationProgress([taskname]); //标注进度对象列表，[]

      let files = {}; //文件名对象
      for(let i=0; i<auditProgresses.length; i++){
        const auditProgress = auditProgresses[i];
        for(let fname in auditProgress){
          files[fname] = {};
          if(auditProgress[fname] === true) files[fname].schedule = 2;
          else files[fname].schedule = 1; //可能是0或1，暂时打1
        }
      }

      let annoSchedule  = {};
      for(let i=0; i<annotationProgresses.length; i++){
        const annotationProgesss = annotationProgresses[i]; //一个标注进度对象
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
        taskFileList.push({
          key: key.toString(),
          filename: fname,
          taskname: taskname,
          targetname: null, //只是没有获取，并不是null
          schedule: schedule, //0是未标注，1是未审核，2是已完成
          auditor: auditor,
          annotators: annotators,
          creator: '未知创建人',
          time: '未知时间', //只是没有获取，并不是null
          content: null, //只是没有获取，并不是null
        });
      }
      dispatch({type: "listTaskFiles", value: taskFileList});
      resolve();
    })
  }
};

//设定当前任务
export const setCurrentTask = (currentTask) => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      const { taskname, auditor, annotators } = currentTask;
      dispatch({type: "setCurrentTask", value: {
          filename: "未知文件名",
          targetname: "未知入库ID",
          taskname: taskname,
          schedule: 0, //0是未标注，1是未审核，2是已完成
          auditor: auditor,
          annotators: annotators,
          creator: "未知创建人",
          time: null,
          content: null,
        }});
      resolve();
    })
  };
};

//获得文件入库ID
export const getFileTarget = (file) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_TASK_GETFILETARGET,JSON.stringify(file),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("任务或生语料ID不存在！");
            reject();
          }
          else if(code === 0){
            resolve(res.data[1]);
          }
          else{
            handleError(code,"获得文件入库ID失败！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获得文件入库ID失败！请检查您的网络！");
        reject();
      })
  })
};

//获取生语料属性
const getFileProps = (filename) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_RAWCORPUS_GETPROP,JSON.stringify(filename),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
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
            handleError(code,"获取生语料属性错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获取生语料属性错误！请检查您的网络！");
        reject();
      })
  })
};

//获得当前任务当前文件的属性
export const getTaskFileContent = (record) => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      const { filename, taskname, schedule, auditor, annotators } = record;

      const targetname = await getFileTarget({tid: taskname, fid: filename});
      const { creator, datetime } = await getFileProps(filename);
      const content = await getRawcorpusContent(filename);
      dispatch({type: 'setCurrentTask', value: {
          filename: filename,
          targetname: targetname,
          taskname: taskname,
          schedule: schedule,
          auditor: auditor,
          annotators: annotators,
          creator: creator,
          time: datetime,
          content: content,
        }});
      resolve();
    });
  }
};

//删除生语料文件
export const deleteTaskFiles = (files) => {
  const _files = [];
  return new Promise(async (resolve,reject) => {
    files.forEach(item => {
      _files.push(item.filename);
    });
    await axios.post(toBatch(ApiUtil.API_RAWCORPUS_DELETE),JSON.stringify(_files),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("ID不存在！");
              reject();
            }
            else if(code === 0){

            }
            else{
              handleError(code,"删除生语料文件错误！");
              reject();
            }
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("删除生语料文件错误！请检查您的网络！");
        reject();
      })
  })
};

//从任务中移除生语料文件
export const removeTaskFiles = (files) => {
  const _files = [];
  return new Promise(async (resolve,reject) => {
    files.forEach(item => {
      _files.push({tid: item.taskname, fid: item.filename});
    });
    await axios.post(toBatch(ApiUtil.API_TASK_REMOVEFILE),JSON.stringify(_files),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("任务ID不存在！");
              reject();
            }
            else if(code === 0){

            }
            else{
              handleError(code,"从任务中移除生语料文件错误！");
              reject();
            }
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("从任务中移除生语料文件错误！请检查您的网络！");
        reject();
      })
  })
};

//生语料重命名
export const renameTaskFile = (file) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_RAWCORPUS_RENAME,JSON.stringify(file),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("原ID不存在！");
            reject();
          }
          else if(code === 2){
            message.error("新ID已占用！");
            reject();
          }
          else if(code === 0){
            resolve();
          }
          else{
            handleError(code,"生语料重命名错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("生语料重命名错误！请检查您的网络！");
        reject();
      })
  })
};

//批量修改生语料内容
export const setRawContents = (contents) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_RAWCORPUS_SETCONTENT),JSON.stringify(contents),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("ID不存在！");
              reject();
            }
            else if(code === 0){

            }
            else{
              handleError(code,"批量修改生语料内容错误！");
              reject();
            }
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("批量修改生语料内容错误！请检查您的网络！");
        reject();
      })
  })
};

//重置当前任务文件
export const resetTaskFileContent = (currentTaskFile) => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      const { taskname, auditor, annotators } = currentTaskFile;
      await dispatch({type: 'setCurrentTask', value: {
            filename: "未知文件名",
            targetname: "未知入库ID",
            taskname: taskname,
            schedule: 0, //0是未标注，1是未审核，2是已完成
            auditor: auditor,
            annotators: annotators,
            creator: "未知创建人",
            time: null,
            content: null,
        }});
      resolve();
    })
  }
};
