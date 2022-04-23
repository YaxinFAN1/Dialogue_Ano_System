const defaultState = {
  userList: [], //用户列表
  currentPage: 1, //当前页
  loginUser: null, //当前登录用户
  allRoots: null, //当前登录用户权限
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'getUserData':
      const { userList, loginUser, allRoots } = action.value;
      return Object.assign({}, state, {userList: userList}, {loginUser: loginUser}, {allRoots: allRoots});
    case 'getRoots':
      const _state = Object.assign({},state);//先做一份浅拷贝
      const value = action.value;
      const _allRoots = _state.allRoots; //全权限对应列表
      let _userList = _state.userList;
      for(let i=0; i<value.length; i++){
        let _username = value[i].username; //su
        let res = [];
        //根据rootlist和__allroots识别并生成[]
        for(let j=0; j<value[i].rootList.length; j++){
          //value.rootlist[j];
          for(let k=0; k<_allRoots.length; k++){
            if(value[i].rootList[j] === _allRoots[k].id){
              res.push(_allRoots[k]);
            }
          }
        }
        for(let m=0; m<_userList.length; m++){
          if(_userList[m].username === _username){
            _userList[m].root = res;
          }
        }
      }
      return Object.assign({},state,{userList: [..._userList]});
    default:
      return state;
  }
};
