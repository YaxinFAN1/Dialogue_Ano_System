import React, {Component, useState} from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { connect } from "react-redux";

import { actionCreators } from "../../Users/Mytask/store";


const UploadAuditCreateForm = ({ visible, onCreate, onCancel, record }) => {
  const [form] = Form.useForm();
  form.setFieldsValue({
    target: record.filename,
    group: "新分组",
  });
  return (
    <Modal
      visible={visible}
      title="设置文件入库ID"
      okText="确认"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
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
          target: record.filename
        }}
      >

        <Form.Item
          name="target"
          label="文件入库ID"
          rules={[
            {
              required: true,
              message: '填写符合约束的语料名',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="group"
          label="新的分组"
        >
          <Input />
        </Form.Item>

        <div>提醒：一旦上传将无法再对其进行修改！请确认后再上传。</div>
      </Form>
    </Modal>
  );
};

const UploadAuditPage = (props) => {
  const [visible, setVisible] = useState(false);//定义初始状态

  const { record, commitInspection, refresh } = props;
  const onCreate = async (values) => {
/*    if(record.filename === "未知文件"){
      message.error("请先选择一份审核文件！");
    }
    else if(record.onUpload === null || (record.onUpload.discourse.topic === '【新语料】')){
      message.error("待上传结果为空！请先审核再上传！");
    }
    else{
      if(await commitInspection({tid: record.taskname, fid: record.filename})){

        message.success("提交成功！");
        refresh();
      }
      else message.error("提交失败！");
    }*/
    message.info("功能开发中！");
    setVisible(false);
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setVisible(true);
        }}
      >
        提交成果
      </Button>
      <UploadAuditCreateForm
        record={props.record}
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

class UploadAudit extends Component {


  render() {
    const { record, commitInspection, refresh } = this.props;

    return (
      <div>
        <UploadAuditPage
          record={record}
          commitInspection={commitInspection}
          refresh={refresh}
        />
      </div>
    );
  }
}

const mapDispatchToProps = () => {
  return {
    commitInspection(result){
      //提交审核成果
      return new Promise(async (resolve) => {
        resolve(await actionCreators.commitInspection(result));
      })
    }
  }
};


export default connect(mapDispatchToProps)(UploadAudit);
