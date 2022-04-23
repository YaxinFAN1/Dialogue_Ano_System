const defaultState = {
  loginState: false, //登录状态
  username: '', //当前登录用户
  allRoots: [], //全权限表
  userRoots: [], //当前用户权限表
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'change_state':
      return {loginState: action.value.state, username: action.value.username, allRoots: [], userRoots: []};
    case 'get_user':
      return action.value;
    case 'reset_app':
      return {loginState: action.value.state, username: action.value.username, allRoots: [], userRoots: []};
    default:
      return state;
  }
};
