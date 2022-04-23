import React from "react";
import { Graph, Node } from "@antv/x6";
import { Props } from "./index"
import { Card, Col, message, Row, Space } from "antd"
import { ReactShape } from "@antv/x6-react-shape";
import '@antv/x6-react-shape'

export class DialogueViewer extends React.Component<Props> {

  graph?: Graph
  graphContainerRef = React.createRef<HTMLDivElement>();
  state = {}

  render() {

    const header = (
      <div style={{ backgroundColor: "inherit" }}>
        <Card size="small">
          {this.props.title}
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
          style={{ width: "100%", flexGrow: 1, overflowY: "scroll", overflowX: "hidden" }}>
          <div ref={this.graphContainerRef} style={{ width: "100%" }} />
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.componentDidUpdate()
  }

  componentDidUpdate() {

    this.graph = new Graph({
      container: this.graphContainerRef.current!,
      grid: false,
      interacting: false,
      mousewheel: true,
      panning: true,
    })

    var carbon = this.props.carbon!;

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
      nodes.push(this.graph!.addNode({
        x: 5,
        y: 5 + 47 * i,
        height: 37,
        width: 0.88 * this.graphContainerRef.current!.clientWidth,
        shape: "react-shape",
        component: (
          <DialogueNode
            index={i + 1}
            text={carbon.texts![i]}
            speaker={carbon.speakers![i]}
            session={carbon.sessions![i]} />
        ),
        ports: {
          groups: {
            group1: {
              position: "right",
              attrs: {
                circle: {
                  r: 0,
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
      }))
    }
    // console.log(nodes)

    for (var i = 0; i < carbon.address_to.length; i++) {
      var source = nodes[carbon.address_to[i][1]]
      var target = nodes[carbon.address_to[i][0]]
      var edge = this.graph!.addEdge({
        source: { cell: source, port: "port" },
        target: { cell: target, port: "port" },
        connector: "smooth",
        vertices: [
          { x: 0.95 * this.graphContainerRef.current!.clientWidth, y: 30 + 0.7 * source.getPosition().y + 0.3 * target.getPosition().y }
        ],
      })
      if (carbon.relations[i]) {
        edge.appendLabel({
          attrs: {
            text: {
              text: carbon.relations[i],
            },
          },
          position: {
            distance: 0.3,
          },
        })
      }
    }
    this.graph!.resize(this.graphContainerRef.current!.clientWidth, 50 + 47 * carbon.texts!.length)
  }

}

class DialogueNode extends React.Component<{
  node?: ReactShape,
  index: number,
  speaker: string,
  text: string,
  session?: string,
}> {

  render() {
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
              {this.props.index}
              {this.props.speaker}
            </Space>
          </Col>
          <Col span={13}>
            {this.props.text}
          </Col>
          <Col span={4}>
            {this.props.session}
          </Col>
        </Row>
      </div>
    )
  }
}