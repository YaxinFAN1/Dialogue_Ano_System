import {
    ColumnHeightOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";
import { Graph } from "@antv/g6";
import { GraphData } from "@antv/g6/lib/types";
import * as Antd from "antd";
import React, { ReactNode } from "react";
import { Carbon, carbon2graph, Discourse, Paragraph } from "../common";

export const version = "2.6";

export interface Props {
    carbon: Carbon | null;
    title: ReactNode;
}

export class DefaultViewer extends React.Component<Props> {
    state = {
        showStructure: true,
        showHelper: false,
    };
    containerRef = React.createRef<HTMLDivElement>();

    render() {
        let contentViewer: ReactNode;
        let structureViewer: ReactNode;

        if (!this.props.carbon) {
            contentViewer = (
                <h1
                    style={{
                        color: "grey",
                        textAlign: "center",
                        flex: 1,
                        paddingTop: 100,
                    }}
                    key={0}
                >
                    CARBON Viewer
                    <br />
                    <i>Version: {version}</i>
                </h1>
            );
            structureViewer = (
                <StructureViewer
                    typeGraphData={null}
                    functionGraphData={null}
                    containerRef={this.containerRef}
                    hidden={!this.state.showStructure}
                />
            );
        } else {
            const [typeGraphData, paragraphs, functionGraphData] = carbon2graph(
                this.props.carbon
            );
            contentViewer = (
                <ContentViewer
                    discourse={this.props.carbon.discourse}
                    paragraphs={paragraphs}
                />
            );
            structureViewer = (
                <StructureViewer
                    typeGraphData={typeGraphData}
                    functionGraphData={functionGraphData}
                    containerRef={this.containerRef}
                    hidden={!this.state.showStructure}
                />
            );
        }

        return (
            <div
                style={{
                    height: "100%",
                    overflowY: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
                ref={this.containerRef}
            >
                {/* 标题栏 */}
                <div style={{ backgroundColor: "inherit" }}>
                    <Antd.Card size="small">
                        {this.props.title}
                        <Antd.Space style={{ float: "right" }}>
                            <Antd.Switch
                                checkedChildren="篇章结构"
                                unCheckedChildren="篇章结构"
                                defaultChecked
                                onChange={(checked) => {
                                    this.setState({ showStructure: checked });
                                }}
                            />
                            <Antd.Tooltip title={"版本： " + version}>
                                <Antd.Button
                                    shape="circle"
                                    icon={<QuestionCircleOutlined />}
                                    onClick={() => this.setState({ showHelper: true })}
                                />
                            </Antd.Tooltip>
                        </Antd.Space>
                    </Antd.Card>
                    <hr color="#e0e0e0" />
                    <Antd.Modal
                        title={"CARBON Viewer v" + version}
                        visible={this.state.showHelper}
                        onCancel={() => this.setState({ showHelper: false })}
                        footer={null}
                    >
                        {helper}
                    </Antd.Modal>
                </div>

                {contentViewer}
                {structureViewer}
            </div>
        );
    }
}

const helper = (
    <>
        <h2>2.6 更新内容</h2>
        <ul>
            <li>实现了语用查看器的拖拽调整大小功能</li>
            <li>优化了内容、结构的显示效果</li>
            <li>优化了代码实现，提高性能</li>
        </ul>
        <hr style={{ display: "block" }} />
        <h2>2.5 更新内容</h2>
        <ul>
            <li>添加了语用查看功能</li>
        </ul>
        <hr style={{ display: "block" }} />
        <h2>2.4 更新内容</h2>
        <ul>
            <li>取消了画布尺寸调整功能</li>
        </ul>
    </>
);

interface ContentViewerProps {
    discourse: Discourse;
    paragraphs: Paragraph[];
}

class ContentViewer extends React.Component<ContentViewerProps> {
    render() {
        let temp = [this.renderDiscourseViewer(this.props.discourse)];
        for (let i of this.props.paragraphs) {
            temp.push(this.renderParagraphViewer(i, temp.length));
        }
        return <div style={{ overflowY: "scroll", flex: 1 }}>{temp}</div>;
    }

    renderDiscourseViewer(discourse: Discourse) {
        return (
            <div key={0}>
                <Antd.Typography.Title level={3}>
                    {discourse.topic}
                </Antd.Typography.Title>
                <Antd.Typography.Text keyboard strong>
                    电头
                </Antd.Typography.Text>
                {discourse.dateline}
                <br />
                <Antd.Typography.Text keyboard strong>
                    导语
                </Antd.Typography.Text>
                {discourse.lead}
                <br />
                <Antd.Typography.Text keyboard strong>
                    摘要
                </Antd.Typography.Text>
                {discourse.abstract}
                <br />
                <br />
            </div>
        );
    }

    renderParagraphViewer(paragraph: Paragraph, index: number) {
        return (
            <div key={index}>
                <Antd.Typography.Text keyboard strong>
                    <span style={{ color: "#0000ff" }}>{"P" + String(index)}</span>
                    {" [" + paragraph.function + "]"}
                </Antd.Typography.Text>
                <Antd.Typography.Text code>{paragraph.topic}</Antd.Typography.Text>
                <br />
                <Antd.Typography.Text>
                    &emsp;&emsp;
                    {paragraph.content}
                </Antd.Typography.Text>
            </div>
        );
    }
}

interface StructureViewerProps {
    typeGraphData: GraphData | null;
    functionGraphData: GraphData | null;
    containerRef: React.RefObject<HTMLDivElement>;
    hidden: boolean;
}

class StructureViewer extends React.Component<StructureViewerProps> {
    state = { useLabel: "type", graphHeight: 300 };
    graph: Graph | null = null;
    graphContainerRef = React.createRef<HTMLDivElement>();

    render() {
        return (
            <Antd.Card
                title={
                    <>
                        <Antd.Switch
                            onChange={(checked) => {
                                this.setState({ useLabel: checked ? "type" : "function" });
                            }}
                            defaultChecked={true}
                            checkedChildren={"显示结构"}
                            unCheckedChildren={"显示语用"}
                        />
                        <Antd.Space style={{ float: "right" }}>
                            <Antd.Tooltip title="拖动以调整画布高度" placement="left">
                                <Antd.Button
                                    icon={<ColumnHeightOutlined />}
                                    onMouseDown={(e) => {
                                        const container = this.props.containerRef.current!;

                                        container.onmousemove = (e) => {
                                            this.setState({
                                                graphHeight: this.state.graphHeight - e.movementY,
                                            });
                                        };

                                        container.onmouseup = container.onmouseleave = () => {
                                            container.onmousemove = null;
                                            container.onmouseup = null;
                                            container.onmouseleave = null;
                                        };
                                    }}
                                />
                            </Antd.Tooltip>
                        </Antd.Space>
                    </>
                }
                hidden={this.props.hidden}
                size="small"
            >
                <div
                    style={{ height: this.state.graphHeight }}
                    ref={this.graphContainerRef}
                />
            </Antd.Card>
        );
    }

    componentDidMount() {
        const container = this.graphContainerRef.current!;
        this.graph = new Graph({
            container: container,
            width: container.clientWidth,
            height: container.clientHeight,
            fitView: true,
            modes: { default: ["drag-canvas", "zoom-canvas"] },
        });
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        const container = this.graphContainerRef.current!;
        const graph = this.graph!;

        let graphData =
            this.state.useLabel === "type"
                ? this.props.typeGraphData
                : this.props.functionGraphData;

        if (!graphData) {
            // 空白语料的警告牌
            graphData = {
                nodes: [
                    {
                        id: "",
                        label: "BLANK\nCORPUS\n\nNothing to show",
                        type: "triangle",
                        size: 80,
                        style: {
                            fill: "#FFFF00",
                            stroke: "#000000",
                            lineWidth: 10,
                        },
                        labelCfg: {
                            position: "bottom",
                            offset: -40,
                        },
                    },
                ],
            };
        }

        graph.changeSize(container.clientWidth, container.clientHeight);
        graph.data(graphData);
        graph.render();
    }
}
