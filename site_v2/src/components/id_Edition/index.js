import React, {Component, useState} from 'react';
import {Button, Form, Input, message, Modal, Radio} from "antd";
import { EditOutlined  } from "@ant-design/icons";
import { connect } from "react-redux";

const ID_EditionCreateForm = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  form.setFieldsValue({

  });
  return (
    <Modal
      visible={visible}
      title="批量修改入库ID"
      okText="修改"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form.validateFields()
          .then((values) => {
            onCreate(values);
          })
          .catch((info) => {
            alert("条件不满足！");
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{

        }}
      >

        <Form.Item
          name="test"
        >
          <Input />
        </Form.Item>

      </Form>
    </Modal>
  );
};

const ID_EditionPage = (props) => {
  const [visible, setVisible] = useState(false);

  const onCreate = async (values) => {
    console.log("修改入库ID");
    setVisible(false);
  };

  return (
    <div>
      <Button
        icon={<EditOutlined />}
        onClick={() => {
          setVisible(true);
        }}
        size="large"
      >
        批量修改入库ID
      </Button>
      <ID_EditionCreateForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

class ID_Edition extends Component {
  render() {
    return (
      <div>
        <ID_EditionPage

        />
      </div>
    );
  }
}


export default ID_Edition;
