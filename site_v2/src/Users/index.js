import React, { Component } from "react";
import { Layout, Menu } from 'antd';
import { Link, Route, Switch, Redirect } from 'react-router-dom';
import { ShopOutlined, ControlOutlined, UserOutlined, StarOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';

import { identify } from "../utils/identify";
import { actionCreators } from '../Login/store';
import CMGT from "./CMGT";
import TMGT from "./TMGT";
import UMGT from "./UMGT";
import Corpus from "./Corpus";
import Home from "./Home";
import Annotate from "./Mytask/Annotate";
import Audit from "./Mytask/Audit";
import _Audit from "./Mytask/Audit/_Audit";
import _TMGT from "./TMGT/_TMGT";


class Users extends Component {
  state = {
    collapsed: false,
  };

  onCollapse = collapsed => {
    this.setState({ collapsed });
  };

  componentDidMount() {
    const { getLoginState } = this.props;
    //获取登录状态、登录用户
    getLoginState().then(res => {});
  }

  render() {
    const { loginState, userRoots } = this.props;
    const { Content, Sider } = Layout;
    const { SubMenu } = Menu;
    if(loginState === false || loginState === null){
      return <Redirect to="/" />
    }
    else{
      const level = identify(userRoots);
      return (
        <div style={{height: "100%"}}>
          <Layout style={{height: "100%"}}>
            <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
              <div className="logo" />
              <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">

                <SubMenu key="sub1" icon={<UserOutlined />} title="用户">
                  <Menu.Item key="1" onClick={this.props.logout}>退出登录</Menu.Item>
                  <Menu.Item key="2"><Link to='/users/home'>主页</Link></Menu.Item>
                </SubMenu>

                {
                  level > 0 ?
                    <SubMenu key="sub2" icon={<StarOutlined />} title="我的任务">
                      <Menu.Item key="3"><Link to='/users/mytask/audit'>我的审核任务</Link></Menu.Item>
                      <Menu.Item key="4"><Link to='/users/mytask/annotate'>我的标注任务</Link></Menu.Item>
                    </SubMenu> : null
                }

                {
                  level > -1 ?
                    <SubMenu key="sub3" icon={<ShopOutlined />} title="语料库">
                      <Menu.Item key="5"><Link to='/users/corpus'>成品库</Link></Menu.Item>
                    </SubMenu> : null
                }

                {
                  level > 1 ?
                    <SubMenu key="sub4" icon={<ControlOutlined />} title="管理">
                      <Menu.Item key="6"><Link to='/users/cmgt'>语料管理</Link></Menu.Item>
                      <Menu.Item key="7"><Link to='/users/umgt'>用户管理</Link></Menu.Item>
                      <Menu.Item key="8"><Link to='/users/tmgt'>任务管理</Link></Menu.Item>
                    </SubMenu> : null
                }

              </Menu>
            </Sider>

            <Layout>
              <Content style={{ margin: '0 0', height: "100%" }}>
                <Switch>
                  <Route exact path='/users/corpus' component={Corpus} />
                  <Route exact path='/users/cmgt' component={CMGT} />
                  <Route exact path='/users/umgt' component={UMGT} />
                  <Route exact path='/users/tmgt' component={TMGT} />
                  <Route exact path='/users/mytask/annotate' component={Annotate} />
                  <Route exact path='/users/mytask/audit' component={Audit} />
                  <Route exact path='/users/mytask/audit/_audit' component={_Audit} />
                  <Route exact path='/users/tmgt/_tmgt' component={_TMGT} />
                  <Route path='/users/' component={Home} />
                </Switch>
              </Content>
            </Layout>
          </Layout>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    loginState: state.login.loginState,
    allRoots: state.login.allRoots,
    userRoots: state.login.userRoots,
    username: state.login.username,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout(){
      dispatch(actionCreators.logout());
    },
    getLoginState(){
      return new Promise(async (resolve) => {
        resolve(await dispatch(actionCreators.getLoginState()));
      })
    },
  }
};

export default connect(mapStateToProps,mapDispatchToProps)(Users);
