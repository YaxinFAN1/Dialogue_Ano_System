import React from "react";
import { Graph, Markup, Node } from "@antv/x6";
import { Props } from "./index"
import { Alert, Button, Card, Col, Divider, Input, message, Modal, Row, Select, Space, Tooltip, Typography } from "antd"
import { ReactShape } from "@antv/x6-react-shape";
import '@antv/x6-react-shape'
import { CloseOutlined, EditOutlined, MinusCircleFilled, PlusOutlined, RollbackOutlined, SaveOutlined } from "@ant-design/icons";
import ReactDOM from "react-dom";
import { applyMiddleware, createStore, Dispatch } from "redux";
import thunk from "redux-thunk";
import ApiUtil, { handleError } from "../../../utils/api";
import axios from "axios";

export class DialogueEditor extends React.Component<Props> {

  graph?: Graph
  graphContainerRef = React.createRef<HTMLDivElement>();
  state = {
    saved: true,
    history: new Array<Function>(),
  };
  nodeMapping = new Map<string, number>()
  edgeMapping = new Map<string, string>()
  strAddressToMapping = new Map<string, number>()
  labelRefMapping = new Map<string, React.RefObject<Label>>()

  render() {

    const header = (
      <div style={{ backgroundColor: "inherit" }}>
        <Card size="small">
          {this.props.title}
          <Space style={{ float: "right" }}>
            {!this.state.saved && (
              <Alert
                message="修改未保存"
                type="warning"
                showIcon
                style={{ height: 32 }}
              />
            )}
            <Tooltip title="撤销">
              <Button
                type="primary"
                disabled={this.state.history.length == 0}
                shape="circle"
                icon={<RollbackOutlined />}
                onClick={this.rollback}
              />
            </Tooltip>
            <Tooltip title="保存">
              <Button
                type="primary"
                shape="circle"
                icon={<SaveOutlined />}
                onClick={this.save}
              />
            </Tooltip>
            <Tooltip title="退出">
              <Button
                type="primary"
                shape="circle"
                icon={<CloseOutlined />}
                onClick={this.props.onExit}
              />
            </Tooltip>
          </Space>
        </Card>
        <hr color="#e0e0e0" />
      </div>
    )

    return (
      <div style={{ height: "100%", display: "flex", flexFlow: "column" }}>
        <div style={{ width: "100%" }}>
          {header}
        </div>
        <div
          style={{ width: "100%", flexGrow: 1, overflow: "hidden" }}>
          <div ref={this.graphContainerRef} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
    )
  }

  componentDidMount() {

    const clientWidth = this.graphContainerRef.current!.clientWidth

    Graph.unregisterRouter("myRouter")

    Graph.registerRouter("myRouter", (vertices, args, view) => {
      var x = clientWidth * 0.95
      var { sourcePoint, targetPoint } = view
      if (!sourcePoint || !targetPoint) {
        return vertices
      }
      var y = 0.7 * sourcePoint.y + 0.3 * targetPoint.y
      return [{ x, y }]
    })

    this.graph = new Graph({
      container: this.graphContainerRef.current!,
      grid: false,
      history: false,
      mousewheel: true,
      panning: false,
      scroller: {
        enabled: true,
        pageWidth: clientWidth,
        pannable: true,
      },
      interacting: {
        // edge
        edgeMovable: false,
        edgeLabelMovable: false,
        arrowheadMovable: false,
        vertexMovable: true,
        vertexAddable: false,
        vertexDeletable: false,
        useEdgeTools: true,

        // node
        nodeMovable: false,
        magnetConnectable: true,
        stopDelegateOnDragging: false,
      },
      connecting: {
        snap: true,
        connector: "smooth",
        allowBlank: false,
        allowMulti: false,
        allowNode: false,
        allowLoop: false,
        allowEdge: false,
        router: 'myRouter',
        validateEdge: ({ edge }) => {
          if (!this.props.carbon!.address_to) {
            this.props.carbon!.address_to = []
          }
          var addressTo = [this.nodeMapping.get(edge.getTargetCellId())!, this.nodeMapping.get(edge.getSourceCellId())!]
          const s = String(addressTo)
          const i = this.props.carbon!.address_to.length
          this.props.carbon!.address_to.push(addressTo)
          this.edgeMapping.set(edge.id, s)
          this.strAddressToMapping.set(s, i)
          this.setState({ saved: false })
          edge.setRouter("normal")
          edge.setVertices([{
            x: 0.95 * clientWidth,
            y: 0.7 * edge.getSourcePoint().y + 0.3 * edge.getTargetPoint().y,
          }])
          edge.appendLabel({
            markup: Markup.getForeignObjectMarkup(),
            attrs: {
              fo: {
                width: 80,
                height: 30,
                x: -10,
                y: -15,
              },
            },
            position: 0.25,
          })
          this.addHistory(() => {
            // TODO
            this.removeEdge({ cell: edge }, false)
          })
          return true
        }
      },
      onEdgeLabelRendered: ({ edge, selectors }) => {
        const content = selectors.foContent as HTMLDivElement
        if (content) {
          const s = this.edgeMapping.get(edge.id)!
          const relation = this.props.carbon!.relations ?
            this.props.carbon!.relations[this.strAddressToMapping.get(s)!] : ""
          var ref = React.createRef<Label>();
          this.labelRefMapping.set(s, ref)
          ReactDOM.render(
            <Label
              relation={relation ? relation : ""}
              handlers={this.updateEdge(s)}
              addHistory={this.addHistory}
              ref={ref}
            />,
            content
          )
        }
      },
    })

    this.graph.on('edge:mouseenter', ({ cell }) => {
      cell.addTools('vertices', 'onhover')
      cell.addTools(
        [
          {
            name: 'button-remove',
            args: {
              distance: 7,
              onClick: this.removeEdge,
            },
          },
        ],
        'onhover'
      )
    })

    this.graph.on('edge:mouseleave', ({ cell }) => {
      // if (cell.hasTool('button-remove')) {
      //   cell.removeTool('button-remove')
      // }
      if (cell.hasTools('onhover')) {
        cell.removeTools()
      }
    })

    var { carbon } = this.props;
    if (!carbon) {
      message.error("读取文本错误！");
      return
    }

    if (carbon.texts === undefined ||
      carbon.speakers === undefined ||
      carbon.address_to === undefined) {
      message.error("解析文本数据错误。")
      return;
    }

    if (!carbon.sessions) {
      carbon.sessions = []
    }
    if (!carbon.relations) {
      carbon.relations = []
    }

    var nodes: Node[] = []
    for (var i = 0; i < carbon.texts!.length; i++) {
      var node = this.graph!.addNode({
        x: 5,
        y: 5 + 47 * i,
        height: 37,
        width: 0.88 * clientWidth,
        shape: "react-shape",
        component: (
          <DialogueNode
            index={i + 1}
            text={carbon.texts![i]}
            speaker={carbon.speakers![i]}
            session={carbon.sessions![i]}
            handlers={this.updateNode(i)}
            addHistory={this.addHistory}
          />
        ),
        ports: {
          groups: {
            group1: {
              position: "right",
              attrs: {
                circle: {
                  r: 8,
                  magnet: true,
                }
              }
            }
          },
          items: [
            {
              id: "port",
              group: "group1",
            },
          ]
        }
      })
      nodes.push(node)
      this.nodeMapping.set(node.id, i)
    }

    for (i = 0; i < carbon.address_to.length; i++) {
      var source = nodes[carbon.address_to[i][1]]
      var target = nodes[carbon.address_to[i][0]]
      var edge = this.graph!.addEdge({
        source: { cell: source, port: "port" },
        target: { cell: target, port: "port" },
        connector: "smooth",
        vertices: [
          { x: 0.95 * clientWidth, y: 30 + 0.7 * source.getPosition().y + 0.3 * target.getPosition().y }
        ],
        router: "normal",
      })
      const s = String(carbon.address_to[i])
      this.edgeMapping.set(edge.id, s)
      this.strAddressToMapping.set(s, i)
      edge.appendLabel({
        markup: Markup.getForeignObjectMarkup(),
        attrs: {
          fo: {
            width: 80,
            height: 30,
            x: -10,
            y: -15,
          },
        },
        position: 0.25,
      })
    }
    // this.graph!.resize(this.graphContainerRef.current!.clientWidth, 50 + 47 * carbon.texts!.length)
  }

  save = async () => {
    const { onSave, carbon } = this.props
    const saved = onSave(carbon!)
    this.setState({
      saved: saved,
    })
    if (saved) message.success("保存成功");
    else message.error("保存失败");
  }

  updateNode = (i: number) => {
    return {
      updSession: (value: any) => {
        this.props.carbon!.sessions![i] = value
        this.setState({ saved: false })
      },
      updSpeaker: (value: any) => {
        this.props.carbon!.speakers![i] = value
        this.setState({ saved: false })
      },
      updText: (value: any) => {
        this.props.carbon!.texts![i] = value
        this.setState({ saved: false })
      }
    }
  }

  updateEdge = (s: string) => {
    return {
      updRelation: (value: any) => {
        if (!this.props.carbon!.relations) {
          this.props.carbon!.relations = []
        }
        const i = this.strAddressToMapping.get(s!)!
        this.props.carbon!.relations[i] = value
        this.labelRefMapping.get(s)!.current!.setState({ relation: value })
        this.setState({ saved: false })
      }
    }
  }

  removeAddressTo = (s: string) => {
    const i = this.strAddressToMapping.get(s)!
    this.strAddressToMapping.delete(s)
    this.props.carbon!.address_to!.splice(i, 1)
    this.props.carbon!.relations!.splice(i, 1)
    this.strAddressToMapping.forEach((v, k) => {
      if (v > i) {
        this.strAddressToMapping.set(k, v - 1)
      }
    })
  }

  removeEdge = (args: any, addHistory: boolean = true) => {
    const { cell } = args
    const s = this.edgeMapping.get(cell.id)!
    if (addHistory) {
      const index = this.strAddressToMapping.get(s)!
      const address_to = this.props.carbon!.address_to![index]
      const relation = this.props.carbon!.relations![index]
      this.addHistory(() => {
        if (!this.props.carbon!.address_to) {
          this.props.carbon!.address_to = []
        }
        if (!this.props.carbon!.relations) {
          this.props.carbon!.relations = []
        }
        const i = this.props.carbon!.address_to.length
        this.props.carbon!.address_to.push(address_to)
        this.props.carbon!.relations[i] = relation
        this.strAddressToMapping.set(s, i)
        this.edgeMapping.set(cell.id, s)
        this.graph!.addEdge(cell)
      })
    }
    this.removeAddressTo(s)
    this.setState({ saved: false })
    cell.remove()
  }

  rollback = () => {
    var history = this.state.history.slice();
    var f = history.pop()
    if (!f) {
      return false
    }
    f()
    this.setState({ history })
  }

  addHistory = (op: Function) => {
    var history = this.state.history.concat(op).slice(-20) // 最多撤回20次
    this.setState({ history })
  }

}

class DialogueNode extends React.Component<{
  node?: ReactShape,
  index: number,
  speaker: string,
  text: string,
  session?: string,
  handlers: any,
  addHistory: Function,
}> {

  render() {

    const { speaker, text, session, addHistory } = this.props;
    const { updSession, updSpeaker, updText } = this.props.handlers;

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          border: "2px solid",
          borderRadius: 20,
          whiteSpace: "nowrap",
        }}
      >
        <Row justify="space-around">
          <Col span={5}>
            <Space>
              <Typography.Text>{this.props.index}</Typography.Text>
              <RollbackableInput value={speaker} updValue={updSpeaker} addHistory={addHistory} />
            </Space>
          </Col>
          <Col span={13}>
            <RollbackableInput value={text} updValue={updText} addHistory={addHistory} />
          </Col>
          <Col span={4}>
            <RollbackableInput value={session ? session : ""} updValue={updSession} addHistory={addHistory} />
          </Col>
        </Row>
      </div>
    )
  }
}

class RollbackableInput extends React.Component<{
  value: string,
  updValue: Function,
  addHistory: Function,
}>{

  state = {
    value: this.props.value,
  }

  last: string = ""

  render(): React.ReactNode {
    var { addHistory, updValue } = this.props;
    return (
      <Input
        value={this.state.value}
        onFocus={() => { this.last = this.state.value }}
        onChange={e => { this.setState({ value: e.target.value }) }}
        onBlur={() => {
          const { value } = this.state
          if (value === this.last) {
            return false
          }
          updValue(value)
          addHistory(() => {
            this.setState({ value: this.last });
            updValue(this.last)
          })
        }}
      />
    )
  }

}

class Label extends React.Component<{
  relation: string,
  handlers: any
  addHistory: Function,
}> {

  state = {
    relation: this.props.relation,
    relationList: new Array<string>(),
    newRelation: "",
    modalVisible: false,
  }
  unsubscribe?: Function

  render() {
    const { addHistory, handlers } = this.props;
    const { updRelation } = handlers;
    const { relationList } = this.state;
    return (
      <>
        <Typography.Link
          style={{ textAlign: "center", fontSize: 22 }}
          onClick={() => { this.getRelations(); this.setState({ modalVisible: true }) }}
        >
          {this.state.relation ? this.state.relation : <EditOutlined />}
        </Typography.Link>
        <Modal visible={this.state.modalVisible}
          onOk={() => { this.setState({ modalVisible: false }) }}
          onCancel={() => { this.setState({ modalVisible: false }) }}
          maskClosable={true} width="300px" closable={false}
        >
          <Select
            style={{ width: "250px" }}
            value={this.state.relation}
            optionLabelProp="value"
            allowClear={true}
            onChange={(value) => {
              const { relation } = this.state;
              addHistory(() => {
                updRelation(relation)
              })
              updRelation(value)
            }}
            dropdownRender={menu => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space align="center" style={{ padding: '0 8px 4px' }}>
                  <Input value={this.state.newRelation} onChange={({ target }) => { this.setState({ newRelation: target.value }) }} />
                  <Typography.Link onClick={this.addItem} style={{ whiteSpace: 'nowrap' }}>
                    <PlusOutlined /> 添加
                  </Typography.Link>
                </Space>
              </>
            )}
          >
            {relationList.map(item => (
              <Select.Option key={item} value={item}>
                <Space>
                  <MinusCircleFilled 
                    onClick={e => {this.delItem(item); e.stopPropagation()}}/>
                  {item}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Modal>
      </>
    )
  }

  componentDidMount() {
    this.unsubscribe = relationStore.subscribe(() => {
      if (this.state.modalVisible) {
        this.setState({ relationList: relationStore.getState() })
      }
    })
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  addItem = () => {
    const { newRelation } = this.state;
    if (newRelation === "") {
      return false
    }
    relationStore.dispatch(addRelation(newRelation))
    this.setState({
      newRelation: "",
    })
  }

  delItem = (item: string) => {
    relationStore.dispatch(delRelation(item))
  }

  getRelations = () => {
    relationStore.dispatch(getRelations())
  }

}

var reducer = (state: Array<string> = [], action: any) => {
  return action.value ? action.value : state
}

var relationStore = createStore(reducer, applyMiddleware(thunk))

const getRelations = () => {
  return (dispatch: Dispatch) => {
    axios.post(ApiUtil.API_RELATIONS_GET, JSON.stringify({}), { headers: { 'Content-Type': 'application/json;charset=utf-8' } })
      .then(res => {
        if (res.status === 200) {
          const code = res.data[0];
          if (code === 0) dispatch({ type: "", value: res.data[1] });
          else {
            handleError(code, "获取关系列表错误");
          }
        }
      })
      .catch(err => {
        message.error("获取关系列表失败！");
      })
  }
};

const addRelation = (item: string) => {
  return (dispatch: Dispatch) => {
    axios.post(ApiUtil.API_RELATIONS_ADD, JSON.stringify({value: item}), { headers: { 'Content-Type': 'application/json;charset=utf-8' } })
      .then(res => {
        if (res.status === 200) {
          const code = res.data[0];
          if (code === 0) dispatch({ type: "", value: res.data[1] });
          else {
            handleError(code, "获取关系列表错误");
          }
        }
      })
      .catch(err => {
        message.error("获取关系列表失败！");
      })
  }
};

const delRelation = (item: string) => {
  return (dispatch: Dispatch) => {
    axios.post(ApiUtil.API_RELATIONS_DEL, JSON.stringify({value: item}), { headers: { 'Content-Type': 'application/json;charset=utf-8' } })
      .then(res => {
        if (res.status === 200) {
          const code = res.data[0];
          if (code === 0) dispatch({ type: "", value: res.data[1] });
          else {
            handleError(code, "获取关系列表错误");
          }
        }
      })
      .catch(err => {
        message.error("获取关系列表失败！");
      })
  }
};