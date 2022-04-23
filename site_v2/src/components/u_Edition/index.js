import React, {Component, useState} from 'react';
import {Button, Form, Input, message, Modal, Tooltip} from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import {connect} from "react-redux";
import { Redirect } from 'react-router-dom';

import RootSelect from "../rootselect";
import { actionCreators } from "../../Users/UMGT/store";


//修改用户信息
const U_EditionCreateForm = ({ visible, onCreate, onCancel, defaultname }) => {
  const [form] = Form.useForm();
  form.setFieldsValue({
    username: defaultname
  });
  return (
    <Modal
      visible={visible}
      title="修改"
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
          username: defaultname
        }}
      >

        <Form.Item
          name="username"
          label={
            <span>
            新的用户名&nbsp;
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
          label={
            <span>
            新的密码&nbsp;
              <Tooltip title="此项可不填">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
          }
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="root"
          label={
            <span>
            新的权限&nbsp;
              <Tooltip title="如果选择了0项，默认不做修改；否则此处选择的权限将覆盖原权限。友情提示：如果你是管理员，建议谨慎取消勾选“用户管理权限”，否则你将不能再进行用户管理操作。">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
          }
        >
          <RootSelect />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const U_EditionPage = (props) => {
  const [visible, setVisible] = useState(false);//定义初始状态

  const onCreate = async (values) => {
    if(props.username === 'su'){
      message.error("无权限修改超级管理员su！");
      return ;
    }
    if(props.username === props.loginUser){
      //对自己进行修改
      //先改密码，否则会因为用户名被修改可能出问题
      if(typeof (values.password) !== 'undefined'){
        await props.editPassword({id: props.username, pw: values.password});
      }
      //再改权限，同样防止用户名修改的问题
      if(typeof (values.root) == 'undefined'){
        values.root = [];
      }
      else {
        message.warning("WARNING！你正在修改自己的权限！友情提醒：管理员去掉任意权限后，都将不能再访问用户管理界面。");
      }
      await props.editRoots({id: props.username, roots: values.root});
      //最后再修改用户名，返回登录界面重新登录
      if(values.username !== props.loginUser){
        await props.editUsername({old_id: props.username, new_id: values.username});
      }
      message.success("修改成功！请重新登录。");
      setVisible(false);
      await props.changeRedirect();
    }
    else{
      if(values.username !== props.username){
        //修改用户名
        await props.editUsername({old_id: props.username, new_id: values.username});
      }
      if(typeof (values.password) !== 'undefined'){
        //修改密码
        await props.editPassword({id: values.username, pw: values.password});
      }
      if(typeof(values.root) == 'undefined'){
        values.root = [];
      }
      await props.editRoots({id: values.username, roots: values.root});
      message.success("修改成功！");
      setVisible(false);
      props.refresh();
    }
  };

  return (
    <div>
      <Button
        type="link"
        onClick={() => {
          setVisible(true);
        }}
      >
        修改用户名/密码/权限
      </Button>
      <U_EditionCreateForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
        defaultname={props.username}
      />
    </div>
  );
};

class U_Edition extends Component {
  render() {
    const { loginUser, username, refresh, editUsername, editPassword, editRoots, changeRedirect } = this.props;
    return (
      <div>
        <U_EditionPage
          username={username}
          loginUser={loginUser}
          changeRedirect={changeRedirect}
          editUsername={editUsername}
          editPassword={editPassword}
          editRoots={editRoots}
          refresh={refresh}
        />
      </div>
    );
  }
}

const mapDispatchToProps = () => {
  return {
    //修改用户名
    editUsername(username){
      return new Promise(async (resolve) => {
        await actionCreators.editUsername(username);
        resolve();
      })
    },
    //修改密码
    editPassword(password){
      return new Promise(async (resolve) => {
        await actionCreators.editPassword(password);
        resolve();
      })
    },
    //修改权限
    editRoots(roots){
      return new Promise(async (resolve) => {
        await actionCreators.editRoots(roots);
        resolve();
      })
    }
  }
};

export default connect(mapDispatchToProps)(U_Edition);
