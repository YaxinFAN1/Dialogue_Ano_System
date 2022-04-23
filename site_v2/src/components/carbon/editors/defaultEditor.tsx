import * as AntdIcons from "@ant-design/icons";
import G6, { Graph } from "@antv/g6";
import { IEdge, INode } from "@antv/g6/lib/interface/item";
import { GraphData, IG6GraphEvent } from "@antv/g6/lib/types";
import * as Antd from "antd";
import { cloneDeep } from "lodash";
import React, { ReactNode } from "react";
import ReactDOM from "react-dom";
import {
  Carbon,
  carbon2graph,
  CEdgeConfig,
  Discourse,
  NEdgeConfig,
  Paragraph,
  PNodeConfig,
  RNodeConfig,
} from "../common";
import { graph2carbon, GraphError } from "../compiler";

// 版本信息
export let version = "2.4";

// 默认新语料模板
export let defaultNewCarbon: Carbon = {
  discourse: {
    topic: "【新语料】",
    dateline: "",
    lead: "",
    abstract: "",
  },
  roots: [],
};

export interface Props {
  carbon: Carbon | null;
  title: ReactNode;
  onSave: (carbon: Carbon) => boolean;
  onExit: () => void;
}

/**
 * @description
 * 注意：该组件是一个非受控组件！
 */
export class DefaultEditor extends React.Component<Props> {
  state = {
    saved: true,
    showHelper: false,
    windowLayout: 0,
  };
  discourse: Discourse;
  paragraphs: Paragraph[];
  graph: GuYuhaoGraph | null = null;
  graphData: GraphData;

  markUnsaved = () => {
    if (this.state.saved) this.setState({ saved: false });
  };

  constructor(props: Props) {
    super(props);

    const carbon = this.props.carbon
      ? cloneDeep(this.props.carbon)
      : cloneDeep(defaultNewCarbon);
    const [graphData, paragraphs] = carbon2graph(carbon);

    this.discourse = carbon.discourse;
    this.paragraphs = paragraphs;
    this.graphData = graphData;
  }

  render() {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 标题栏 */}
        <div style={{ backgroundColor: "inherit" }}>
          <Antd.Card size="small">
            {this.props.title}
            <Antd.Space style={{ float: "right" }}>
              <Antd.Select
                defaultValue={0}
                onChange={(value) => this.setState({ windowLayout: value })}
              >
                <Antd.Select.Option value={0}>双栏</Antd.Select.Option>
                <Antd.Select.Option value={1}>内容</Antd.Select.Option>
                <Antd.Select.Option value={2}>结构</Antd.Select.Option>
              </Antd.Select>
              {!this.state.saved && (
                <Antd.Alert
                  message="修改未保存"
                  type="warning"
                  showIcon
                  style={{ height: 32 }}
                />
              )}
              <Antd.Tooltip title="保存">
                <Antd.Button
                  type="primary"
                  shape="circle"
                  icon={<AntdIcons.SaveOutlined />}
                  onClick={() => this.save()}
                />
              </Antd.Tooltip>
              <Antd.Tooltip title="退出">
                <Antd.Button
                  type="primary"
                  shape="circle"
                  icon={<AntdIcons.CloseOutlined />}
                  onClick={this.props.onExit}
                />
              </Antd.Tooltip>
              <Antd.Tooltip title={"版本：" + version}>
                <Antd.Button
                  shape="circle"
                  icon={<AntdIcons.QuestionCircleOutlined />}
                  onClick={() => this.setState({ showHelper: true })}
                />
              </Antd.Tooltip>
            </Antd.Space>
          </Antd.Card>
          <hr color="#e0e0e0" />
          <Antd.Modal
            title={"CARBON Editor v" + version}
            visible={this.state.showHelper}
            onCancel={() => this.setState({ showHelper: false })}
            footer={null}
          >
            {helper}
          </Antd.Modal>
        </div>

        {/* 工作区 */}
        <div
          style={{
            height: "100%",
            overflowY: "hidden",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <ContentEditor
            editor={this}
            hidden={Boolean(this.state.windowLayout & 2)}
          />
          <StructureEditor
            editor={this}
            graphData={this.graphData}
            hidden={Boolean(this.state.windowLayout & 1)}
          />
        </div>
      </div>
    );
  }

  async save() {
    try {
      const newRoots = graph2carbon(this.graph!, this.paragraphs);
      const saved = await this.props.onSave({
        discourse: this.discourse,
        roots: newRoots,
      });
      if (saved !== this.state.saved) {
        this.setState({
          saved: saved,
        });
      }
      if (saved) Antd.message.success("保存成功");
      else Antd.message.error("保存失败");
    } catch (err) {
      Antd.message.error(String(err));
      if (err instanceof GraphError) {
        for (let i of err.items) {
          this.graph!.setItemState(i, "error", true);
        }
      }
    }
  }
}

const helper = (
  <>
    <h2>2.4 更新内容</h2>
    <ul>
      <li>添加窗口布局调整功能</li>
      <li>改善显示效果</li>
    </ul>
    <hr style={{ display: "block" }} />
    <h2>2.3 更新内容</h2>
    <ul>
      <li>易用性改进：默认中心会随类型的选取自动改变</li>
    </ul>
    <hr style={{ display: "block" }} />
    <h2>2.2 更新内容</h2>
    <ul>
      <li>更严格的错误检查：中心取制限制、Joint结点无中心</li>
      <li>取消“一次点击自动切换中心”功能</li>
      <li>默认中心选项框限制为1、2、3</li>
    </ul>
    <hr style={{ display: "block" }} />
    <h2>2.1 更新内容</h2>
    <ul>
      <li>优化界面：内容编辑器现在不再限制长段落输入框的高度</li>
      <li>补充取消选中结点的功能</li>
    </ul>
    <hr style={{ display: "block" }} />
    <h2>2.0 更新内容</h2>
    <ul>
      <li>架构重新设计，稳定性、可维护性大幅提高</li>
      <li>
        <b>增加操作撤销功能</b>
      </li>
      <li>增强的错误显示：现在保存错误的同时会让画布上出错元素突出显示</li>
      <li>简化操作：取消模式切换、取消操作保护锁</li>
      <li>功能增强：一次点击自动切换中心，不再需要手动调整每个边的状态</li>
    </ul>
  </>
);

//*
//* 内容编辑器子组件
//*

interface ContentEditorProps {
  editor: DefaultEditor;
  hidden: boolean;
}

class ContentEditor extends React.Component<ContentEditorProps> {
  render() {
    const editor = this.props.editor;
    let temp = [
      <DiscourseEditor
        discourse={editor.discourse}
        onChange={editor.markUnsaved}
        key={0}
      />,
    ];
    for (let i of editor.paragraphs) {
      temp.push(
        <ParagraphEditor
          paragraph={i}
          onChange={editor.markUnsaved}
          index={temp.length}
          key={temp.length}
        />
      );
    }
    return (
      <div
        style={{
          height: "100%",
          overflowY: "scroll",
          flexGrow: 1,
          flexBasis: "50%",
        }}
        hidden={this.props.hidden}
      >
        {temp}
      </div>
    );
  }
}

interface DiscourseEditorProps {
  onChange: () => void;
  discourse: Discourse;
}

class DiscourseEditor extends React.Component<DiscourseEditorProps> {
  state = { discourse: this.props.discourse };

  // 篇章信息编辑器
  render() {
    const discourse = this.state.discourse;

    let onPropChange = (prop: string) => {
      return ({ target: { value } }: any) => {
        (discourse as any)[prop] = value;
        this.forceUpdate();
        this.props.onChange();
      };
    };

    return (
      <div>
        <Antd.Divider orientation="left" style={{ margin: "10px 0px" }}>
          <b>摘要</b>
        </Antd.Divider>
        <Antd.Input
          addonBefore="主题"
          value={discourse["topic"]}
          onChange={onPropChange("topic")}
        />
        <Antd.Input
          addonBefore="电头"
          value={discourse["dateline"]}
          onChange={onPropChange("dateline")}
        />
        <Antd.Input
          addonBefore="导语"
          value={discourse["lead"]}
          onChange={onPropChange("lead")}
        />
        <Antd.Input.TextArea
          value={discourse["abstract"]}
          autoSize={true}
          onChange={onPropChange("abstract")}
        />
      </div>
    );
  }
}

interface ParagraphEditorProps {
  onChange: () => void;
  paragraph: Paragraph;
  index: number;
}

class ParagraphEditor extends React.Component<ParagraphEditorProps> {
  state = { paragraph: this.props.paragraph };

  render() {
    const paragraph = this.state.paragraph;
    const index = this.props.index;

    let onPropChange = (prop: string) => {
      return ({ target: { value } }: any) => {
        (paragraph as any)[prop] = value;
        this.forceUpdate();
        this.props.onChange();
      };
    };

    return (
      <div>
        <Antd.Divider orientation="left" style={{ margin: "10px 0px" }}>
          <b>{"P" + String(index)}</b>
        </Antd.Divider>
        <Antd.Input
          addonBefore="段落主题"
          value={paragraph["topic"]}
          onChange={onPropChange("topic")}
        />
        <Antd.Input.TextArea
          value={paragraph["content"]}
          autoSize={true}
          onChange={onPropChange("content")}
        />
      </div>
    );
  }
}

//*
//* 结构编辑器子组件
//*

interface StructureEditorProps {
  editor: DefaultEditor;
  graphData: GraphData;
  hidden: boolean;
}

class StructureEditor extends React.Component<StructureEditorProps> {
  state = {
    graphDataStack: [this.props.graphData],
    brickType: "Joint",
    brickSubNum: 2,
    brickCenter: 0,

    // 临时状态
    focusing: null as null | INode,
    centered: null as null | INode,
    selected: new Set<INode>(),
  };
  graphContainerRef = React.createRef<HTMLDivElement>();

  static brickTypeOptions = (
    <>
      <Antd.Select.Option value="Joint">并列</Antd.Select.Option>
      <Antd.Select.Option value="Sequence">顺承</Antd.Select.Option>
      <Antd.Select.Option value="Progression">递进</Antd.Select.Option>
      <Antd.Select.Option value="Contrast">对比</Antd.Select.Option>
      <Antd.Select.Option value="Result-Cause">果因</Antd.Select.Option>
      <Antd.Select.Option value="Cause-Result">因果</Antd.Select.Option>
      <Antd.Select.Option value="Behavior-Purpose">行为目的</Antd.Select.Option>
      <Antd.Select.Option value="Purpose-Behavior">目的行为</Antd.Select.Option>
      <Antd.Select.Option value="Background">背景</Antd.Select.Option>
      <Antd.Select.Option value="Elaboration">解说</Antd.Select.Option>
      <Antd.Select.Option value="Summary">总结</Antd.Select.Option>
      <Antd.Select.Option value="Supplement">补充</Antd.Select.Option>
      <Antd.Select.Option value="Evaluation">评价</Antd.Select.Option>
      <Antd.Select.Option value="Statement-Illustration">
        陈述举例
      </Antd.Select.Option>
      <Antd.Select.Option value="Illustration-Statement">
        举例陈述
      </Antd.Select.Option>
    </>
  );

  static brickType2Center = {
    Joint: 3,
    Sequence: 3,
    Progression: 2,
    Contrast: 3,
    "Result-Cause": 1,
    "Cause-Result": 2,
    "Behavior-Purpose": 1,
    "Purpose-Behavior": 1,
    Background: 1,
    Elaboration: 1,
    Summary: 1,
    Supplement: 1,
    Evaluation: 1,
    "Statement-Illustration": 1,
    "Illustration-Statement": 2,
  } as any;

  pushDataStack = (newData: GraphData) => {
    this.state.graphDataStack.push(newData);
    this.state.selected.clear();
    this.setState({ focusing: null, centered: null });
    this.props.editor.markUnsaved();
  };

  popDataStack = () => {
    this.state.graphDataStack.pop();
    this.state.selected.clear();
    this.setState({ focusing: null, centered: null });
    this.props.editor.markUnsaved();
  };

  resetGraph = () => {
    this.props.editor.graph!.destroy();
    const graph = new GuYuhaoGraph(this);
    graph.read(this.state.graphDataStack[this.state.graphDataStack.length - 1]);
    this.props.editor.graph = graph;
  };

  blastAll = () => {
    Antd.message.info("功能开发中！");
  };

  appendPNode = () => {
    Antd.message.info("功能开发中！");
  };

  render() {
    return (
      <div
        style={{
          height: "100%",
          overflowY: "hidden",
          flexGrow: 1,
          flexBasis: "50%",
          display: "flex",
          flexDirection: "column",
        }}
        hidden={this.props.hidden}
      >
        {/* 画布 */}
        <div
          ref={this.graphContainerRef}
          style={{
            border: "solid",
            flexGrow: 1,
            overflowY: "hidden",
          }}
        />

        {/* 工具箱 */}
        <Antd.Card size="small">
          <Antd.Space>
            <Antd.Tooltip title="撤销">
              <Antd.Button
                icon={<AntdIcons.UndoOutlined />}
                disabled={this.state.graphDataStack.length <= 1}
                onClick={this.popDataStack}
              />
            </Antd.Tooltip>
            类型：
            <Antd.Select
              value={this.state.brickType}
              onChange={(value) => {
                this.setState({
                  brickType: value,
                  brickCenter: StructureEditor.brickType2Center[value],
                });
              }}
              style={{ width: 100 }}
            >
              {StructureEditor.brickTypeOptions}
            </Antd.Select>
            子结点：
            <Antd.InputNumber
              value={this.state.brickSubNum}
              min={2}
              max={9}
              onChange={(value) => {
                this.state.selected.clear();
                this.setState({ brickSubNum: Number(value) });
              }}
              style={{ width: 50 }}
            />
            中心：
            <Antd.InputNumber
              value={this.state.brickCenter}
              min={1}
              max={3}
              onChange={(value) => {
                // this.state.selected.clear(); //? 要不要注释掉还要看实际使用体验
                this.setState({
                  brickCenter: value,
                  centered: null,
                });
              }}
              style={{ width: 50 }}
            />
          </Antd.Space>
          <Antd.Space style={{ float: "right" }}>
            <Antd.Dropdown
              overlay={
                <Antd.Menu>
                  <Antd.Menu.Item key="0" onClick={this.resetGraph}>
                    重置画布
                  </Antd.Menu.Item>
                  <Antd.Menu.Item key="1" onClick={this.blastAll}>
                    爆破所有结构
                  </Antd.Menu.Item>
                  <Antd.Menu.Item key="2" onClick={this.appendPNode}>
                    追加叶结点
                  </Antd.Menu.Item>
                </Antd.Menu>
              }
              trigger={["click"]}
            >
              <Antd.Button type="link">
                画布操作
                <AntdIcons.UpOutlined />
              </Antd.Button>
            </Antd.Dropdown>
          </Antd.Space>
        </Antd.Card>
      </div>
    );
  }

  componentDidMount() {
    const graph = new GuYuhaoGraph(this);
    graph.read(this.state.graphDataStack[0]);
    this.props.editor.graph = graph;
  }

  componentDidUpdate() {
    const graph = this.props.editor.graph!;
    const container = this.graphContainerRef.current!;
    graph.changeSize(container.clientWidth, container.clientHeight);

    const graphDataStack = this.state.graphDataStack;
    graph.changeData(graphDataStack[graphDataStack.length - 1]);

    const focusing = this.state.focusing;
    if (focusing) {
      graph.setItemState(focusing, "focusing", true);
    }

    const selected = this.state.selected;
    for (let i of selected) {
      graph.setItemState(i, "selected", "normal");
    }

    const centered = this.state.centered;
    if (centered) {
      graph.setItemState(centered, "selected", "center");
    }
  }
}

class GuYuhaoMenu extends G6.Menu {
  constructor(gyh: StructureEditor) {
    super({
      itemTypes: ["node"],

      getContent: (e: IG6GraphEvent) => {
        const item = e.item;
        const container = document.createElement("div");
        if (!item || item.getType() !== "node") return container;

        const model = item.getModel() as PNodeConfig | RNodeConfig;
        if (model instanceof PNodeConfig) {
          ReactDOM.render(
            <button id="zHrczd6d1t55sMq9">爆破叶子</button>,
            container
          );
          return container;
        }

        if (model instanceof RNodeConfig) {
          ReactDOM.render(
            <button id="PJk3jrSjcCu8XJgg">爆破内点</button>,
            container
          );
          return container;
        }

        ReactDOM.render(<span>未知的结点类型</span>, container);
        return container;
      },

      handleMenuClick: (target: HTMLElement, item: INode) => {
        const graph = gyh.props.editor.graph!;

        switch (target.id) {
          case "PJk3jrSjcCu8XJgg": {
            /* 爆破内点 */
            let now = new Set<INode>();
            let next = new Set<INode>();
            now.add(item);
            while (now.size !== 0) {
              for (let i of now) {
                for (let j of i.getNeighbors("source")) {
                  if (!now.has(j)) next.add(j);
                }
                graph.removeItem(i);
              }
              const temp = now;
              now = next;
              next = temp;
              next.clear();
            }
            // 修改数据模型
            gyh.pushDataStack(graph.save() as GraphData);
            break;
          }
          case "zHrczd6d1t55sMq9": {
            /* 爆破叶子 */
            Antd.message.info("功能开发中！");
            break;
          }
        }
      },
    });
  }
}

class GuYuhaoGraph extends Graph {
  gyh: StructureEditor;

  constructor(gyh: StructureEditor) {
    const container = gyh.graphContainerRef.current!;
    super({
      container: container,
      width: container.clientWidth,
      height: container.clientHeight,
      plugins: [new GuYuhaoMenu(gyh)],

      fitView: true,
      modes: {
        default: [
          "drag-canvas",
          "zoom-canvas",
          "drag-node",
          "brick-laying",
          "center-switch",
          "edge-feedback",
        ],
      },
      nodeStateStyles: {
        error: { fill: "#ff0000" }, // 出错
        focusing: { stroke: "#00000", lineWidth: 5 }, // 被聚焦（刚刚点击）
        "selected:normal": { fill: "#4682b4" }, // 选中
        "selected:center": { fill: "#ffdd40" }, // 选中-中心
      },
      edgeStateStyles: {
        error: { stroke: "#ff0000" }, // 出错
        mouseOn: { stroke: "#0000ff" }, // 鼠标停留
      },
    });
    this.gyh = gyh;
  }
}

/* 砌砖 */
G6.registerBehavior("brick-laying", {
  getEvents() {
    return {
      "node:click": "onNodeClick",
    };
  },

  onNodeClick(e: IG6GraphEvent) {
    const graph = this.graph as GuYuhaoGraph;
    const gyh = graph.gyh;

    const item = e.item as INode;
    gyh.state.focusing = item;

    const selected = gyh.state.selected;
    const center = gyh.state.brickCenter === 3 ? 0 : gyh.state.brickCenter;
    if (selected.has(item)) {
      selected.delete(item);
      if (gyh.state.centered === item) gyh.state.centered = null;
    } else {
      selected.add(item);
      if (selected.size === center) gyh.state.centered = item;
    }

    gyh.forceUpdate();

    if (selected.size === gyh.state.brickSubNum) {
      // 统计选中结点获取最高纵坐标和横坐标中点
      let yMin = Infinity; // 注意G6的坐标系是从上到下
      let xSum = 0;
      for (let i of selected) {
        const model = i.getModel();
        if (model.y! < yMin) yMin = model.y!;
        xSum += model.x!;
      }

      // 创建结点
      let newNode = new RNodeConfig(
        String(Math.random()),
        xSum / selected.size,
        yMin - 50 - 15 * Math.random(),
        gyh.state.brickType
      );
      graph.addItem("node", newNode);

      // 连线
      if (gyh.state.centered) {
        for (let i of selected) {
          const model = i.getModel();
          if (i === gyh.state.centered) {
            graph.addItem("edge", new CEdgeConfig(newNode.id, model.id!));
          } else {
            graph.addItem("edge", new NEdgeConfig(newNode.id, model.id!));
          }
        }
      } else {
        for (let i of selected) {
          const model = i.getModel();
          graph.addItem("edge", new CEdgeConfig(newNode.id, model.id!));
        }
      }

      // 压栈修改
      gyh.pushDataStack(graph.save() as GraphData);
    }
  },
});

/* 中心切换 */
G6.registerBehavior("center-switch", {
  getEvents() {
    return {
      "edge:click": "onEdgeClick",
    };
  },

  onEdgeClick(e: IG6GraphEvent) {
    const graph = this.graph as GuYuhaoGraph;
    const gyh = graph.gyh;

    const item = e.item as IEdge;
    const model = item.getModel();

    if (model instanceof NEdgeConfig) {
      //! 狗屁G6又出bug了。
      // graph.updateItem(item, new CEdgeConfig(model.source, model.target));
      graph.removeItem(item);
      graph.addItem("edge", new CEdgeConfig(model.source, model.target));
    } else if (model instanceof CEdgeConfig) {
      // graph.updateItem(item, new NEdgeConfig(model.source, model.target));
      graph.removeItem(item);
      graph.addItem("edge", new NEdgeConfig(model.source, model.target));
    } else {
      throw Error("无法识别的边类型");
    }

    // 修改压栈
    gyh.pushDataStack(graph.save() as GraphData);
  },
});

/* 边反馈 */
G6.registerBehavior("edge-feedback", {
  getEvents() {
    return {
      "edge:mouseenter": "onEdgeMouseEnter",
      "edge:mouseleave": "onEdgeMouseLeave",
    };
  },

  onEdgeMouseEnter(e: IG6GraphEvent) {
    const graph = this.graph as GuYuhaoGraph;
    const item = e.item as IEdge;
    graph.setItemState(item, "mouseOn", true);
  },

  onEdgeMouseLeave(e: IG6GraphEvent) {
    const graph = this.graph as GuYuhaoGraph;
    const item = e.item as IEdge;
    graph.setItemState(item, "mouseOn", false);
  },
});