import React, { Component } from 'react';
import { Layout, Form, Input, Button } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { actionCreators } from './store';

import Background from "../static/darktheme.jpg";

const { Footer, Content } = Layout;

class Login extends Component {

  componentDidMount() {
    const { getLoginState } = this.props;
    //获取登录状态、登录用户
    getLoginState().then(res => {});
  }

  render() {
    const { loginState } = this.props;
    if(loginState === false || loginState === null){
      return (
        <div style={{height: "100%"}}>
          <Layout
            className='Layout'
            style={{height: "100%", backgroundImage: `url(${Background})`, backgroundSize: '100%,100%'}}
          >
            <Content style={{height: "100%"}}>
              <div
                className="site-layout-content"
                style={{height: "100%", display: "flex", flexFlow: "column", justifyContent: "center", alignItems: "center"}}
              >
                <div></div>
                <h2 style={{textAlign: "center", fontSize: "500%", color: "white"}}>
                  欢迎使用Petroleum语料标注系统
                </h2>
                <Form
                  name="normal_login"
                  className="login-form"
                  onFinish={this.login}
                >

                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '必须输入用户名！' }]}
                  >
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="用户密码"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button" style={{opacity: "80%"}}>
                      登录
                    </Button>
                  </Form.Item>

                </Form>
              </div>
            </Content>
            <Footer style={{backgroundColor: "rgba(255,255,255,0)"}}>
              <div style={{textAlign: "center", color: "white", fontSize: "80%"}}>
                版本：Ver&nbsp;3.3.1 &nbsp;&nbsp; 前端设计：Anothermmm &nbsp; 后端设计：AtomicGu &nbsp;&nbsp; Copyright © 2020-2021 基于web的语料标注系统项目组. &nbsp;&nbsp;All rights reserved.
              </div>
            </Footer>
          </Layout>
        </div>
      );
    }
    else{
      return <Redirect to="/users" />
    }
  }

  //登录
  login = async (values) => {
    //登录
    await this.props.login(values);
  };

}

const mapStateToProps = (state) => {
  return {
    loginState: state.login.loginState,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getLoginState(){
      //获取当前登录用户和状态、权限
      return new Promise(async (resolve) => {
        resolve(await dispatch(actionCreators.getLoginState()));
      })
    },
    login(values){
      //以输入用户信息登录
      return new Promise(async (resolve) => {
        resolve(await dispatch(actionCreators.login({id: values.username, pw: values.password === undefined ? '' : values.password})));
      })
    },
  }
};


export default connect(mapStateToProps,mapDispatchToProps)(Login);
