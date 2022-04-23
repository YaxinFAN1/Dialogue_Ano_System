import axios from 'axios';
import ApiUtil, {handleError} from "../../../utils/api";
import { toBatch} from "../../../utils/api";
import { message } from "antd";

//获取当前登录用户
export const getLoginUser = () => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_AUTH_WHOAMI,JSON.stringify(''),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 0){
            resolve(res.data[1]);
          }
          else{
            handleError(code,"获取当前登录用户错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获取当前登录用户错误！请检查您的网络！");
        reject();
      })
  });
};

//获取用户列表
export const getUserList = () => {
  return new Promise(async (resolve,reject) => {
    const newList = [];
    await axios.post(ApiUtil.API_USER_LISTALL,JSON.stringify(''),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          let usernames = res.data[1];
          if(code === 0){
            for(let i=0; i<usernames.length; i++){
              newList.push({
                key: (i+1).toString(),
                username: usernames[i],
                password: null,
                root: [],
              });
            }
            resolve(newList);
          }
          else{
            handleError(code,"获取用户列表错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获取用户列表错误！请检查您的网络！");
        reject();
      })
  });
};

//获取全权限表
export const getAllRoots = () => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_AUTH_GETPRIVLIST,JSON.stringify(''),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 0){
            resolve(res.data[1]);
          }
          else {
            handleError(code,"获取全权限表出错！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获取全权限表出错！");
        reject();
      })
  })
};

//一次性获取用户列表+当前用户+全权限列表并返回
export const getUserData = () => {
  return async (dispatch) => {
    return new Promise(async (resolve) => {
      let data = {userList: null, loginUser: null, allRoots: null};
      data.userList = await getUserList();
      data.loginUser = await getLoginUser();
      data.allRoots = await getAllRoots();
      dispatch({type: "getUserData", value: data});
      resolve();
    })
  }
};

//获取单个用户的权限(不传仓库)
export const getRoot = (username) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_USER_LISTPRIV,JSON.stringify(username),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("用户ID不存在！");
            reject();
          }
          else if(code === 0){
            resolve(res.data[1]);
          }
          else{
            handleError(code,"获取单个用户的权限(不传仓库)错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("获取单个用户的权限(不传仓库)错误！请检查您的网络！");
        reject();
      })
  })
};

//批量获取用户权限（传仓库）
export const getRoots = (usernames) => {
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      await axios.post(toBatch(ApiUtil.API_USER_LISTPRIV),JSON.stringify(usernames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
        .then(res => {
          let rootList = [];
          if(res.status === 200){
            for(let i=0; i<res.data.length; i++){
              const code = res.data[i][0];
              if(code === 1){
                message.error("用户ID不存在！");
                reject();
              }
              else if(code === 0){
                rootList.push({username: usernames[i], rootList: res.data[i][1]});
              }
              else{
                handleError(code,"批量获取用户权限错误！");
                reject();
              }
            }
            dispatch({type: "getRoots", value: rootList});
            resolve();
          }
        })
        .catch(err => {
          message.error("批量获取用户权限错误！请检查您的网络！");
          reject();
        })
    })
  }
};

//批量获取用户权限（不传仓库）
export const _getRoots = (usernames) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_USER_LISTPRIV),JSON.stringify(usernames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        let rootList = [];
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("用户ID不存在！");
              reject();
            }
            else if(code === 0){
              rootList.push({username: usernames[i], rootList: res.data[i][1]});
            }
            else{
              handleError(code,"批量获取用户权限错误！");
              reject();
            }
          }
          resolve(rootList);
        }
      })
      .catch(err => {
        message.error("批量获取用户权限错误！请检查您的网络！");
        reject();
      })
  })
};

//创建新用户
const createUser = (newuser) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_USER_CREATE,JSON.stringify(newuser),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("ID已被占用！");
            reject();
          }
          else if(code === 0) resolve();
          else{
            handleError(code,"创建新用户错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("创建新用户错误！请检查您的网络！");
        reject();
      })

  });
};

//收回单个用户多个权限
const rootsFromSingle = (deleteRoots) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_USER_REVOKEPRIV),JSON.stringify(deleteRoots),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("用户ID不存在！");
              reject();
            }
            else if(code === 0){

            }
            else{
              handleError(code,"收回单个用户多个权限错误！");
              reject();
            }
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("收回单个用户多个权限错误！请检查您的网络！");
        reject();
      })
  });
};

//给与单个用户多个权限
const roots2single = (userdisplay) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_USER_GRANTPRIV),JSON.stringify(userdisplay),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("用户ID不存在！");
              reject();
            }
            else if(code === 0){

            }
            else{
              handleError(code,"给予单个用户多个权限错误！");
              reject();
            }
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("给予单个用户多个权限错误！请检查您的网络！");
        reject();
      })
  });
};

//创建单个新用户的总的步骤
export const createNewUser = (newuser) => {
  return new Promise(async (resolve,reject) => {
    //创建用户，再分配权限，两步
    await createUser({id: newuser.username, pw: newuser.password});
    let userdisplay = [];
    newuser.root.forEach(item => {
      userdisplay.push({uid: newuser.username, pid: item});
    });
    await roots2single(userdisplay);
    resolve(0);
  })
};

//批量删除用户
export const deleteUsers = (usernames) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(toBatch(ApiUtil.API_USER_DELETE),JSON.stringify(usernames),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          for(let i=0; i<res.data.length; i++){
            const code = res.data[i][0];
            if(code === 1){
              message.error("用户ID不存在！");
              reject();
            }
            else if(code === 0){

            }
            else{
              handleError(code,"批量删除用户错误！");
              reject();
            }
          }
          resolve();
        }
      })
      .catch(err => {
        message.error("批量删除用户错误！请检查您的网络！");
        reject();
      })
  });
};

//修改单个用户名
export const editUsername = (username) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_USER_RENAME,JSON.stringify(username),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("原ID不存在！");
            reject();
          }
          else if(code === 2){
            message.error("现ID已被占用！");
            reject();
          }
          else if(code === 0){
            resolve();
          }
          else {
            handleError(code,"修改单个用户名错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("修改单个用户名错误！请检查您的网络！");
        reject();
      })
  });
};

//修改单个用户密码
export const editPassword = (password) => {
  return new Promise(async (resolve,reject) => {
    await axios.post(ApiUtil.API_USER_SETPW,JSON.stringify(password),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 1){
            message.error("用户不存在！");
            reject();
          }
          else if(code === 0){
            resolve();
          }
          else{
            handleError(code,"修改单个用户密码错误！");
            reject();
          }
        }
      })
      .catch(err => {
        message.error("修改单个用户密码错误！请检查您的网络！");
        reject();
      })
  });
};

//修改用户权限的总的步骤
export const editRoots = (roots) => {
  return new Promise(async (resolve,reject) => {
    let newRoots = roots.roots;
    //如果没有任何权限，直接不改
    if(newRoots.length === 0) resolve();
    else{
      let curRoots = await getRoot(roots.id);
      let addRoots = [];
      let deleteRoots = [];
      newRoots.map((item) => {
        if(!curRoots.includes(item)){
          addRoots.push({uid: roots.id, pid: item});
        }
      });
      curRoots.map((item) => {
        if(!newRoots.includes(item)){
          deleteRoots.push({uid: roots.id, pid: item});
        }
      });
      if(addRoots.length !== 0){
        await roots2single(addRoots);
      }
      if(deleteRoots.length !== 0){
        await rootsFromSingle(deleteRoots);
      }
      resolve();
    }
  })
};
