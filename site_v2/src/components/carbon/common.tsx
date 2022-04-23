import G6 from "@antv/g6";
import { EdgeConfig, GraphData, NodeConfig } from "@antv/g6/lib/types";

export interface Discourse {
  topic: string;
  dateline: string;
  lead: string;
  abstract: string;
}

export interface Relation {
  children: CarbonNode[];
  center: number;
  function: string;
  type: string;
}

export interface Paragraph {
  content: string;
  topic: string;
  function: string;
}

export type CarbonNode = Relation | Paragraph;

export interface Carbon {
  discourse: Discourse;
  roots: CarbonNode[];
  type?: string;
  speakers?: string[];
  texts?: string[];
  sessions?: string[];
  address_to?: number[][];
  relations?: string[];
}

export const carbonSkeleton: Carbon = {
  discourse: {
    topic: "",
    dateline: "",
    lead: "",
    abstract: "",
  },
  roots: [],
};

// 段落结点数据模型类（叶子）
export class PNodeConfig implements NodeConfig {
  id: string;
  x: number;
  y: number;
  label: string;
  [key: string]: any;
  constructor(id: string, x: number, y: number, label: string) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.label = label;

    this.type = "circle";
    this.size = 35;
    this.anchorPoints = [[0.5, 0]];
  }
}

// 关系结点数据模型类（内点）
export class RNodeConfig implements NodeConfig {
  id: string;
  x: number;
  y: number;
  label: string;
  [key: string]: any;
  constructor(id: string, x: number, y: number, label: string) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.label = label;

    this.type = "rect";
    this.size = [label.length * 5 + 20, 30];
    this.anchorPoints = [
      [0.5, 0],
      [0.5, 1],
    ];
  }
}

// 语用结点数据模型类
export class FNodeConfig implements NodeConfig {
  id: string;
  x: number;
  y: number;
  label: string;
  [key: string]: any;
  constructor(id: string, x: number, y: number, label: string) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.label = label;

    this.type = "rect";
    this.size = [label.length * 5 + 20, 30];
    this.anchorPoints = [
      [0.5, 0],
      [0.5, 1],
    ];
  }
}

// 中心边数据模型类（带箭头）
export class CEdgeConfig implements EdgeConfig {
  source: string;
  target: string;
  [key: string]: any;
  constructor(source: string, target: string) {
    this.source = source;
    this.target = target;

    this.style = {
      stroke: "#7f7f7f",
      lineWidth: 3,
      lineAppendWidth: 5,
      endArrow: {
        path: G6.Arrow.triangle(5, 15, 0),
        //d: 35,
      },
    };
  }
}

// 普通边数据模型类（不带箭头）
export class NEdgeConfig implements EdgeConfig {
  source: string;
  target: string;
  [key: string]: any;
  constructor(source: string, target: string) {
    this.source = source;
    this.target = target;

    this.style = {
      stroke: "#7f7f7f",
      lineWidth: 3,
      lineAppendWidth: 5,
      endArrow: false,
    };
  }
}

/**
 * @description 使用的是浅拷贝！！
 * @param carbon CARBON格式语料
 * @param width 图宽，为null表示根据树宽自然确定图宽
 * @param height 图高，为null表示根据树高自然确定图高
 * @returns [G6图源数据, 段落列表]
 */
export const carbon2graph = (
  carbon: Carbon,
  width: number | null = null,
  height: number | null = null
): [GraphData, Paragraph[], GraphData] => {
  const edges = [] as EdgeConfig[];
  const paragraphs: Paragraph[] = [];

  let leafCounter = 0;
  const gnodeMap = new Map<CarbonNode, PNodeConfig | RNodeConfig>();
  const nodesF = [] as FNodeConfig[];

  const ldfs = (level: CarbonNode[]): number => {
    let top = 0;

    for (let node of level) {
      let id = String(Math.random());
      let x: number, y: number;

      if ("children" in node) {
        // Relations型，内部节点

        // 计算坐标
        if (node.children.length === 0) {
          // 悬空内节点
          x = ++leafCounter;
          y = 2;
        } else {
          // 普通情况
          y = ldfs(node.children) + 1;
          let front = gnodeMap.get(node.children[0])!;
          let back = gnodeMap.get(node.children[node.children.length - 1])!;
          x = (front.x + back.x) / 2;
        }

        // 绘制自身
        const gnode = new RNodeConfig(id, x, y, node.type);
        gnodeMap.set(node, gnode);
        nodesF.push(new FNodeConfig(id, x, y, node.function));

        // 将自身与子结点连线
        for (let i = 0; i < node.children.length; ++i) {
          const sub = gnodeMap.get(node.children[i])!;
          if (node.center === -1 || node.center === i) {
            edges.push(new CEdgeConfig(id, sub.id));
          } else {
            edges.push(new NEdgeConfig(id, sub.id));
          }
        }
      } else {
        // Paragraph型，叶子节点
        x = ++leafCounter;
        y = 1;

        // 记录结点
        const gnode = new PNodeConfig(id, x, y, "P" + String(leafCounter));
        gnodeMap.set(node, gnode);
        nodesF.push(new FNodeConfig(id, x, y, node.function));

        // 记录段落
        paragraphs.push(node as Paragraph);
      }

      if (y > top) top = y;
    }

    return top;
  };
  const topLevel = ldfs(carbon.roots);

  if (gnodeMap.size === 0) return [{}, [], {}];

  const nodes = Array.from(gnodeMap.values());

  // 根据画布尺寸重计算坐标
  const xUnit = width ? width / leafCounter : 75;
  const yUnit = -(height ? height / topLevel : 75);
  for (let node of nodes) {
    node.x! *= xUnit;
    node.y! *= yUnit;
  }
  const xUnitF = xUnit * 1.2;
  for (let nodeF of nodesF) {
    nodeF.x! *= xUnitF;
    nodeF.y! *= yUnit;
  }

  return [
    { nodes: nodes, edges: edges },
    paragraphs,
    { nodes: nodesF, edges: edges },
  ];
};
