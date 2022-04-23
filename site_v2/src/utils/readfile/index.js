import { actionCreators } from "../../Users/CMGT/store";

//读文件
export const readText = async (file) => {
  return await new Promise((resolve, reject) => {
    let reader = new FileReader();
    if(file instanceof File){
      reader.readAsText(file);
    }
    else{
      reader.readAsText(file.originFileObj);
    }
    //读取完成时调用的函数
    reader.onload = function() {
      resolve(this.result);//传回读取的值，这里是字符串
    }
  })
};

//文件内容转json
export const any2json = async (raw_fileList) => {
  let filetype = raw_fileList[0].filetype;
  let fileList = [];
  if(filetype === 'xml'){
    let filecontents = [];
    for(let i=0; i<raw_fileList.length; i++){
      filecontents.push(raw_fileList[i].content);
    }
    fileList = await actionCreators.chtb2json(filecontents);
  }
  else if(filetype === 'json'){
    fileList = [];
    raw_fileList.forEach((item) => {
      fileList.push(JSON.parse(item.content));
    })
  }
  return fileList; //内容列表
};

//xincmn转json
export const xincmn2json = async (raw_fileList) => {
  let filecontents = [];
  raw_fileList.forEach(item => {
    filecontents.push(item.content);
  });
  return await actionCreators.xincmn2json(filecontents);
};

//带分组名的文件名转文件名，字符串处理，'xxxx$yyyyy.xxx'拆分，如果有后缀也搞掉，反正都是json
export const raw_name2name = (raw_name) => {
  let group = 'NULL';
  let name = raw_name;
  let l = name.split("$");
  if(l.length === 2){
    group = l[0];
    name = l[1];
  }
  name = name.replace(".json","");
  name = name.replace(".xml","");
  return {
    group: group,
    name: name
  };
};
