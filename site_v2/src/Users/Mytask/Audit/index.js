import React, {Component} from 'react';
import {Row, Col, Table, Tag, Descriptions, Button, Space, Typography, Popconfirm, message} from 'antd';
import { connect } from "react-redux";

import { actionCreators } from "../store";
import { Viewer } from "../../../components/carbon";
import { makeColumnSearch } from "../../../components/makeColumSearch";
import { makeBadge } from "../../../components/makeBadge";

/*
//伪造数据
const fileListData = [];
for (let i = 0; i < 100; i++) {
  let v = Math.round(i / 40);
  fileListData.push({
    key: (i+1).toString(),
    filename: `file ${i}`,
    schedule: v
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
const currentFile = {
  key: '3',
  filename: 'file 3',
  creator: 'Anothermmm',
  time: '2021.3.28',
  schedule: 0,
  auditor: 'Anothermmm',
  annotators: ['Trump','Biden'],
  content: currentFileContent,
};
*/


class Audit extends Component {
  constructor(props) {
    super(props);
    this.state={
      paginationProps: {
        hideOnSinglePage: true,
        simple: true,
        current:1,
        defaultCurrent: 1,
        pageSize: 20,
      },
      loading: true,
      searchText: '',
      searchedColumn: '',
    }
  }

  componentDidMount() {
    //获取登录用户，获取该用户审核的任务列表，获取用户审核的文件列表
    const { username } = this.props;
    if (typeof username === "undefined") {
      message.error("当前用户登录状态存在问题！请尝试重新登录解决问题！");
    }
    this.props.getMyAuditTasks(username).then(auditTasks => {
      this.props.getMyAuditList(auditTasks).then(res => {
        this.setState({loading: false});
      });
    });
  }

  render() {

    const { paginationProps, loading } = this.state;
    const { myAuditList, myCurrentAudit, getAuditContent, username } = this.props;

    //表格渲染
    const columns = [
      {
        title: '文件名',
        dataIndex: 'filename',
        key: 'filename',
        align: 'center',
        width: '70%',
        ...makeColumnSearch(this, 'filename', '文件名'),
        ellipsis: true,
        render: (text,record) => (
          <Typography.Link
            onClick={() => getAuditContent({taskname: record.taskname, filename: record.filename, schedule: record.schedule, auditor: username})}
          >{record.filename}</Typography.Link>
        ),
      },
      {
        title: '进度',
        dataIndex: 'schedule',
        key: 'schedule',
        align: 'center',
        ellipsis: true,
        filters: [
          {
            text: '未审核',
            value: 1,
          },
          {
            text: '已审核',
            value: 2,
          },
        ],
        onFilter: (value, record) => record.schedule === value,
        render: (text, record) => {
          return makeBadge(record.schedule,2);
        }
      },
    ];


    return (
      <div style={{height: "100%"}}>
        <Row style={{height: "100%"}}>
          <Col span={5}>
            <div style={{height: "100%", overflowY: "hidden", display: "flex", flexDirection: "column"}}>
              <Table
                columns={columns}
                dataSource={myAuditList}
                size="small"
                loading={loading}
                pagination={paginationProps}
                scroll={{ y: 'calc(100vh - 120px)'}}
                onChange={this.handleTableChange}
                bordered
              />
            </div>
          </Col>
          <Col span={19}>
            <div style={{height: "100vh"}}>
              <Descriptions
                bordered
                size="small"
                column={4}
              >
                <Descriptions.Item key="filename" label="文件名" span={2}>{myCurrentAudit.filename}</Descriptions.Item>
                <Descriptions.Item key="creator" label="创建人" span={1}>
                  <Tag color='geekblue'>
                    {myCurrentAudit.creator}
                  </Tag></Descriptions.Item>
                <Descriptions.Item key="time" label="创建时间" span={1}>{myCurrentAudit.time === null ? "未知时间" : myCurrentAudit.time.split(" ")[1]+" "+myCurrentAudit.time.split(" ")[2]+" "+myCurrentAudit.time.split(" ")[3]}</Descriptions.Item>
                <Descriptions.Item key="charger" label="审核人" span={2}>
                  <Tag color='volcano'>
                    {myCurrentAudit.auditor}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item key="annotators" label="标注负责人" span={2}>
                  {myCurrentAudit.annotators.map(annotator => (
                    <span>
                      <Tag color='green' key={annotator}>
                        {annotator}
                      </Tag>
                    </span>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item key="completed" label="完成情况" span={1}>
                  {
                    makeBadge(myCurrentAudit.schedule,2)
                  }
                </Descriptions.Item>
                <Descriptions.Item key="taskname" label="所属任务" span={1}>{myCurrentAudit.taskname}</Descriptions.Item>
                <Descriptions.Item key="operation" label="操作" span={2}>
                  <Space>
                    <Button
                      size="middle"
                      type="primary"
                      onClick={() => {
                        if(myCurrentAudit.filename === "未知文件"){
                          message.error("请先选择一份文件！");
                        }
                        else{
                          this.props.history.push({pathname: '/users/mytask/audit/_audit', state: {record: myCurrentAudit}});
                        }
                      }}
                    >
                      审核
                    </Button>
                    <Popconfirm
                      title="确定提交审核成果吗？提交后将不能再对文件进行修改。"
                      onConfirm={this.commitInspection}
                      okText="是"
                      cancelText="否">
                      <Button
                        size="middle"
                        type="primary"
                      >
                        提交成果
                      </Button>
                    </Popconfirm>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
              <div style={{height: 'calc(100vh - 140px)'}}>
                <Viewer carbon={myCurrentAudit.content} title={myCurrentAudit.filename} key={Math.random()}/>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  //表格变化
  handleTableChange = (pagination, filters, sorter, extra) => {
    this.setState((state) => {
      return Object.assign({}, state, {paginationProps: {...pagination}});
    });
  };

  //提交文件
  commitInspection = async () => {
    const { myCurrentAudit, commitInspection, username } = this.props;
    if(myCurrentAudit.filename === "未知文件"){
      message.error("请先选择一份审核文件！");
    }
    else if(myCurrentAudit.onUpload === null || (myCurrentAudit.onUpload.discourse && myCurrentAudit.onUpload.discourse.topic && myCurrentAudit.onUpload.discourse.topic === '【新语料】')){
      message.error("待上传结果为空！请先审核再上传！");
    }
    else if(myCurrentAudit.schedule === 2){
      message.error("已经上传的文件不能再修改！");
    }
    else{
      if(await commitInspection({tid: myCurrentAudit.taskname, fid: myCurrentAudit.filename})){
        message.success("提交成功！");
        this.refresh({taskname: myCurrentAudit.taskname, filename: myCurrentAudit.filename, schedule: 2, auditor: username});
      }
      else message.error("提交失败！");
    }
  };

  //刷新
  refresh = async (auditData) => {
    const { username, getMyAuditTasks, getMyAuditList, getAuditContent } = this.props;
    if(typeof username === "undefined"){
      message.error("当前用户登录状态存在问题！请尝试重新登录解决问题！");
    }
    await this.setState({loading: true});
    const auditTasks = await getMyAuditTasks(username);
    await getMyAuditList(auditTasks);
    await getAuditContent(auditData);
    await this.setState({loading: false});
  };

}

const mapStateToProps = (state) => {
  return {
    myAuditList: state.mine.myAuditList,
    myCurrentAudit: state.mine.myCurrentAudit,
    username: state.login.username,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getMyAuditTasks(username){
      //获取用户担任审核员的任务
      return new Promise(async (resolve) => {
        resolve(await actionCreators.getMyAuditTasks(username));
      })
    },
    getMyAuditList(auditTasks){
      //获取我的审核列表
      return new Promise(async (resolve) => {
        await dispatch(actionCreators.getMyAuditList(auditTasks));
        resolve();
      })
    },
    getAuditContent(auditData){
      //获取当前审核文件的信息
      dispatch(actionCreators.getAuditContent(auditData));
    },
    commitInspection(result){
      //提交审核成果
      return new Promise(async (resolve) => {
        resolve(await actionCreators.commitInspection(result));
      })
    },
  }
};

export default connect(mapStateToProps,mapDispatchToProps)(Audit);
