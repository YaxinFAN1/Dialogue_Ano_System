import React, {Component} from 'react';
import {Row, Col, Table, Typography, Switch, message} from 'antd';
import { connect } from "react-redux";

import { actionCreators } from "../CMGT/store";
import { Viewer, Editor } from '../../components/carbon';
import { makeColumnSearch } from "../../components/makeColumSearch";

/*//伪造数据
const corpusListData = [];
for (let i = 0; i < 100; i++) {
  corpusListData.push({
    key: (i+1).toString(),
    corpusname: `corpus ${i}`,
    group: `G${i}`,
  });
}
const currentCorpus = {
  corpusname: "corpus1",
  corpuscontent: {
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
};*/

class Corpus extends Component {
  constructor(props) {
    super(props);
    this.state={
      loading: true,
      paginationProps: {
        hideOnSinglePage: true,
        simple: true,
        current:this.props.currentPage,
        defaultCurrent: 1,
        pageSize: 20,
      },
      view: true,
      searchText: '',
      searchedColumn: '',
      selectedRowKeys: [],
    }
  }

  //switch切换组件
  is_view = () => {
    const { currentCorpus } = this.props;
    if(this.state.view === true){
      return  (
        <Viewer
          carbon={currentCorpus.corpusContent}
          title=
            {
              <span>
                  <Switch
                    checkedChildren="查看"
                    unCheckedChildren="编辑"
                    defaultChecked={true}
                    onChange={() => {this.setState({view: false});}}
                  />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span style={{fontSize: "170%"}}>{currentCorpus.corpusname}</span>
                </span>
            } />
      )
    }
    else{
      return (
        <Editor
          carbon={currentCorpus.corpusContent}
          key={Math.random()}
          title=
            {
              <span>
                  <Switch
                    checkedChildren="查看"
                    unCheckedChildren="编辑"
                    defaultChecked={false}
                    onChange={() => {this.setState({view: true});}}
                  />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span style={{fontSize: "170%"}}>{currentCorpus.corpusname}</span>
                </span>
            }
          onSave={(carbon) => this.onSave(carbon)}
          onExit={() => this.setState({view: true})}
        />
      )
    }
  };

  //保存
  onSave = async (corpuscontent) => {
    const { editCorpusContent, currentCorpus } = this.props;
    if(!currentCorpus.raw_corpusname){
      message.error("请先选择一份语料！");
      return new Promise(async (resolve) => resolve(false));
    }
    return await editCorpusContent({id: currentCorpus.raw_corpusname, content: corpuscontent});
  };

  componentDidMount() {
    this.props.getCorpusList().then(res => {
      this.setState({loading: false});
    });
  }

  render() {

    const { paginationProps, loading } = this.state;
    const { corpusList } = this.props;

    const columns = [
      {
        title: '语料名',
        dataIndex: 'corpusname',
        key: 'corpusname',
        align: 'center',
        width: '70%',
        ...makeColumnSearch(this, 'corpusname', '语料名'),
        ellipsis: true,
        render: (text,record) => (
          <Typography.Link
            onClick={() => this.props.getCorpusContent(record.raw_corpusname)}
          >
            {record.corpusname}
          </Typography.Link>
        ),
      },
      {
        title: '分组',
        dataIndex: 'group',
        key: 'group',
        align: 'center',
        ...makeColumnSearch(this, 'group', '分组名'),
        ellipsis: true,
        render: (text,record)=> (
          <Typography.Text>{record.group}</Typography.Text>
        )
      },
    ];

    return (
      <div style={{height: "100%"}}>
        <Row style={{height: "100%"}}>
          <Col span={5}>
            <div style={{height: "100%", overflowY: "hidden", display: "flex", flexDirection: "column"}}>
              <Table
                columns={columns}
                dataSource={corpusList}
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
              {this.is_view()}
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  //表格变化
  handleTableChange = (pagination, filters, sorter, extra) => {
    this.props.savePage(pagination.current);
    this.setState((state) => {
      return Object.assign({}, state, {paginationProps: {...pagination}});
    });
  };

  //复选框
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

}

const mapStateToProps = (state) => {
  return {
    corpusList: state.corpus.corpusList,
    currentCorpus: state.corpus.currentCorpus,
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
    editCorpusContent(corpuscontent){
      //修改单个熟语料内容
      return new Promise(async (resolve) => {
        resolve(await actionCreators.editCorpusContent(corpuscontent));
      });
    },
    savePage(currentPage){
      //保存当前页码
      dispatch(actionCreators.savePage(currentPage));
    },
  }
};

export default connect(mapStateToProps,mapDispatchToProps)(Corpus);
