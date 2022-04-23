const defaultState = {
  corpusList: [], //熟语料列表
  currentCorpus: {
    corpusname: null,
    corpusContent: null,
    raw_corpusname: null,
  }, //当前熟语料内容
  currentPage: 1, //所有熟语料列表当前页面统一
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'getCorpusList':
      return Object.assign({},state,{corpusList: action.value});
    case 'getCorpusContent':
      return  Object.assign({},state,{currentCorpus: action.value});
    case 'getCorpusProps':
      let _state = {...state};//先做一份浅拷贝
      for(let i=0; i<action.value.length; i++){
        let ccorpusList = JSON.stringify(_state.corpusList);
        let actionData = JSON.stringify(action.value[i]);
        //定义要替换的字符串
        let re = new RegExp("{\"key\":" + JSON.stringify(action.value[i].key) + "[^}]+}");
        let new_ccorpusList = ccorpusList.replace(re,actionData);
        let new_corpusList = JSON.parse("{\"corpusList\":" + new_ccorpusList + "}").corpusList;
        _state = Object.assign(_state, {corpusList: new_corpusList});
      }
      //必须根据根据action.key的值找到对应的stockList的值，但是有可能是乱的，不是随机的，不过好像可以用展开运算符
      return _state;
    case 'savePage':
      return Object.assign({},state,{currentPage: action.value});
    default:
      return state;
  }
};
