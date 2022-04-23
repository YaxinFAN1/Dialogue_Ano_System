export const makeRowSelection = (_this, dataSource) => {
  const { selectedRowKeys, currentDataSource } = _this.state;
  let list = [];
  let newSelectedRowKeys;
  if(currentDataSource.length === 0){
    for(let i=1; i<=dataSource.length; i++){
      list.push(JSON.stringify(i));
    }
  }
  else{
    for(let i=0; i<currentDataSource.length; i++){
      list.push(currentDataSource[i].key);
    }
  }
  return {
    selectedRowKeys,
    onChange: _this.onSelectChange,
    selections: [
      {
        key: 'selectall',
        text: '全选',
        onSelect: changableRowKeys => {
          newSelectedRowKeys = list.filter((key, index) => {
            return true;
          });
          _this.setState({ selectedRowKeys: newSelectedRowKeys });
        },
      },
      {
        key: 'clear',
        text: '全不选',
        onSelect: changableRowKeys => {
          newSelectedRowKeys = list.filter((key, index) => {
            return false;
          });
          _this.setState({ selectedRowKeys: newSelectedRowKeys });
        },
      },
      {
        key: 'pageinvert',
        text: '本页反选',
        onSelect: changableRowKeys => {
          //是异或逻辑
          newSelectedRowKeys = list.filter((key, index) => {
            return !!(selectedRowKeys.includes(key) ^ changableRowKeys.includes(key));
          });
          _this.setState({ selectedRowKeys: newSelectedRowKeys });
        },
      },
      {
        key: 'allinvert',
        text: '全部反选',
        onSelect: changableRowKeys => {
          newSelectedRowKeys = list.filter((key, index) => {
            return !selectedRowKeys.includes(key);
          });
          _this.setState({ selectedRowKeys: newSelectedRowKeys });
        },
      },
    ],
  };
};

