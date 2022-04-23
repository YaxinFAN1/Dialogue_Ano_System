import React, {Component, useState} from 'react';
import {Button, Form, Input, Modal, Radio, message} from "antd";
import { DownloadOutlined } from '@ant-design/icons';
import {connect} from "react-redux";

import { actionCreators } from '../../Users/CMGT/store';


const DownloadCreateForm = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      visible={visible}
      title="自定义下载"
      okText="下载"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form.validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          zipname: '语料压缩包',
          filetype: 'xml',
        }}
      >

        <Form.Item
          name="zipname"
          label="压缩包命名"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="filetype"
          label="文件类型"
          className="collection-create-form_last-form-item"
          rules={[
            {
              required: true,
              message: '选择打包下载的文件格式',
            },
          ]}
        >
          <Radio.Group defaultValue="xml">
            <Radio value="json">.json</Radio>
            <Radio value="xml">.xml</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const DownloadPage = (props) => {
  const [visible, setVisible] = useState(false);

  //下载的主函数
  const onCreate = async (values) => {
    if(props.selectedCorpuses.length === 0){
      message.error("至少选中一项！");
      return;
    }
    if(values.zipname === ''){
      values.zipname = "语料压缩包";
    }
    const dnstate = await download(props.selectedCorpuses,props.dataSource,values.zipname,values.filetype);
    if(dnstate === 0) message.success("下载成功！");
    else message.error("下载失败！");
    setVisible(false);
    props.refresh();
  };

  //触发压缩下载
  const download = async (selectedRowKeys,corpusList,zipname,filetype) => {
    let filenames = [];
    for(let i=0;i<selectedRowKeys.length;i++) filenames.push(corpusList[selectedRowKeys[i]-1].raw_corpusname);

    return new Promise(async (resolve) => {
      resolve(await props.zipDownloadCorpuses(filenames,zipname,filetype));//存储待打包的熟语料名数组和包的名称
    });
  };


  return (
    <div>
      <Button
        size="large"
        icon={<DownloadOutlined />}
        onClick={() => {
          setVisible(true);//打开表单
        }}
      >
        下载
      </Button>
      <DownloadCreateForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

class DownloadForm extends Component {
  render() {
    const { selectedRowKeys, dataSource, zipDownloadCorpuses, refresh } = this.props;
    return (
      <div>
        <DownloadPage
          selectedCorpuses={selectedRowKeys}
          dataSource={dataSource}
          zipDownloadCorpuses={zipDownloadCorpuses}
          refresh={refresh}
        />
      </div>
    );
  }
}

const mapDispatchToProps = () => {
  return {
    zipDownloadCorpuses(corpusnames,zipname,filetype) {
      //批量打包熟语料文件
      return new Promise(async (resolve) => {
        resolve(await actionCreators.zipDownloadCorpuses(corpusnames,zipname,filetype));
      });
    },
  }
};

export default connect(mapDispatchToProps)(DownloadForm);

