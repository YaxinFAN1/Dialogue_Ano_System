import React, {Component} from 'react';
import { Upload, Button, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

class UploadButton extends Component {
  state = {
    fileList: [],
  };

  render() {
    const { onChange, value } = this.props;
    const props = {
      onRemove: async file => {
        await this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      onChange: (e) => {
        let fileList = [...e.fileList];
        fileList = fileList.slice(-5);
        this.setState({ fileList });
        //下面这个函数被声明是异步的，就不做
        onChange(e);
      },
      value,
      beforeUpload: file => {
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
    };
    return (
      <Space direction="vertical" size="middle" align="begin">
        <Upload {...props} fileList={this.state.fileList}>
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
      </Space>
    );
  }
}

export default UploadButton;
