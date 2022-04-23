import React, {Component} from 'react';
import {Button, message, Popconfirm, Space, Table, Tag, Typography} from "antd";
import {DeleteOutlined, FilterOutlined, SyncOutlined} from "@ant-design/icons";
import { connect } from "react-redux";

import { makeColumnSearch } from "../../components/makeColumSearch";
import { makeRowSelection } from "../../components/makeRowSelection";
import NewTask from "../../components/newTaskForm";
import T_Edition from "../../components/t_Edition";
import {actionCreators} from "../TMGT/store";
import { actionCreators as u_actionCreators } from "../UMGT/store";


//制造假数据
/*const TMGTListData = [];
for (let i = 0; i < 100; i++) {
  let v1 = Math.round(i / 30);
  let v2 = Math.round(i / 60);
  let v3 = Math.round(i / 90);
  TMGTListData.push({
    key: (i+1).toString(),
    taskname: `task ${i}`,
    creator: 'Anothermmm',
    time: '2021.3.28',
    auditor: 'Anothermmm',
    annotators: ['Trump','Biden'],
    schedule: {annotating: v3, auditing: v2, completed: v1}, //各标注文件进度
    details: [], //如果有可能的话，给出一棵任务的树，详细到每个标注员的标注状况
  });
}*/

//进度
const makeSchedule = (schedule) => {
  const { annotating, auditing, completed } = schedule;
  return (
    <span>
      <Typography.Text type="danger">
        {annotating}
      </Typography.Text>
      {" + "}
      <Typography.Text type="warning">
        {auditing}
      </Typography.Text>
      {" + "}
      <Typography.Text type="success">
        {completed}
      </Typography.Text>
      {" = "}
      {annotating+auditing+completed}
    </span>
  )
};

class TMGT extends Component {
  constructor() {
      super();
      this.state = {
        loading: true,//是否处于正在加载状态
        rootsList: null, //用户权限列表
        paginationProps: {
          hideOnSinglePage: true,
          simple: true,
          current: 1,
          defaultCurrent: 1,
          pageSize: 20,
        },
        currentDataSource: [],//是用来更新当前页面的props的
        searchText: '',
        searchedColumn: '',
        selectedRowKeys: [], //默认为空，记录复选项的下标
      };
  }

  componentDidMount() {
    //先取任务列表，改变state，触发更新流程
    const init = new Promise(async (resolve,reject) => {
      await this.props.getTaskList();
      const users = await this.props.getUsers();
      let usernames = [];
      users.forEach(user => {
        usernames.push(user.username);
      });
      resolve(await this.props._getRoots(usernames));
    });
    init.then(rootsList => {
      this.setState((state) => {
        return Object.assign({},state, {rootsList: rootsList});
      })
    });
  }

  render() {

    const { paginationProps, loading, selectedRowKeys, rootsList } = this.state;
    const { taskList } = this.props;

    const columns = [
      {
        title: '任务名',
        dataIndex: 'taskname',
        key: 'taskname',
        align: 'center',
        ...makeColumnSearch(this, 'taskname', '任务名'),
        ellipsis: true,
        width: "10%",
        render: (text,record) => (
          <Typography.Link
            onClick={() => {
              this.props.history.push({pathname: '/users/tmgt/_tmgt', state: {currentTask: {taskname: record.taskname, auditor: record.auditor, annotators: record.annotators}}});
            }}
          >{record.taskname}</Typography.Link>
        ),
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        key: 'creator',
        align: 'center',
        ...makeColumnSearch(this,'creator','创建人'),
        ellipsis: true,
        render: (text,record) => (
          <Tag color='geekblue'>
            {record.creator}
          </Tag>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'time',
        key: 'time',
        align: 'center',
        ...makeColumnSearch(this, 'time', '日期'),
        ellipsis: true,
        render: (text, record) => {
          if(record.time !== null){
            const time = record.time.split(" ");
            return <Typography.Text>{time[1]+" "+time[2]+" "+time[3]}</Typography.Text>
          }
        },
      },
      {
        title: '审核员',
        dataIndex: 'auditor',
        key: 'auditor',
        align: 'center',
        ellipsis: true,
        ...makeColumnSearch(this,'auditor','审核员'),
        render: (text,record) => (
          <Tag color='volcano'>
            {record.auditor}
          </Tag>
        ),
      },
      {
        title: '标注员',
        dataIndex: 'annotators',
        key: 'annotators',
        align: 'center',
        ellipsis: true,
        ...makeColumnSearch(this,'annotators','标注员'),
        width: "18%",
        render: (text,record) => (
          <div>
            {record.annotators.map(annotator => (
              <Tag color='green' key={annotator}>
                {annotator}
              </Tag>
            ))}
          </div>
        ),
      },
      {
        title: '进度(标注中/审核中/已完成)',
        dataIndex: 'schedule',
        key: 'schedule',
        align: 'center',
        ellipsis: true,
        width: "20%",
        filters: [
          {
            text: '标注中',
            value: 0,
          },
          {
            text: '审核中',
            value: 1,
          },
          {
            text: '已完成',
            value: 2,
          },
        ],
        onFilter: (value, record) => {
          const { annotating, auditing, completed } = record.schedule;
          if(value === 0){
            return annotating > 0;
          }
          else if(value === 1){
            return annotating === 0 && auditing > 0;
          }
          else if(value === 2){
            return annotating === 0 && auditing === 0 && completed > 0;
          }
        },
        render: (text, record) => {
          return makeSchedule(record.schedule);
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        align: 'center',
        ellipsis: true,
        render: (text, record) => (
          <T_Edition record={record} refresh={this.refresh} rootsList={rootsList}/>
        ),
      },
    ];

    const rowSelection = makeRowSelection(this,taskList);

    return (
      <div>
        <Space>
          <Tag color="blue">已选择{selectedRowKeys.length}项</Tag>
          <Button icon={<SyncOutlined />} size="large" type="primary" onClick={this.refresh}>
            刷新
          </Button>
          <NewTask refresh={this.refresh} rootsList={rootsList}/>
          <Popconfirm
            title="确定删除选中项吗？"
            onConfirm={this.deleteTasks}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} size="large">
              删除
            </Button>
          </Popconfirm>
          <Button icon={<FilterOutlined />} size="large" onClick={() => message.info("功能开发中！")}>
            高级筛选
          </Button>
        </Space>
        <div>
          <Table
            dataSource={taskList}
            columns={columns}
            rowSelection={rowSelection}
            pagination={paginationProps}
            loading={loading}
            scroll={{ y: 'calc(100vh - 150px)'}}
            onChange={this.handleTableChange}
            size="middle"
          />
        </div>
      </div>
    );
  }

  //更新后
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { rendered, paginationProps, currentDataSource } = this.state;
    if(rendered === 4) return; //状态4，不需要做任何其他变化
    if(rendered === 3){
      //状态3，不需要重新请求属性的情况，例如1.上次更新已经请求了属性之后啥也没做（指紧接着的上次）。2.没有改变当页展示内容
      if(this.props !== prevProps){
        this.setState((state) => {
          return Object.assign({},state,{loading: false});
        });
      }
      return;
    }
    if(rendered === 2 || this.props !== prevProps){
      //状态2，（或者列表内容改变）取数据，更新仓库
      this.fillProps(paginationProps,currentDataSource);
      this.setState((state) => {
        return Object.assign({},state,{rendered: 3});
      })
    }
  }

  //表格变化
  handleTableChange = (pagination, filters, sorter, extra) => {
    this.setState((state) => {
      return Object.assign({}, state, {paginationProps: {...pagination}},{currentDataSource: extra.currentDataSource});
    });
  };

  //复选框
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  //刷新组件
  refresh = async () => {
    this.setState((state) => {
      return Object.assign({},state, {rendered: 4},{loading: true},{selectedRowKeys: []});
    });
    await this.props.getTaskList();
    this.setState((state) => {
      return Object.assign({},state, {rendered: 2},{currentDataSource: this.props.taskList});
    });
  };

  //填充属性
  fillProps = (pagination, currentDataSource) => {
    if(currentDataSource.length === 0){
      currentDataSource = JSON.parse(JSON.stringify({taskList: this.props.taskList})).taskList;
    }
    let begin = pagination.pageSize*(pagination.current-1);

    //把前pageSize项包装成一个数组传过去
    let data = [];
    for(let i = 0; i<Math.min(pagination.pageSize,(currentDataSource.length-(pagination.current-1)*pagination.pageSize)); i++) data.push(currentDataSource[i+begin]);
    this.props.getTaskProps(data);
  };

  //批量删除
  deleteTasks = async () => {
    //确定需要删除的最前一项的位置，删除文件后直接向后端取文件列表，然后重更新
    let files = [];
    const { selectedRowKeys, paginationProps } = this.state;
    const { taskList } = this.props;
    const len = selectedRowKeys.length;
    if(len === 0){
      message.error("至少选中一项！");
      return;
    }

    let minkey = Math.min.apply(Math,selectedRowKeys.map(Number));
    let pagesize = paginationProps.pageSize;
    //向上整除作为删除后要展示的页码，考虑删掉最后连续页全部文件的情况，要把刷新后的当前页面减一
    paginationProps.current = Math.ceil(minkey / pagesize);
    if((taskList.length - len) / pagesize < paginationProps.current && paginationProps.current > 1){
      paginationProps.current -= 1;
    }

    for(let i=0; i<len; i++){
      let file = taskList[selectedRowKeys[i]-1];
      files.push(file);
    }
    //先令成状态4，并开始更新
    this.setState((state) => {
      return Object.assign({},state,{rendered: 4},{loading: true})
    });
    if(await this.props.deleteTasks(files)){
      message.success("删除成功！");
    }
    else{
      message.error("操作失败！");
    }
    await this.props.getTaskList();
    //这里的执行顺序，竟然是getList改变了props后，立刻被捕捉进入生命周期！
    this.setState((state) => {
      return Object.assign({},state,
        {currentDataSource: this.props.taskList},
        {paginationProps: {...paginationProps}},
        {selectedRowKeys: []},
        {rendered: 2});
    });
  };
}

const mapStateToProps = (state) => {
  return{
    taskList: state.task.taskList,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getTaskList(){
      //获取任务列表
      return new Promise(async (resolve) => {
        await dispatch(actionCreators.getTaskList());
        resolve();
      });
    },
    getUsers(){
      return new Promise(async (resolve) => {
        resolve(await u_actionCreators.getUserList());
      })
    },
    getRoots(usernames){
      //获取用户权限列表（传仓库）
      return new Promise(async (resolve) => {
        await dispatch(u_actionCreators.getRoots(usernames));
        resolve();
      })
    },
    _getRoots(usernames){
      //获取用户权限列表（不传仓库）
      return new Promise(async (resolve) => {
        resolve(await u_actionCreators._getRoots(usernames));
      })
    },
    getTaskProps(dataSource){
      //批量获取任务属性
      dispatch(actionCreators.getTaskProps(dataSource));
    },
    deleteTasks(taskList){
      //批量删除
      return new Promise(async (resolve) => {
        resolve(await actionCreators.deleteTasks(taskList));
      });
    },
  }
};

export default connect(mapStateToProps,mapDispatchToProps)(TMGT);
