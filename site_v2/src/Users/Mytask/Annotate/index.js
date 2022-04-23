import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Col, message, Popconfirm, Row, Space, Table, Typography} from "antd";
import {CloudUploadOutlined, FileSyncOutlined} from "@ant-design/icons";

import {actionCreators} from "../store";
import {Editor} from "../../../components/carbon";
import {makeBadge} from "../../../components/makeBadge";
import {makeColumnSearch} from "../../../components/makeColumSearch";

/*
//伪造数据
const annotateListData = [];
for (let i = 0; i < 100; i++) {
  let v = Math.round(i / 50);
  annotateListData.push({
    key: (i+1).toString(),
    annotationname: `annotation ${i}`,
    schedule: v
  });
}
const currentAnnotationContent = {
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
const currentAnnotation = {
  key: '3',
  annotationname: 'file 3',
  schedule: 0,
  content: currentAnnotationContent,
};
*/

class Annotate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paginationProps: {
        hideOnSinglePage: true,
        simple: true,
        current: 1,
        defaultCurrent: 1,
        pageSize: 20,
      },
      loading: true,
      searchText: '',
      searchedColumn: '',
    };
    this.resetResult = this.resetResult.bind(this);
  }

  onExit = () => {
    message.info("功能已转移至[重置]按钮");
  };

  onSave = async (carbon) => {
    const { myCurrentAnnotation, setAnnotationResult } = this.props;
    if(myCurrentAnnotation.content === null){
      message.error("请先选择一份标注任务！");
      return new Promise(async (resolve) => resolve(false));
    }
    else if(myCurrentAnnotation.schedule === 1){
      message.error("该份标注任务已提交，不能再修改！");
      return new Promise(async (resolve) => resolve(false));
    }
    return await setAnnotationResult(carbon);
  };

  componentDidMount() {
    const { username, getMyAnnotationTasks, getMyAnnotationList } = this.props;
    if(typeof username === "undefined"){
      message.error("当前用户登录状态存在问题！请尝试重新登录解决问题！");
    }
    //获取登录用户，获取该用户标注的任务列表，获取用户标注的文件列表
    getMyAnnotationTasks(username).then(annotationTasks => {
      getMyAnnotationList(annotationTasks,username).then(res => {
        this.setState({loading: false});
      });
    });
  }

  render() {
    const {  paginationProps, loading } = this.state;
    const { myAnnotationList, myCurrentAnnotation, username, getAnnotationContent } = this.props;

    const columns = [
      {
        title: '标注任务名',
        dataIndex: 'annotationname',
        key: 'annotationname',
        ...makeColumnSearch(this,'annotationname','标注任务名'),
        align: 'center',
        width: '70%',
        ellipsis: true,
        render: (text,record) => (
          <Typography.Link
            onClick={() => getAnnotationContent({tid: record.taskname, fid: record.annotationname, uid: username, schedule: record.schedule})}
          >
            {record.annotationname}
          </Typography.Link>
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
            text: '未标注',
            value: 0,
          },
          {
            text: '已标注',
            value: 1,
          },
        ],
        onFilter: (value, record) => record.schedule === value,
        render: (text, record) => {
          return makeBadge(record.schedule,1);
        }
      },
    ];

    return (
      <div style={{height: "100%"}}>
        <Row style={{height: "100%"}}>
          <Col span={5}>
            <div>
              <Table
                columns={columns}
                loading={loading}
                dataSource={myAnnotationList}
                scroll={{ y: 'calc(100vh - 180px)'}}
                size="middle"
                pagination={paginationProps}
                onChange={this.handleTableChange}
                bordered
              />
            </div>
          </Col>
          <Col span={19}>
            <div style={{height: "100vh"}}>
              <Editor
                carbon={myCurrentAnnotation.content}
                onSave={(carbon) => this.onSave({tid: myCurrentAnnotation.taskname, fid: myCurrentAnnotation.annotationname, uid: username, result: carbon})}
                onExit={this.onExit}
                key={Math.random()}
                title={<span>
                    <Space>
                      <Popconfirm
                        title="确定重置吗？此操作将把标注任务文件恢复成生语料文件。"
                        onConfirm={() => this.resetResult({tid: myCurrentAnnotation.taskname, fid: myCurrentAnnotation.annotationname, uid: username, result: null})}
                        okText="是"
                        cancelText="否">
                          <Button
                            size="middle"
                            icon={<FileSyncOutlined />}
                          >
                        重置
                      </Button>
                      </Popconfirm>
                      <Popconfirm
                      title="确定提交吗？提交前请务必先保存。提交后将不能再修改。"
                      onConfirm={() => this.commitAnnotation({tid: myCurrentAnnotation.taskname, fid: myCurrentAnnotation.annotationname, uid: username})}
                      okText="是"
                      cancelText="否">
                          <Button size="middle" icon={<CloudUploadOutlined />}>
                          提交
                          </Button>
                      </Popconfirm>
                      <span>{myCurrentAnnotation.annotationname}</span>
                    </Space>
                </span>}
              />
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

  //刷新
  refresh = async (annotationData) => {
    const { username, getMyAnnotationTasks, getMyAnnotationList, getAnnotationContent } = this.props;
    if(typeof username === "undefined"){
      message.error("当前用户登录状态存在问题！请尝试重新登录解决问题！");
    }
    await this.setState({loading: true});
    const annotationTasks = await getMyAnnotationTasks(username);
    await getMyAnnotationList(annotationTasks,username);
    await getAnnotationContent(annotationData);
    await this.setState({loading: false});
  };

  //重置标注任务
  resetResult = async (result) => {
    //设置标注结果为null，重新执行获取标注成果
    const { myCurrentAnnotation, setAnnotationResult, getAnnotationContent } = this.props;
    if(myCurrentAnnotation.content === null){
      message.error("请先选择一份标注任务！");
    }
    else if(myCurrentAnnotation.schedule === 1){
      message.error("该份标注任务已提交，不能再修改！");
    }
    else{
      await setAnnotationResult(result);
      await getAnnotationContent({tid: result.tid, fid: result.fid, uid: result.uid});
      message.success("重置成功！");
    }
  };

  //提交标注任务
  commitAnnotation = async (commission) => {
    const { myCurrentAnnotation, commitAnnotation, getAnnotationResult } = this.props;
    if(myCurrentAnnotation.content === null){
      message.error("请先选择一份标注任务！");
    }
    else if(myCurrentAnnotation.schedule === 1){
      message.error("该份标注任务已提交，不能再修改！");
    }
    else {
      //检查一下是否为空
      const annotationResult = await getAnnotationResult(commission);
      if(annotationResult === null){
        message.error("标注任务成果不能为空！请先保存后再提交！")
        return ;
      }
      if(await commitAnnotation(commission)){
        message.success("提交成功！");
        await this.refresh(commission);
      }
      else{
        message.error("提交失败！");
      }
    }
  };
}

const mapStateToProps = (state) => {
  return {
    myAnnotationList: state.mine.myAnnotationList,
    myCurrentAnnotation: state.mine.myCurrentAnnotation,
    username: state.login.username,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getMyAnnotationTasks(username){
      //获取用户担任标注员的任务
      return new Promise(async (resolve) => {
        resolve(await actionCreators.getMyAnnotationTasks(username));
      })
    },
    getMyAnnotationList(annotationTasks,username){
      //获取我的标注列表
      return new Promise(async (resolve) => {
        await dispatch(actionCreators.getMyAnnotationList(annotationTasks,username));
        resolve();
      })
    },
    getAnnotationResult(commission){
      //获取标注成果，无论是否为空，直接返回结果
      return new Promise(async (resolve) => {
        resolve(await actionCreators.getAnnotationResult(commission));
      })
    },
    getAnnotationContent(annotationData){
      //获取标注结果，如果为空，则改成获取生语料内容
      dispatch(actionCreators.getAnnotationContent(annotationData));
    },
    setAnnotationResult(result){
      //设置标注结果
      return new Promise(async (resolve) => {
        resolve(await actionCreators.setAnnotationResult(result));
      })
    },
    commitAnnotation(commission){
      //提交标注结果
      return new Promise(async (resolve) => {
        resolve(await actionCreators.commitAnnotation(commission));
      })
    },
  }
};

export default connect(mapStateToProps,mapDispatchToProps)(Annotate);
