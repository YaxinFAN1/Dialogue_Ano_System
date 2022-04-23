import {message} from "antd";

export const identify = (userRoots) => {
  //返回-1代表这个用户没有人权，0代表游客级，1代表标注员/审核员级，2代表管理员级
  let touristRoots = 0;
  let workerRoots = 0;
  let adminRoots = 0;
  if(userRoots.length === 25){
    return 2;
  }
  else{
    for(let i=0; i<userRoots.length; i++){
      switch (userRoots[i]) {
        case 'ZKVRlgfdpAZ2Mpn4':
          //检索所有语料
          touristRoots += 1;
          workerRoots += 1;
          adminRoots += 1;
          break;
        case 'oOfUyJvoV0v6ZnAW':
          //读取语料数据
          touristRoots += 1;
          workerRoots += 1;
          adminRoots += 1;
          break;
        case 'Hw213MpvhthM18HW':
          //使用格式化器的权限
          workerRoots += 1;
          adminRoots += 1;
          break;
        case 'ZKV5lgfdpaZ2Mpn4':
          //检索所有生语料
          workerRoots += 1;
          adminRoots += 1;
          break;
        case 'oOfUyJvqV0v6ZlAW':
          //读取生语料数据
          workerRoots += 1;
          adminRoots += 1;
          break;
        case 'OG8xriafxRivmTwP':
          //列出所有任务
          workerRoots += 1;
          adminRoots += 1;
        default:
          adminRoots += 1;
      }
    }
    if(touristRoots < 2){
      message.warning("此用户没有人权！建议重开。");
      return -1;
    }
    if(workerRoots < 6){
      //游客
      return 0;
    }
    if(adminRoots < 25){
      //审核或标注
      return 1;
    }
  }
};
