import React, {Component} from 'react';
import {Table, Tag, Typography, Space, Row, Col, Descriptions, Button, message, Popconfirm} from "antd";
import {DeleteOutlined, SyncOutlined, RollbackOutlined} from "@ant-design/icons";
import { connect } from "react-redux";


import {makeBadge} from "../../../components/makeBadge";
import {makeRowSelection} from "../../../components/makeRowSelection";
import {makeColumnSearch} from "../../../components/makeColumSearch";
import { actionCreators } from "../store";
import { Viewer } from "../../../components/carbon";
import NewFile from "../../../components/newFileForm";
import F_Edition from "../../../components/f_edition";


//制造假数据
const _TMGTDataList = [];
for(let i=0; i<100; i++){
  _TMGTDataList.push({
    key: (i+1).toString(),
    filename: "File_" + i.toString(),
    targetname: "File_" + i.toString(),
    schedule: 1, //0是未标注，1是未审核，2是已完成
    auditor: "su",
    annotators: ["Trump","Biden"],
    creator: 'Anothermmm',
    time: '2021.3.28',
    content: null,
  });
}
const currentFileContent = {
  title: "carbon1",
  content: {
    "discourse": {
      "abstract": "“八五”期间西藏金融工作取得显著成绩，实现了金融体制在框架上与全国一致，外汇体制与全国接轨，存款和贷款的增幅明显。",
      "dateline": "新华社拉萨二月二日电（记者央珍）",
      "lead": "“八五”期间西藏金融工作取得显著成绩。",
      "topic": "西藏金融工作取得显著成绩"
    },
    "roots": [
      {
        "center": 0,
        "children": [
          {
            "content": "“八五”（一九九一至一九九五年）期间，西藏金融体制改革坚持与全国框架一致、体制衔接的方针，顺利完成了西藏各级人民银行的分设工作，实现信贷资金使用从粗放型经营方式向集约型经营方式转变。去年，全区各项存款首次突破了年净增二十亿元大关。",
            "function": "Summary-Lead",
            "topic": "“八五”期间西藏金融工作取得显著成绩。"
          },
          {
            "center": 0,
            "children": [
              {
                "content": "据中国人民银行西藏自治区分行行长索朗达吉介绍，“八五”期间，西藏自治区分行在全国率先撤销了人民银行县支行，中国农业银行西藏自治区分行于去年七月一日正式对外挂牌营业，实现了金融体制在框架上与全国一致。外汇体制改革实现了与全国接轨，结售制度和新的核销制度在西藏全面实施，有效地防止了外汇流失。去年全区各项存款和贷款的增幅远远高于经济发展速度，实现了年初金融工作会议提出的要求。",
                "function": "Sub-Summary",
                "topic": "西藏实现了金融体制在框架上与全国一致，外汇体制与全国接轨，存款和贷款的增幅高。"
              },
              {
                "center": -1,
                "children": [
                  {
                    "content": "西藏银行部门积极调整信贷结构，以确保农牧业生产等重点产业的投入，加大对工业、能源、交通、通信等建设的正常资金供应量。去年新增贷款十四点四一亿元，比上年增加八亿多元。农牧业生产贷款（包括扶贫贷款）比上年新增四点三八亿元；乡镇企业贷款增幅为百分之六十一点八三。",
                    "function": "Situation",
                    "topic": "西藏积极调整信贷结构，贷款增幅明显。"
                  },
                  {
                    "content": "到去年底，全区各项存款余额达七十一点六三亿元，比上年同期增长百分之四十一点七八，其中，城乡居民储蓄存款为十九点三七亿元，比上年同期增长百分之四十八点二。“八五”期间各项存款比“七五”（一九八六至一九九０年）末净增五十亿元，年平均增长百分之二十七点四九。在新增的储蓄存款中，定期存款占百分之七十二点一五。货币回笼的增加，为平抑全区物价发挥了作用。（完）",
                    "function": "Situation",
                    "topic": "存款增幅明显。"
                  }
                ],
                "function": "Story",
                "type": "Joint"
              }
            ],
            "function": "Story",
            "type": "Elaboration"
          }
        ],
        "function": "NewsReport",
        "type": "Elaboration"
      }
    ]
  }
};
const currentFileData = {
  key: '1',
  filename: "File_1",
  targetname: "File_1",
  taskname: "B1",
  schedule: 1, //0是未标注，1是未审核，2是已完成
  auditor: "su",
  annotators: ["Trump","Biden"],
  creator: 'Anothermmm',
  time: 'ss 4 Apr 2021 ww',
  content: currentFileContent,
};



class _TMGT extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,//是否处于正在加载状态
      paginationProps: {
        hideOnSinglePage: true,
        simple: true,
        current: 1,
        defaultCurrent: 1,
        pageSize: 20,
      },
      currentDataSource: [],
      currentTask: this.props.location.state.currentTask, //当前任务
      searchText: '',
      searchedColumn: '',
      selectedRowKeys: [], //默认为空，记录复选项的下标
    };
  }

  componentDidMount() {
    //根据任务名获得文件列表，传回仓库
    const { currentTask } = this.state;
    this.props.listTaskFiles(currentTask).then(res => {
      this.props.setCurrentTask(currentTask).then(res => {
        this.setState({loading: false});
      })
  })
  }

  render() {
    const { paginationProps, loading, selectedRowKeys } = this.state;
    const { taskFileList, currentTaskFile, getTaskFileContent } = this.props;
    const columns = [
      {
        title: '文件名',
        dataIndex: 'filename',
        key: 'filename',
        align: 'center',
        ...makeColumnSearch(this, 'filename', '文件名'),
        ellipsis: true,
        width: "70%",
        render: (text,record) => (
          <Typography.Link
            onClick={() => getTaskFileContent(record)}
          >{record.filename}</Typography.Link>
        ),
      },
      {
        title: '进度',
        dataIndex: 'schedule',
        key: 'schedule',
        align: 'center',
        ellipsis: true,
        width: "30%",
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
          const { schedule} = record;
          if(value === 0){
            return schedule === 0;
          }
          else if(value === 1){
            return schedule === 1;
          }
          else if(value === 2){
            return schedule === 2;
          }
        },
        render: (text, record) => {
          return makeBadge(record.schedule,3);
        },
      },
    ];
    const rowSelection = makeRowSelection(this,taskFileList);

    return (
      <div style={{height: "100vh"}}>
        <Space>
          <Tag color="blue">已选择{selectedRowKeys.length}项</Tag>
          <Button icon={<SyncOutlined />} size="large" type="primary" onClick={() => this.refresh(currentTaskFile)}>
            刷新
          </Button>
          <NewFile refresh={this.refresh} currentTaskFile={currentTaskFile}/>
          {/*<Popconfirm
            title="确定从任务中移除并删除选中文件吗？"
            onConfirm={() => this.deleteFiles(1)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} size="large">
              批量删除文件
            </Button>
          </Popconfirm>*/}
          <Popconfirm
            title="确定从任务中移除选中文件吗？"
            onConfirm={() => this.deleteFiles(2)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} size="large">
              从任务中移除文件
            </Button>
          </Popconfirm>
          <Button icon={<RollbackOutlined />} size="large" onClick={this.onExit}>
            返回
          </Button>
        </Space>
        <div>
          <Row style={{height: "100%"}}>
            <Col span={7}>
              <div style={{height: "100%", overflowY: "hidden", display: "flex", flexDirection: "column"}}>
                <Table
                  dataSource={taskFileList}
                  columns={columns}
                  rowSelection={rowSelection}
                  pagination={paginationProps}
                  loading={loading}
                  scroll={{ y: 'calc(100vh - 150px)'}}
                  onChange={this.handleTableChange}
                  size="middle"
                />
              </div>
            </Col>
            <Col span={17}>
              <div>
                <Descriptions
                  bordered
                  size="small"
                  column={4}
                >
                  <Descriptions.Item key="filename" label="文件名" span={2}>{currentTaskFile.filename}</Descriptions.Item>
                  <Descriptions.Item key="creator" label="创建人" span={1}>
                    <Tag color='geekblue'>
                      {currentTaskFile.creator}
                    </Tag></Descriptions.Item>
                  <Descriptions.Item key="time" label="创建时间" span={1}>{currentTaskFile.time === null ? "未知时间" : currentTaskFile.time.split(" ")[1]+" "+currentTaskFile.time.split(" ")[2]+" "+currentTaskFile.time.split(" ")[3]}</Descriptions.Item>
                  <Descriptions.Item key="charger" label="审核人" span={2}>
                    <Tag color='volcano'>
                      {currentTaskFile.auditor}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item key="completed" label="完成情况" span={1}>
                    {
                      makeBadge(currentTaskFile.schedule,3)
                    }
                  </Descriptions.Item>
                  <Descriptions.Item key="targetname" label="入库ID" span={1}>{currentTaskFile.targetname}</Descriptions.Item>
                  <Descriptions.Item key="annotators" label="标注负责人" span={2}>
                    {currentTaskFile.annotators.map(annotator => (
                      <span>
                      <Tag color='green' key={annotator}>
                        {annotator}
                      </Tag>
                    </span>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item key="taskname" label="所属任务" span={1}>{currentTaskFile.taskname}</Descriptions.Item>
                  <Descriptions.Item key="operation" label="操作" span={1}>
                    {
                      (currentTaskFile.schedule !== 2 && currentTaskFile.filename !== "未知文件名") ?
                        <Space>
                          <F_Edition currentTaskFile={currentTaskFile} refresh={this.refresh}/>
                        </Space> : null
                    }
                  </Descriptions.Item>
                </Descriptions>
                <div style={{height: 'calc(100vh - 160px)'}}>
                  <Viewer carbon={currentTaskFile.content} title={currentTaskFile.filename} key={Math.random()}/>
                </div>
              </div>
            </Col>
          </Row>
        </div>

      </div>
    );
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

  //刷新
  refresh = async (currentTaskFile) => {
    const { currentTask } = this.state;
    await this.setState({loading: true});
    await this.props.listTaskFiles(currentTask);
    await this.setState({loading: false, currentDataSource: this.props.taskFileList, selectedRowKeys: []});
    /*if(currentTaskFile.filename !== "未知文件名"){
      await this.props.getTaskFileContent(currentTaskFile);
    }*/
    if(currentTaskFile.filename !== "未知文件名"){
      await this.props.resetTaskFileContent(currentTaskFile);
    }
  };

  //删除
  deleteFiles = async (mode) => {
    //确定需要删除的最前一项的位置，删除文件后直接向后端取文件列表，然后重更新
    let files = [];
    const { selectedRowKeys, paginationProps } = this.state;
    const { taskFileList, currentTaskFile, deleteTaskFiles, removeTaskFiles } = this.props;
    const len = selectedRowKeys.length;
    if(len === 0){
      message.error("至少选中一项！");
      return;
    }

    let minkey = Math.min.apply(Math,selectedRowKeys.map(Number));
    let pagesize = paginationProps.pageSize;
    //向上整除作为删除后要展示的页码，考虑删掉最后连续页全部文件的情况，要把刷新后的当前页面减一
    paginationProps.current = Math.ceil(minkey / pagesize);
    if((taskFileList.length - len) / pagesize < paginationProps.current && paginationProps.current > 1){
      paginationProps.current -= 1;
    }

    for(let i=0; i<len; i++){
      let file = taskFileList[selectedRowKeys[i]-1];
      files.push(file);
    }
    await this.setState({loading: true});
    await removeTaskFiles(files);
    if(mode === 1){
      await deleteTaskFiles(files);
    }
    await this.refresh(currentTaskFile);
    await this.setState((state) => {
      return Object.assign({},state,
        {paginationProps: {...paginationProps}},
        {currentDataSource: taskFileList},
        {selectedRowKeys: []},
        {loading: false});
    });
    message.success("操作成功！");
  };

  //返回
  onExit = async () => {
    this.props.history.push({pathname: '/users/tmgt'});
  };

}

const mapStateToProps = (state) => {
  return {
    taskFileList: state.task.taskFileList,
    currentTaskFile: state.task.currentTaskFile,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    deleteTaskFiles(files){
      return new Promise(async (resolve) => {
        await actionCreators.deleteTaskFiles(files);
        resolve();
      })
    },
    removeTaskFiles(files){
      return new Promise(async (resolve) => {
        await actionCreators.removeTaskFiles(files);
        resolve();
      })
    },
    listTaskFiles(currentTask){
      return new Promise(async (resolve) => {
        await dispatch(actionCreators.listTaskFiles(currentTask));
        resolve();
      });
    },
    setCurrentTask(currentTask){
      return new Promise(async (resolve) => {
        await dispatch(actionCreators.setCurrentTask(currentTask));
        resolve();
      })
    },
    getTaskFileContent(record){
      return new Promise(async (resolve) => {
        await dispatch(actionCreators.getTaskFileContent(record));
        resolve();
      });
    },
    resetTaskFileContent(currentTaskFile){
      //重置当前任务文件
      return new Promise(async (resolve) => {
        await dispatch(actionCreators.resetTaskFileContent(currentTaskFile));
        resolve();
      })
    }
  }
};

export default connect(mapStateToProps,mapDispatchToProps)(_TMGT);
