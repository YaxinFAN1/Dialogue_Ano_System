import React, {Component} from 'react';
import {TreeSelect} from "antd";


const { SHOW_PARENT } = TreeSelect;

const treeData = [
  {
    title: '用户管理',
    value: '0-0',
    children: [
      {
        title: "列出所有用户",
        value: "UBQb1oTHsbwqEJCG",
      },
      {
        title: '创建新用户',
        value: 'W1SPvCCWvX9p9MFB',
      },
      {
        title: '删除用户',
        value: 'B9bUFFb3VuslaBhI',
      },
      {
        title: "获取其它用户数据",
        value: "B9bUFFkkkVuslaBh",
      },
      {
        title: "修改其它用户数据",
        value: "B9bUkse3VuslaBhI",
      },
      {
        title: '授予权限',
        value: 'QbByIZVjk6MPklMB',
      },
      {
        title: '收回权限',
        value: 'XQN8rVYaqlZUmD9s',
      },
    ],
  },
  {
    title: '语料库管理',
    value: '0-1',
    children: [
      {
        title: '检索所有语料',
        value: 'ZKVRlgfdpAZ2Mpn4',
      },
      {
        title: '创建新语料',
        value: 'bbebdBag0gFjS9zv',
      },
      {
        title: '删除语料',
        value: 'bFGvGdoBxgCi9qTI',
      },
      {
        title: '重命名语料',
        value: 'd3YNThU2UlyIbNTc',
      },
      {
        title: '读取语料数据',
        value: 'oOfUyJvoV0v6ZnAW',
      },
      {
        title: '修改语料数据',
        value: 'oHSwzmthd7jiSfqq',
      },
    ],
  },
  {
    title: '使用格式化器的权限',
    value: '0-2',
    children: [
      {
        title: '使用格式化器的权限',
        value: 'Hw213MpvhthM18HW',
      },
    ],
  },
  {
    title: '生语料管理',
    value: '0-3',
    children: [
      {
        title: '检索所有生语料',
        value: 'ZKV5lgfdpaZ2Mpn4',
      },
      {
        title: '创建新生语料',
        value: 'bbebdaag0gFdS9zv',
      },
      {
        title: '删除生语料',
        value: 'bFGvGeoBxgC39qTI',
      },
      {
        title: '重命名生语料',
        value: 'd3YNTcU2UlyqbNTc',
      },
      {
        title: '读取生语料数据',
        value: 'oOfUyJvqV0v6ZlAW',
      },
      {
        title: "修改生语料数据",
        value: "oHSwzmthd7jiqfqq",
      },
    ],
  },
  {
    title: '任务管理',
    value: '0-4',
    children: [
      {
        title: "列出所有任务",
        value: "OG8xriafxRivmTwP"
      },
      {
        title: "读取其它用户数据",
        value: "kNKLgjX5mRAtsF1k"
      },
      {
        title: "创建任务",
        value: "MeHtX5ziqXYFvBZe"
      },
      {
        title: "删除任务",
        value: "MeHtX5ziqXYFqsZe"
      },
      {
        title: "修改任务",
        value: "MekxX5ziqXYFvBZe"
      },
    ],
  },
];


class RootSelect extends Component {
  state = {
    value: [],
  };

  render() {
    const { onChange } = this.props;
    const tProps = {
      treeData,
      value: this.state.value,
      onChange: (value) => {
        let _value = [];
        for(let i=0; i<value.length; i++){
          switch (value[i]) {
            case '0-0': {
              for(let j=0; j<treeData[0].children.length; j++){
                _value.push(treeData[0].children[j].value);
              }
              break;
            }
            case '0-1': {
              for(let j=0; j<treeData[1].children.length; j++){
                _value.push(treeData[1].children[j].value);
              }
              break;
            }
            case '0-2': {
              for(let j=0; j<treeData[2].children.length; j++){
                _value.push(treeData[2].children[j].value);
              }
              break;
            }
            case '0-3': {
              for(let j=0; j<treeData[3].children.length; j++){
                _value.push(treeData[3].children[j].value);
              }
              break;
            }
            case '0-4': {
              for(let j=0; j<treeData[4].children.length; j++){
                _value.push(treeData[4].children[j].value);
              }
              break;
            }
            default: {
              _value.push(value[i]);
            }
          }
        }
        this.setState({ value: _value });
        onChange(_value);
      },
      treeCheckable: true,
      showCheckedStrategy: SHOW_PARENT,
      placeholder: '请选择',
      style: {
        width: '100%',
      },
    };

    return <TreeSelect {...tProps} />;
  }
}

export default RootSelect;
