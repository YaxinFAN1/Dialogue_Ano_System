import axios from 'axios';
import ApiUtil, { handleError } from "../../utils/api";
import { message } from 'antd';
import { getAllRoots, getRoot } from "../../Users/UMGT/store/actionCreators";

//获取当前登录状态及用户
export const getLoginState = () => {
  let loginState = false;
  let username = null;
  let roots = {allRoots: [], userRoots: []};
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      await axios.post(ApiUtil.API_AUTH_WHOAMI, JSON.stringify(''),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
        .then(res => {
          if(res.status === 200){
            const code = res.data[0];
            if(code === 0){
              loginState = true;
              username = res.data[1];
            }
            else if(code === 1){
              //未登录
            }
            else{
              handleError(code,"获取当前登录状态及用户错误！");
              resolve(false);
            }
          }
        })
        .catch(err => {
          message.error("获取登录状态及用户错误！请检查您的网络！");
          resolve(false);
        });
      if(loginState === true){
        roots = await getRoots(username);
      }
      dispatch({type: 'get_user', value: {loginState: loginState, username: username, allRoots: roots.allRoots, userRoots: roots.userRoots}});
      resolve(true);
    })
  }
};

//登录
export const login = (data) => {
  let loginState = false;
  let username = null;
  let roots = {allRoots: [], userRoots: []};
  return async (dispatch) => {
    return new Promise(async (resolve,reject) => {
      await axios.post(ApiUtil.API_AUTH_LOGIN,JSON.stringify(data),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
        .then(res => {
          if(res.status === 200){
            const code = res.data[0];
            if(code === 0){
              message.success("登录成功！");
              loginState = true;
              username = data.id;
            }
            else if(code === 1){
              message.error("账号或密码无效！");
              resolve(false);
            }
            else if(code === 2) {
              message.error("请勿重复登录！");
              loginState = true;
            }
            else{
              handleError(code,"登录错误！");
              resolve(false);
            }
          }
        })
        .catch(err => {
          message.error("登录错误!请检查您的网络！");
          resolve(false);
        });
      if(loginState === true){
        roots = await getRoots(username);
      }
      dispatch({type: 'get_user', value: {loginState: loginState, username: username, allRoots: roots.allRoots, userRoots: roots.userRoots}});
      resolve(true);
    })
  }
};

//登出
export const logout = () => {
  return (dispatch) => {
    axios.post(ApiUtil.API_AUTH_LOGOUT,JSON.stringify(''),{headers:{'Content-Type': 'application/json;charset=utf-8'}})
      .then(res => {
        if(res.status === 200){
          const code = res.data[0];
          if(code === 0){
            message.success("登出成功！");
            //dispatch({type: 'change_state', value: {state: false, username: null}});
            dispatch({type: 'reset_app', value: {state: false, username: null}});
          }
          else if(code === 1) message.error("用户未登录！请返回登录页面重新登录！");
          else{
            handleError(code,"登出错误！");
          }
        }
      })
      .catch(err => {
        message.error("登出错误!请检查您的网络！");
      })
  }
};

//获取全权限表以及用户权限
export const getRoots = (username) => {
  return new Promise(async (resolve,reject) => {
    const allRoots = await getAllRoots();
    const userRoots = await getRoot(username);
    resolve({allRoots: allRoots, userRoots: userRoots});
  })
};
