import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Col, Row, Table, Typography, Button, Space, Popconfirm, message} from "antd";

import { Editor } from "../../../../components/carbon";
import {FileSyncOutlined, IssuesCloseOutlined} from "@ant-design/icons";
import {actionCreators} from "../../store";


class _Audit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paginationProps: {
        hideOnSinglePage: true,
        simple: true,
        current:1,
        defaultCurrent: 1,
        pageSize: 20,
      },
      currentCarbon: this.props.location.state.record.onUpload,
      currentId: this.props.location.state.record.filename,
      record: this.props.location.state.record,
    }
  }

  onExit = async () => {
    const { getAuditContent } = this.props;
    const { record } = this.state;
    await getAuditContent({taskname: record.taskname, filename: record.filename, schedule: record.schedule, auditor: record.auditor});
    this.props.history.push({pathname: '/users/mytask/audit'});
  };

  onSave = async (carbon) => {
    const {setInspectionResult} = this.props;
    const {record} = this.state;
    if(record.schedule === 2){
      message.error("该份审核文件已提交，不能再修改！");
      return new Promise(async (resolve) => resolve(false));
    }
    return await setInspectionResult({tid: record.taskname, fid: record.filename, result: carbon});
  };

  //确定加什么后缀
  makeCurrentID = (currentId) => {
    if(currentId.charAt(currentId.length-1) !== "$") return currentId + "(待上传审核成果)";
    else return currentId.split("$")[0] + "(标注成果)";
  };

  render() {
    const { currentCarbon, currentId, record, paginationProps } = this.state;

    let annotateListData = [];
    if(record.filename !== "未知任务"){
      for(let i=0; i<record.annotators.length; i++){
        annotateListData.push({
          key:  (i+1).toString(),
          filename: record.filename,
          annotationname: record.filename + '_' + record.annotators[i] + '$',
          annotator: record.annotators[i],
          taskname: record.taskname,
        });
      }
    }

    const columns = [
      {
        title: '标注任务名',
        dataIndex: 'annotationname',
        key: 'annotationname',
        align: 'center',
        width: '70%',
        ellipsis: true,
        render: (text,record) => (
          <Typography.Link
            onClick={() => this.getAnnotationResult({tid: record.taskname, fid: record.filename, uid: record.annotator, annotationname: record.annotationname})}
          >
            {record.annotationname}
          </Typography.Link>
        ),
      },
      {
        title: '标注员',
        dataIndex: 'annotator',
        key: 'annotator',
        align: 'center',
        ellipsis: true,
        render: (text,record) => (
          <div>{record.annotator}</div>
        )
      },
    ];


    return (
      <div style={{height: "100%"}}>
        <Row style={{height: "100%"}}>
          <Col span={6}>
            <Button
              size="large"
              icon={<IssuesCloseOutlined />}
              block={true}
              onClick={this.checkOnUpload}
            >
              查看待上传审核成果
            </Button>
            <div>
              <Table
                columns={columns}
                dataSource={annotateListData}
                pagination={paginationProps}
                scroll={{ y: 'calc(100vh - 180px)'}}
                size="middle"
                bordered
              />
            </div>
          </Col>
          <Col span={18}>
            <div style={{height: "100vh"}}>
              <Editor
                carbon={currentCarbon}
                onSave={(carbon) => this.onSave(carbon)}
                onExit={this.onExit}
                key={Math.random()}
                title={
                  <span>
                    <Space>
                      <Popconfirm
                        title="确定重置吗？此操作将把待上传审核文件内容置为空。"
                        onConfirm={() => this.resetResult({tid: record.taskname, fid: record.filename, result: null})}
                        okText="是"
                        cancelText="否">
                          <Button
                            size="middle"
                            icon={<FileSyncOutlined />}
                          >
                        重置
                      </Button>
                      </Popconfirm>
                      <span>{this.makeCurrentID(currentId)}</span>
                    </Space>
                </span>
                }
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

  //获取标注成果
  getAnnotationResult = async (result) => {
    const carbon = await this.props.getAnnotationResult(result);
    await this.setState((state) => {
      return Object.assign({},state,{currentCarbon: carbon, currentId: result.annotationname});
    })
  };

  //查看待上传审核成果
  checkOnUpload = async () => {
    const { record } = this.state;
    const carbon = await this.props.getInspectionResult({tid: record.taskname, fid: record.filename});
    await this.setState((state) => {
      return Object.assign({},state,{currentCarbon: carbon, currentId: record.filename});
    })
  };

  //设置审核成果
  resetResult = async (result) => {
    const { setInspectionResult } = this.props;
    const { record } = this.state;
    if(record.schedule === 2){
      message.error("该份审核文件已提交，不能再修改！");
      return ;
    }
    if(await setInspectionResult(result)){
      message.success("重置成功！");
      await this.checkOnUpload();
    }
    else message.error("重置失败！");
  };

}

const mapStateToProps = (state) => {
  return {

  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAuditContent(auditData){
      //获取当前审核文件的信息
      dispatch(actionCreators.getAuditContent(auditData));
    },
    getAnnotationResult(commission){
      //获取标注成果，无论是否为空，直接返回结果
      return new Promise(async (resolve) => {
        resolve(await actionCreators.getAnnotationResult(commission));
      })
    },
    getInspectionResult(inspection){
      //获取审核成果
      return new Promise(async (resolve) => {
        resolve(await actionCreators.getInspectionResult(inspection));
      })
    },
    setInspectionResult(result){
      //设置审核结果
      return new Promise(async (resolve) => {
        resolve(await actionCreators.setInspectionResult(result));
      })
    },
  }
};

export default connect(mapStateToProps,mapDispatchToProps)(_Audit);
