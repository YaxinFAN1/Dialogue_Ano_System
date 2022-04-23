import React, {Component} from 'react';
import {connect} from "react-redux";
import { Redirect } from "react-router-dom";
import {Button, Dropdown, Menu, message, PageHeader, Popconfirm, Space, Table, Typography} from 'antd';
import {DeleteOutlined, DownOutlined, RightOutlined, SyncOutlined} from "@ant-design/icons";

import {actionCreators} from '../UMGT/store';
import {makeColumnSearch} from "../../components/makeColumSearch";
import {makeRowSelection} from "../../components/makeRowSelection";
import NewUser from "../../components/newUserForm";
import U_Edition from "../../components/u_Edition";

/*//制造假数据
const UMGTListData = [];
for (let i = 0; i < 100; i++) {
  UMGTListData.push({
    key: (i+1).toString(),
    username: `user ${i}`,
    root: [
      {
        "desc": "标注任务管理——创建新标注任务。",
        "id": "a15kc2Bx3uASir6o"
      },
    ],
  });
}*/

class UMGT extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rendered: 0,//真render初始状态0
      loading: true,//是否处于正在加载状态
      redirected: false, //用户自我修改后要返回重新登录
      paginationProps: {
        simple: true,
        hideOnSinglePage: true,
        current: 1,
        defaultCurrent: 1,
        pageSize: 20,
      },
      currentDataSource: [],//是用来更新当前页面的props的
      searchText: '',
      searchedColumn: '',
      selectedRowKeys: [],
    };
  }

  //构建下拉表
  creatMenu = (record) => {
    const { SubMenu } = Menu;
    let rootlist = record.root;
    let item_render = {task: [], user: [], raw: [], corpus: [], formatter: []};
    if(rootlist.length !== 0){
      for(let i=0; i<rootlist.length; i++){
        let menu = rootlist[i].desc.split("——")[0];
        let submenu = rootlist[i].desc.split("——")[1];
        switch (menu) {
          case "任务系统": {
            item_render.task.push(submenu);
            break;
          }
          case "用户管理": {
            item_render.user.push(submenu);
            break;
          }
          case "生语料库": {
            item_render.raw.push(submenu);
            break;
          }
          case "语料库管理": {
            item_render.corpus.push(submenu);
            break;
          }
          case "使用格式化器的权限。": {
            item_render.formatter.push(menu);
            break;
          }
        }
      }
    }
    return (
      <Menu>
        <SubMenu title="任务管理">
          {item_render.task.map(submenu => (
            <Menu.Item>{submenu}</Menu.Item>
          ))}
        </SubMenu>
        <SubMenu title="用户管理">
          {item_render.user.map(submenu => (
            <Menu.Item>{submenu}</Menu.Item>
          ))}
        </SubMenu>
        <SubMenu title="生语料管理">
          {item_render.raw.map(submenu => (
            <Menu.Item>{submenu}</Menu.Item>
          ))}
        </SubMenu>
        <SubMenu title="语料库管理">
          {item_render.corpus.map(submenu => (
            <Menu.Item>{submenu}</Menu.Item>
          ))}
        </SubMenu>
        <SubMenu title="使用格式化器的权限">
          {item_render.formatter.map(submenu => (
            <Menu.Item>{submenu}</Menu.Item>
          ))}
        </SubMenu>
      </Menu>
    )
  };

  componentDidMount() {
    //第一次取用户数据
    this.props.getUserData();
    if (this.state.rendered === 0) {
      this.setState((state) => {
        return Object.assign({}, state, {rendered: 1});
      });
    }
  };

  render() {
    const { userList, loginUser } = this.props;
    const { loading, paginationProps, redirected } = this.state;

    const columns = [
      {
        title: '用户名',
        dataIndex: 'username',
        key: 'username',
        width: '30%',
        align: 'center',
        ...makeColumnSearch(this, 'username', '用户名'),
        ellipse: true,
        render: (text, record) => (
          <Typography.Text>{record.username}</Typography.Text>
        ),
      },
      {
        title: '权限',
        dataIndex: 'root',
        key: 'root',
        width: '30%',
        align: 'center',
        ellipse: true,
        render: (text, record) => (
          <div>
            <Dropdown overlay={this.creatMenu(record)}>
              <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                权限列表<DownOutlined />
              </a>
            </Dropdown>,
          </div>
        ),
      },
      {
        title: '操作',
        key: 'action',
        align: 'center',
        render: (text, record) => (
          <Space size="small">
            <U_Edition
              username={record.username}
              loginUser={loginUser}
              changeRedirect={this.changeRedirect}
              refresh={this.refresh}
            />
          </Space>
        ),
      },
    ];

    const rowSelection = makeRowSelection(this,userList);

    if(redirected){
      return <Redirect to="/" />
    }

    return (
      <div>
        <Space>
          <PageHeader
            className="site-page-header"
            title={loginUser}
            subTitle="（当前用户）"
            avatar={{src: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'}}
          />
          <Button icon={<SyncOutlined />} size="large" onClick={this.refresh} type="primary">
            刷新
          </Button>
          <NewUser refresh={this.refresh} />
          <Popconfirm
            title="确定删除选中项吗？"
            onConfirm={() => this.deleteUsers(userList)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} size="large">
              删除用户
            </Button>
          </Popconfirm>
        </Space>
        <div>
          <Table
            columns={columns}
            dataSource={userList}
            rowSelection={rowSelection}
            pagination={paginationProps}
            loading={loading}
            scroll={{ y: 'calc(100vh - 180px)'}}
            onChange={this.handleTableChange}
            size="middle"
          />
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { rendered, paginationProps, currentDataSource } = this.state;
    if(rendered === 4) return; //状态4，不需要做任何其他变化
    if(rendered === 3){
      //状态3，不需要重新请求属性的情况，例如1.上次更新已经请求了属性之后啥也没做（指紧接着的上次）。2.没有改变当页展示内容
      if(this.props !== prevProps || this.props.userList.length === 0){
        this.setState((state) => {
          return Object.assign({},state,{loading: false}, {rendered: 4});
        });
      }
      return;
    }
    if(rendered === 2 || this.props !== prevProps){
      //状态2，（或者列表内容改变）取数据，更新仓库
      this.getRoots(paginationProps,currentDataSource);
      this.setState((state) => {
        return Object.assign({},state,{rendered: 3});
      });
    }
  }

  //表格变化
  handleTableChange = (pagination, filters, sorter, extra) => {
    this.setState((state) => {
      return Object.assign({}, state, {paginationProps: {...pagination}}, {currentDataSource: extra.currentDataSource});
    });
  };

  //复选框
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  //填充属性
  getRoots = async (pagination,currentDataSource) => {
    if(currentDataSource.length === 0){
      currentDataSource = JSON.parse(JSON.stringify({userList: this.props.userList})).userList;
    }
    let begin = pagination.pageSize*(pagination.current-1);

    //把前pageSize项包装成一个数组传过去
    let data = [];
    for(let i = 0; i<Math.min(pagination.pageSize,(currentDataSource.length-(pagination.current-1)*pagination.pageSize)); i++) data.push(currentDataSource[i+begin].username);
    await this.props.getRoots(data);
  };

  //刷新组件
  refresh = async () => {
    this.setState((state) => {
      return Object.assign({},state, {rendered: 4},{loading: true},{selectedRowKeys: []});
    });
    await this.props.getUserData();
    this.setState((state) => {
      return Object.assign({},state, {rendered: 2},{currentDataSource: this.props.userList});
    });
  };

  //自我修改
  changeRedirect = async () => {
    this.setState({redirected: true});
  };

  //批量删除
  deleteUsers = async () => {
    const { userList, loginUser } = this.props;
    const { selectedRowKeys, paginationProps } = this.state;
    let users = [];
    let len = selectedRowKeys.length;
    if(len === 0){
      message.error("至少选中一项！");
      return;
    }


    let minkey = Math.min.apply(Math,selectedRowKeys.map(Number));
    let pagesize = paginationProps.pageSize;
    //向上整除作为删除后要展示的页码，考虑删掉最后连续页全部文件的情况，要把刷新后的当前页面减一
    paginationProps.current = Math.ceil(minkey / pagesize);
    if((userList.length - len) / pagesize < paginationProps.current && paginationProps.current > 1){
      paginationProps.current -= 1;
    }

    for(let i=0; i<len; i++){
      let username = userList[selectedRowKeys[i]-1].username;
      if(username === 'su'){
        message.error("无权限修改超级管理员su！");
        return ;
      }
      if(username === loginUser){
        message.error("警察及时赶到，阻止了正要发生的自杀事件。");
        return ;
      }
      users.push(username);
    }
    this.setState((state) => {
      return Object.assign({},state,{rendered: 4},{loading: true})
    });
    await this.props.deleteUsers(users);
    message.success("删除成功！");
    await this.props.getUserData();
    this.setState((state) => {
      return Object.assign({},state,
        {currentDataSource: this.props.userList},
        {paginationProps: {...paginationProps}},
        {selectedRowKeys: []},
        {rendered: 2});
    });
  }
}

const mapStateToProps = (state) => {
  return {
    userList: state.user.userList,
    currentPage: state.user.currentPage,
    loginUser: state.user.loginUser
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    //获取权限
    getRoots(usernames){
      return new Promise(async (resolve) => {
        resolve(await dispatch(actionCreators.getRoots(usernames)));
      })
    },
    //获取用户列表，当前用户，全权限表
    getUserData(){
      return new Promise(async (resolve) => {
        await dispatch(actionCreators.getUserData());
        resolve();
      })
    },
    //删除用户
    deleteUsers(usernames){
      return new Promise(async (resolve) => {
        await actionCreators.deleteUsers(usernames);
        resolve();
      })
    },
  }
};

export default connect(mapStateToProps,mapDispatchToProps)(UMGT);
