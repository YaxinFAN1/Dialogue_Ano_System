import axios from 'axios';
import ApiUtil, { toBatch, handleError } from "../../../utils/api";
import { message } from "antd";
import { raw_name2name } from "../../../utils/readfile";



//获取熟语料列表
export const getCorpusList = () => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      await axios.post(ApiUtil.API_CORPUS_LISTALL,JSON.stringify(''),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
        .then(res => {
          if(res.status === 200){
            const code = res.data[0];
            const corpusnames = res.data[1];
            let new_list = [];
            if(code === 0){
              for(let i=0; i<corpusnames.length; i++){
                const id = corpusnames[i];
                const group = raw_name2name(id).group;
                const name = raw_name2name(id).name;
                const key_id = {
                  key: (i+1).toString(),
                  corpusname: name, //用于展示的语料名
                  raw_corpusname: corpusnames[i], //用于请求的原语料名
                  group: group,
                  creator: null,
                  time: null
                };
                new_list.push(key_id);
              }
              dispatch({type: 'getCorpusList', value: new_list});
              resolve();
            }
            else{
              handleError(code,"获取熟语料列表错误！");
              reject();
            }
          }
        })
        .catch(err => {
          message.error("获取熟语料列表错误！请检查您的网络！");
          reject();
        })
    })
  }
};

//获取熟语料内容
export const getCorpusContent = (corpusname) => {
  return (dispatch) => {
    axios.post(ApiUtil.API_CORPUS_GETCONTENT,JSON.stringify(corpusname),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 0) dispatch({type: 'getCorpusContent', value: {raw_corpusname: corpusname, corpusname: raw_name2name(corpusname).name, corpusContent: res.data[1]}});
          else if(code === 1) message.error("熟语料ID不存在！请刷新。");
          else {
            handleError(code,"获取熟语料内容错误");
          }
        }
      })
      .catch(err => {
        message.error("获取熟语料内容错误！请检查您的网络！");
      })
  }
};

//修改熟语料内容
export const editCorpusContent = (corpusname) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_CORPUS_SETCONTENT,JSON.stringify(corpusname),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
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
           handleError(code,"修改熟语料内容错误！");
           resolve(false);
          }
        }
      })
      .catch(err => {
        message.error("修改熟语料内容错误！请检查您的网络！");
        resolve(false);
      })
  });
};

//批量获取熟语料属性
export const getCorpusProps = (dataSource) => {
  const corpusnames = [];
  dataSource.forEach(item => {
    corpusnames.push(item.raw_corpusname);
  });
  return (dispatch) => {
    axios.post(toBatch(ApiUtil.API_CORPUS_GETPROP),JSON.stringify(corpusnames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            const prop = res.data[i][1];
            if(code === 1) message.error("文件名不存在！");
            else if(code === 0){
              dataSource[i].creator = prop.creator;
              dataSource[i].time = prop.datetime;
            }
            else{
              handleError(code,"批量获取熟语料属性错误！");
            }
          }
          dispatch({type: 'getCorpusProps', value: dataSource});
        }
      })
      .catch(err => {
        message.error("批量获取熟语料属性错误！请检查您的网络！");
      })
  }
};

//批量创建新的熟语料文件
export const createNewCorpuses = (corpusList) => {
  let count = 0;
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_CORPUS_CREATE),JSON.stringify(corpusList),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1) {
              count += 1;
            }
            else if(code === 0){

            }
            else{
              handleError(code,"批量创建新的熟语料文件错误！");
              reject(false);
              break;
            }
          }
          if(count > 0){
            message.warning("有"+count+"份熟语料文件ID已存在！已经自动为您忽略。");
          }
          resolve(true);
        }
      })
      .catch(err => {
        message.error("批量创建新的熟语料错误！请检查您的网络！");
        reject(false);
      })
  })
};

//批量把xincmn格式的文件转换成json格式
export const xincmn2json = (filecontents) => {
  let o_filecontents = [];
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_FORMATTER_XINCMN2CARBON),filecontents,{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("xincmn格式转json失败！请检查源文件格式！");
              reject();
            }
            else if(code === 0){
              o_filecontents.push(res.data[i][1]);
            }
            else {
              handleError(code,"xincmn格式转json错误！");
              reject();
              break;
            }
          }
          resolve(o_filecontents);
        }
      })
      .catch(err => {
        message.error("xincmn格式转json错误！请检查您的网络！");
        reject();
      })
  })
};

//批量把chtb格式的文件转化成json格式
export const chtb2json = (corpuscontents) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_FORMATTER_CHTB2CARBON),JSON.stringify(corpuscontents),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          let o_coupuscontents = [];
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            const content = res.data[i][1];
            if(code === 1){
              message.error("存在文件格式错误！请检查是否正确选择了文件类型！");
              reject();
              break;
            }
            else if(code === 0){
              o_coupuscontents.push(content);
            }
            else{
              handleError(code,"批量把chtb格式的文件转化成json格式错误！");
              reject();
              break;
            }
          }
          resolve(o_coupuscontents);
        }
      })
      .catch(err => {
        message.error("批量把chtb格式的文件转化成json格式错误！请检查您的网络！");
        reject();
      })
  })
};

//批量把json格式的文件转化成chtb格式
const json2chtb = (contentList) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_FORMATTER_CARBON2CHTB),contentList,{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        let o_contentList = [];
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            const content = res.data[i][1];
            if(code === 1){
              message.error("json转chtb出现某些错误！");
              reject();
            }
            else if(code === 0){
              o_contentList.push(content);
            }
            else{
              handleError(code,"批量把json格式的文件转化成chtb格式错误！");
              reject();
              break;
            }
          }
        }
        resolve(o_contentList);
      })
      .catch(err => {
        message.error("批量把json格式的文件转化成chtb格式错误！请检查您的网络！");
        reject();
      })
  })
};

//批量删除熟语料文件
export const deleteCorpuses = (corpusList) => {
  const corpusnames = [];
  corpusList.forEach(item => {
    corpusnames.push(item.raw_corpusname);
  });
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_CORPUS_DELETE),JSON.stringify(corpusnames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("语料ID不存在！");
              resolve(false);
              break;
            }
            else if(code === 0){

            }
            else{
              handleError(code,"批量删除熟语料文件错误！");
              resolve(false);
              break;
            }
          }
          resolve(true);
        }
      })
      .catch(err => {
        message.error("批量删除熟语料文件错误！请检查您的网络！");
        reject();
      })
  })
};

//批量下载熟语料文件
const downloadCorpuses = async (filenames, filetype) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_CORPUS_GETCONTENT),JSON.stringify(filenames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(async res => {
        const contentList = [];
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            //去掉状态code
            const code = res.data[i][0];
            let content = res.data[i][1];
            if(code === 1) {
              message.error("ID不存在！");
              reject();
            }
            else if(code === 0){
              contentList.push(content);
            }
            else{
              handleError(code,"批量下载熟语料文件错误！");
              reject();
            }
          }
          let o_contentList = [];
          if(filetype === 'xml') o_contentList = await json2chtb(contentList);
          else if(filetype === 'json'){
            contentList.forEach(item => {
              o_contentList.push(JSON.stringify(item));
            })
          }
          resolve(o_contentList);
        }
      })
      .catch(err => {
        message.error("批量下载熟语料文件错误！请检查您的网络！");
        reject();
      })
  })
};

//批量打包熟语料文件
export const zipDownloadCorpuses = (corpusnames, zipname, filetype) => {
  return new Promise(async (resolve,reject) => {
    let JSZip = require("jszip");
    let saveAs = require('file-saver');
    let zip = new JSZip();
    const contents = await downloadCorpuses(corpusnames,filetype);
    for(let i=0; i<contents.length; i++){
      let name; //文件名修改
      if(filetype === 'xml'){
        name = raw_name2name(corpusnames[i]).name + '.xml';
      }
      else if(filetype === 'json'){
        name = raw_name2name(corpusnames[i]).name + '.json';
      }
      zip.file(name,contents[i]);
    }
    await zip.generateAsync({type: "blob"})
      .then(content => {
        saveAs(content, zipname +".zip");
        resolve(0);
      })
      .catch(err => {
        message.error('网络出现了一点小问题，请稍后重试');
        reject();
      })
  })
};

//修改熟语料名和分组
export const editCorpusName = (corpusname) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_CORPUS_RENAME,JSON.stringify(corpusname),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("原ID不存在！");
            resolve(false);
          }
          else if(code === 2){
            message.error("新ID已被占用！");
            resolve(false);
          }
          else if(code === 0){
            resolve(true);
          }
          else{
            handleError(code,"修改熟语料名和分组错误！");
            resolve(false);
          }
        }
      })
      .catch(err => {
        message.error("修改熟语料名和分组错误！请检查您的网络！");
        resolve(false);
      })
  });
};

//保存当前页码
export const savePage = (currentPage) => {
  return (dispatch) => {
    dispatch({type: "savePage", value: currentPage});
  }
};
