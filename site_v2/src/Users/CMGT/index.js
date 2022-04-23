import React, {Component} from 'react';
import {Button, Popconfirm, Space, Table, Tag, Typography, Pagination, message} from 'antd';
import {DeleteOutlined, RightOutlined, SyncOutlined} from '@ant-design/icons';
import {Link} from "react-router-dom";
import {connect} from 'react-redux';

import {actionCreators} from "../CMGT/store";
import {makeRowSelection} from "../../components/makeRowSelection";
import {makeColumnSearch} from "../../components/makeColumSearch";
import DownloadForm from "../../components/downloadForm";
import UploadForm from "../../components/uploadForm";
import C_Edition from "../../components/c_Edition";


/*//制造假数据
const CMGTListData = [];
for (let i = 0; i < 100; i++) {
  CMGTListData.push({
    key: (i+1).toString(),
    corpusname: `corpus ${i}`,
    creator: 'Anothermmm',
    time: '2021.3.28',
    group: `G${i}`,
  });
}*/


class CMGT extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rendered: 0, //数据更新状态
      loading: true, //是否处于正在加载状态
      paginationProps: {
        hideOnSinglePage: true,
        simple: true,
        current:this.props.currentPage,
        defaultCurrent: 1,
        pageSize: 20,
      },
      currentDataSource: [],
      searchText: '',
      searchedColumn: '',
      selectedRowKeys: [],
    };
  }

  componentDidMount() {
    //先取语料列表，改变state，触发更新流程
    this.props.getCorpusList();
    if(this.state.rendered === 0){
      this.setState((state) => {
        return Object.assign({},state,{rendered: 1});
      })
    }
  }

  render() {
    const { loading, selectedRowKeys, paginationProps } = this.state;
    const { corpusList } = this.props;

    const rowSelection = makeRowSelection(this,corpusList);
    const columns = [
      {
        title: '语料名',
        dataIndex: 'corpusname',
        key: 'corpusname',
        width: '25%',
        align: 'center',
        ...makeColumnSearch(this,'corpusname', '语料名'),
        ellipse: true,
        render: (text,record) => (
          <Typography.Link
            onClick={() => this.props.getCorpusContent(record.raw_corpusname)}
          >
            <Link to='/users/corpus'>{record.corpusname}</Link>
          </Typography.Link>
        ),
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        key: 'creator',
        align: 'center',
        ellipse: true,
        render: (text,record) => ( //参数为当前行的值，行数据，行索引
          <Typography.Text>{record.creator}</Typography.Text>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'time',
        key: 'time',
        align: 'center',
        ellipse: true,
        render: (text,record)=> {
          if(record.time !== null){
            const time = record.time.split(" ");
            return <Typography.Text>{time[1]+" "+time[2]+" "+time[3]}</Typography.Text>
          }
        }},
      {
        title: '分组',
        dataIndex: 'group',
        width: '20%',
        align: 'center',
        key: 'group',
        ...makeColumnSearch(this,'group', '分组'),
        render: (text,record)=> (
          <Typography.Text>{record.group}</Typography.Text>
        )
      },
      {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        align: 'center',
        width: '20%',
        render: (text, record) => (
          <Space size="small">
            <C_Edition
              corpusname={record.corpusname}
              group={record.group}
              refresh={this.refresh}
              raw_corpusname={record.raw_corpusname}
            />
          </Space>
        ),
      },
    ];

    return (
      <div style={{height: "100%"}}>
        <div>
          <Space>
            <Tag color="blue">已选择{selectedRowKeys.length}项</Tag>
            <Button icon={<SyncOutlined />} size="large" onClick={this.refresh} type="primary">
              刷新
            </Button>
            <DownloadForm selectedRowKeys={selectedRowKeys} dataSource={corpusList} refresh={this.refresh}/>
            <UploadForm refresh={this.refresh} />
            <Popconfirm
              title="确定删除选中项吗？"
              onConfirm={this.deleteCorpuses}
              okText="是"
              cancelText="否"
            >
              <Button icon={<DeleteOutlined />} size="large">
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>
        <div>
          <Table
            columns={columns}
            dataSource={corpusList}
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
      if(this.props !== prevProps || this.props.corpusList.length === 0){
        this.setState((state) => {
          return Object.assign({},state,{loading: false},{rendered: 4});
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
    this.props.savePage(pagination.current);
    this.setState((state) => {
      return Object.assign({},state,{rendered: 2},{loading: true},{paginationProps:{...pagination}},{currentDataSource: extra.currentDataSource});
    });
  };

  //复选框
  onSelectChange = selectedRowKeys => this.setState({ selectedRowKeys });

  //刷新组件
  refresh = async () => {
    this.setState((state) => {
      return Object.assign({},state, {rendered: 4},{loading: true},{selectedRowKeys: []});
    });
    await this.props.getCorpusList();
    this.setState((state) => {
      return Object.assign({},state, {rendered: 2},{currentDataSource: this.props.corpusList});
    });
  };

  //填充属性
  fillProps = (pagination, currentDataSource) => {
    if(currentDataSource.length === 0){
      currentDataSource = JSON.parse(JSON.stringify({corpusList: this.props.corpusList})).corpusList;
    }
    let begin = pagination.pageSize*(pagination.current-1);

    //把前pageSize项包装成一个数组传过去
    let data = [];
    for(let i = 0; i<Math.min(pagination.pageSize,(currentDataSource.length-(pagination.current-1)*pagination.pageSize)); i++) data.push(currentDataSource[i+begin]);
    this.props.getCorpusProps(data);
  };

  //批量删除
  deleteCorpuses = async () => {
    //确定需要删除的最前一项的位置，删除文件后直接向后端取文件列表，然后重更新
    let files = [];
    const { selectedRowKeys, paginationProps } = this.state;
    const { corpusList } = this.props;
    const len = selectedRowKeys.length;
    if(len === 0){
      message.error("至少选中一项！");
      return;
    }

    let minkey = Math.min.apply(Math,selectedRowKeys.map(Number));
    let pagesize = paginationProps.pageSize;
    //向上整除作为删除后要展示的页码，考虑删掉最后连续页全部文件的情况，要把刷新后的当前页面减一
    paginationProps.current = Math.ceil(minkey / pagesize);
    if((corpusList.length - len) / pagesize < paginationProps.current && paginationProps.current > 1){
      paginationProps.current -= 1;
    }

    for(let i=0; i<len; i++){
      let file = corpusList[selectedRowKeys[i]-1];
      files.push(file);
    }
    //先令成状态4，并开始更新
    this.setState((state) => {
      return Object.assign({},state,{rendered: 4},{loading: true})
    });
    if(await this.props.deleteCorpuses(files)){
      message.success("删除成功！");
    }
    else {
      message.error("操作失败！");
    }
    await this.props.getCorpusList();
    //这里的执行顺序，竟然是getList改变了props后，立刻被捕捉进入生命周期！
    this.setState((state) => {
      return Object.assign({},state,
        {currentDataSource: this.props.corpusList},
        {paginationProps: {...paginationProps}},
        {selectedRowKeys: []},
        {rendered: 2});
    });
  };
}

const mapStateToProps = (state) => {
  return {
    corpusList: state.corpus.corpusList,
    currentPage: state.corpus.currentPage
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getCorpusList(){
      //获取熟语料列表
      return new Promise(async (resolve) => {
        await dispatch(actionCreators.getCorpusList());
        resolve();
      });
    },
    getCorpusContent(corpusname){
      //获取单个熟语料内容
      dispatch(actionCreators.getCorpusContent(corpusname));
    },
    getCorpusProps(dataSource){
      //批量获取熟语料属性
      dispatch(actionCreators.getCorpusProps(dataSource));
    },
    async deleteCorpuses(corpusList){
      //批量删除熟语料文件
      return new Promise(async (resolve) => {
        resolve(await actionCreators.deleteCorpuses(corpusList));
      });
    },
    savePage(currentPage){
      //保存当前页码
      dispatch(actionCreators.savePage(currentPage));
    }
  }
};

export default connect(mapStateToProps,mapDispatchToProps)(CMGT);
