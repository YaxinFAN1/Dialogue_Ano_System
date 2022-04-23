import React, {Component, useState} from 'react';
import {Button, Form, Input, message, Modal, Tooltip} from "antd";
import { QuestionCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import {connect} from "react-redux";

import { actionCreators } from "../../Users/UMGT/store";
import RootSelect from "../rootselect";


const NewUserCreateForm = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  form.resetFields();
  return (
    <Modal
      visible={visible}
      title="创建新用户"
      okText="创建"
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
      >

        <Form.Item
          name="username"
          label={
            <span>
            填写用户名&nbsp;
              <Tooltip title="你的唯一ID。">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
          }
          rules={[
            {
              required: true,
              message: '必须有一个用户名！',
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="填写密码"
          rules={[
            {
              required: true,
              message: '必须有一个密码！',
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="确认密码"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: '请再确认一次密码！',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('两次输入密码不一致！');
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="root"
          label="权限"
          rules={[
            {
              required: true,
              message: '分配该用户所拥有的权限',
            },
          ]}
        >
          <RootSelect />
        </Form.Item>

      </Form>
    </Modal>
  );
};

const NewUserPage = (props) => {
  const [visible, setVisible] = useState(false);

  const onCreate = async (values) => {
    if(values.root.length === 0){
      message.error("至少选择一项权限！");
    }
    else{
      const newstate = await props.createNewUser(values);
      if(newstate === 0) message.success("创建成功！");
      else message.error("创建失败！");
      setVisible(false);
      props.refresh();
    }
  };

  return (
    <div>
      <Button
        size="large"
        icon={<UserAddOutlined />}
        onClick={() => {
          setVisible(true);//打开表单
        }}
      >
        创建新用户
      </Button>
      <NewUserCreateForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

class NewUser extends Component {

  //创建单个新用户
  createNewUser = (newuser) => {
    return new Promise(async (resolve) => {
      resolve(await this.props.createNewUser(newuser));
    });
  };

  render() {
    return (
      <div>
        <NewUserPage
          createNewUser={this.createNewUser}
          refresh={this.props.refresh}
        />
      </div>
    );
  }
}

const mapDispatchToProps = () => {
  return {
    createNewUser(newuser){
      return new Promise(async (resolve) => {
        resolve(await actionCreators.createNewUser(newuser));
      });
    }
  }
};

export default connect(mapDispatchToProps)(NewUser);
