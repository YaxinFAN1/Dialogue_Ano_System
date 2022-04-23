import React, {Component, useState} from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { connect } from "react-redux";

import { actionCreators } from "../../Users/CMGT/store";


const C_EditionCreateForm = ({ visible, onCreate, onCancel, corpusname, group }) => {
  const [form] = Form.useForm();
  form.setFieldsValue({
    corpusname: corpusname,
    group: group
  });
  return (
    <Modal
      visible={visible}
      title="修改文件名"
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
          corpusname: corpusname,
          group: group
        }}
      >

        <Form.Item
          name="corpusname"
          label="新的语料名"
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
          rules={[
            {
              required: true,
              message: '填写符合约束的分组名',
            },
          ]}
        >
          <Input />
        </Form.Item>

      </Form>
    </Modal>
  );
};

const C_EditionPage = (props) => {
  const [visible, setVisible] = useState(false);//定义初始状态

  const onCreate = async (values) => {
    const variedname = values.group + '$' + values.corpusname; //修改后的名字
    if(await props.editCorpusName({"old_id": props.raw_corpusname, "new_id": variedname})){
      message.success("修改成功！");
    }
    else message.error("修改失败！");
    setVisible(false);
    props.refresh();
  };

  return (
    <div>
      <Button
        type="link"
        onClick={() => {
          setVisible(true);
        }}
      >
        修改
      </Button>
      <C_EditionCreateForm
        corpusname={props.corpusname}
        group={props.group}
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

class C_Edition extends Component {


  render() {
    const { corpusname, group, editCorpusName, refresh, raw_corpusname } = this.props;

    return (
      <div>
        <C_EditionPage
          corpusname={corpusname}
          group={group}
          refresh={refresh}
          editCorpusName={editCorpusName}
          raw_corpusname={raw_corpusname}
        />
      </div>
    );
  }
}

const mapDispatchToProps = () => {
  return {
    editCorpusName(corpusname){
      return new Promise(async (resolve) => {
        resolve(await actionCreators.editCorpusName(corpusname));
      })
    }
  }
};


export default connect(mapDispatchToProps)(C_Edition);
