import React, {Component} from 'react';
import { Upload, Button, message, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

class UploadButtons extends Component {
  state = {
    fileList1: [], //用来保存当前渲染在屏幕上的文件
    fileList2: [],
    fileData1: [], //用来保存当前所有文件
    fileData2: [],
    disabled1: false, //是否禁用，当另一个上传按钮有文件时为true，没有时为false
    disabled2: false,
    remove1: false, //当前操作是否为删除操作
    remove2: false,
  };

  render() {
    const props1 = {
      onRemove: this.handleRemove1,
      onChange: this.handleChange1,
      multiple: "true",
      disabled: this.state.disabled1,
      beforeUpload: file => {
        return false;
      },
    };
    const props2 = {
      onRemove:this.handleRemove2,
      onChange: this.handleChange2,
      directory: "true",
      disabled: this.state.disabled2,
      beforeUpload: file => {
        return false;
      },
    };

    return (
      <Space direction="vertical" size="middle" align="begin">
        <Upload {...props1} fileList={this.state.fileList1}>
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
        {'或者'}
        <Upload {...props2} fileList={this.state.fileList2}>
          <Button icon={<UploadOutlined />}>选择文件夹</Button>
        </Upload>
      </Space>
    );
  }

  handleChange1 = (current) => {
    const { onChange } = this.props;
    const {  fileData1, remove1 } = this.state;
    const curList = [...current.fileList];

    if(remove1 === true){
      //当前操作为删除操作，取后五个
      let newfileList1 = [...fileData1];
      newfileList1 = newfileList1.slice(-5);
      if(curList.length === 0){
        //全部删完了，开上传2的锁
        this.setState({fileList1: newfileList1, disabled2: false, remove1: false});
      }
      else {
        this.setState({fileList1: newfileList1, remove1: false});
      }
      onChange(fileData1);
    }
    else{
      if(curList.length === fileData1.length){
        //批量添加文件操作，只对第一次调用该函数进行setState操作，因为后面都只是改变了current.file，这里我们并不关心单个文件。
      }
      else{
        //有可能是批量增加或者减少一个，修改fileData1和展示的fileList1
        let newfileList1 = [...curList];
        newfileList1 = newfileList1.slice(-5);
        if(fileData1.length === 0){
          //这里一定是上传1和上传2都没有文件的情况，需要锁上传2
          this.setState({fileData1: curList, fileList1: newfileList1, disabled2: true});
        }
        else{
          //不需要改变锁的状态
          this.setState({fileData1: curList, fileList1: newfileList1});
        }
      }
      onChange(curList);
    }
  };

  handleChange2 = (current) => {
    const { onChange } = this.props;
    const { fileData2, remove2 } = this.state;
    const curList = [...current.fileList];

    if(remove2 === true){
      //当前操作为删除操作，取后五个
      let newfileList2 = [...fileData2];
      newfileList2 = newfileList2.slice(-5);
      if(curList.length === 0){
        //全部删完了，开上传1的锁
        this.setState({fileList2: newfileList2, disabled1: false, remove2: false});
      }
      else {
        this.setState({fileList2: newfileList2, remove2: false});
      }
      onChange(fileData2);
    }
    else{
      if(curList.length === fileData2.length){
        //批量添加文件操作，只对第一次调用该函数进行setState操作，因为后面都只是改变了current.file，这里我们并不关心单个文件。
      }
      else{
        //有可能是批量增加或者减少一个，修改fileData2和展示的fileList2
        let newfileList2 = [...curList];
        newfileList2 = newfileList2.slice(-5);
        if(fileData2.length === 0){
          //这里一定是上传1和上传2都没有文件的情况，需要锁上传1
          this.setState({fileData2: curList, fileList2: newfileList2, disabled1: true});
        }
        else{
          //不需要改变锁的状态
          this.setState({fileData2: curList, fileList2: newfileList2});
        }
      }
      onChange(curList);
    }
  };

  handleRemove1 = async (file) => {
    const { fileData1 } = this.state;
    //定位在fileData1中的位置，并去除该位置的文件
    const index = fileData1.indexOf(file);
    const newfileData1 = fileData1.slice();
    newfileData1.splice(index, 1);
    //重新取得后五个文件
    let newfileList1 = [...newfileData1];
    newfileList1 = newfileList1.slice(-5);
    return new Promise(async (resolve) => {
      await this.setState({fileData1: newfileData1, fileList1: newfileList1, remove1: true});
      resolve(true);
    });
  };

  handleRemove2 = async (file) => {
    const { fileData2 } = this.state;
    //定位在fileData2中的位置，并去除该位置的文件
    const index = fileData2.indexOf(file);
    const newfileData2 = fileData2.slice();
    newfileData2.splice(index, 1);
    //重新取得后五个文件
    let newfileList2 = [...newfileData2];
    newfileList2 = newfileList2.slice(-5);
    return new Promise(async (resolve) => {
      await this.setState({fileData2: newfileData2, fileList2: newfileList2, remove2: true});
      resolve(true);
    });
  };

}

export default UploadButtons;
