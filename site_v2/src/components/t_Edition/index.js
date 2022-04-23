import React, {Component, useState} from 'react';
import {Button, Form, Input, message, Modal, Radio} from "antd";
import { connect } from "react-redux";

import { actionCreators } from "../../Users/TMGT/store";
import PeopleSelector from "../peopleSelector";

const T_EditionCreateForm = ({ visible, onCreate, onCancel, rootsList, record }) => {
  const [form] = Form.useForm();
  form.resetFields();
  form.setFieldsValue({
    filetype: "xml",
    taskname: record.taskname,
    auditor: record.auditor,
    annotators: record.annotators
  });
  return (
    <Modal
      visible={visible}
      title="修改"
      okText="修改"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form.validateFields()
          .then((values) => {
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
          filetype: "xml",
          taskname: record.taskname,
          auditor: record.auditor,
          annotators: record.annotators
        }}
      >

        <Form.Item
          name='taskname'
          label='修改任务名'
          rules={[
            {
              required: true,
              message: '必须有一个任务名！！',
            },
          ]}
        >
          <Input defaultValue={record.taskname} />
        </Form.Item>

        <Form.Item
          name="auditor"
          label="修改审核员"
          rules={[
            {
              required: true,
              message: '必须分配审核员！',
            },
          ]}
        >
          <PeopleSelector
            people="auditor"
            rootsList={rootsList}
            default={record.auditor}
          />
        </Form.Item>

        <Form.Item
          name="annotators"
          label="修改标注员"
          rules={[
            {
              required: true,
              message: '必须分配标注员！',
            },
          ]}
        >
          <PeopleSelector
            people="annotators"
            rootsList={rootsList}
            default={record.annotators}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
};

const T_EditionPage = ({ record, rootsList, renameTask, setInspector, editAnnotators, refresh }) => {
  const [visible, setVisible] = useState(false);

  const onCreate = async (values) => {
    //修改任务。修改任务名，修改审核员，修改标注员
    if(values.taskname !== record.taskname){
      await renameTask({old_id: record.taskname, new_id: values.taskname});
    }
    if(values.auditor !== record.auditor){
      await setInspector({tid: record.taskname, uid: values.auditor});
    }
    //标注员
    await editAnnotators({taskname: values.taskname, oldAnnotators: record.annotators, newAnnotators: values.annotators});
    message.success("修改成功！");
    setVisible(false);
    refresh();
  };

  return (
    <div>
      <Button
        type="link"
        onClick={() => {
          setVisible(true);
        }}
        size="middle"
      >
        修改
      </Button>
      <T_EditionCreateForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
        rootsList={rootsList}
        record={record}
      />
    </div>
  );
};

class T_Edition extends Component {
  render() {
    const { record, renameTask, setInspector, editAnnotators, refresh, rootsList } = this.props;
    return (
      <div>
        <T_EditionPage
          rootsList={rootsList}
          record={record}
          renameTask={renameTask}
          setInspector={setInspector}
          editAnnotators={editAnnotators}
          refresh={refresh}
        />
      </div>
    );
  }
}

const mapDispatchToProps = () => {
  return {
    renameTask(taskname){
      return new Promise(async (resolve) => {
        await actionCreators.renameTask(taskname);
        resolve();
      })
    },
    setInspector(inspector){
      return new Promise(async (resolve) => {
        await actionCreators.setInspector(inspector);
        resolve();
      })
    },
    editAnnotators(annotators){
      return new Promise(async (resolve) => {
        await actionCreators.editAnnotators(annotators);
        resolve();
      })
    }
  }
};

export default connect(mapDispatchToProps)(T_Edition);
