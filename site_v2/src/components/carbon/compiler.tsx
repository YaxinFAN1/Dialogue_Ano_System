import { Graph } from "@antv/g6";
import { IEdge, INode } from "@antv/g6/lib/interface/item";
import { Item } from "@antv/g6/lib/types";
import {
  CarbonNode,
  CEdgeConfig,
  Paragraph,
  PNodeConfig,
  RNodeConfig,
} from "./common";

export class InconsistencyError {
  msg: string;
  constructor(msg: string) {
    this.msg = msg;
  }
  toString() {
    return "一致性错误：" + this.msg;
  }
}

export class GraphError {
  msg: string;
  items: Item[];
  constructor(msg: string, items: Item[]) {
    this.msg = msg;
    this.items = items;
  }
  toString() {
    return "图错误：" + this.msg;
  }
}

/**
 * @description 使用的是浅拷贝！！
 */
export const graph2carbon = (
  graph: Graph,
  paragraphs: Paragraph[]
): CarbonNode[] => {
  const allNodes = graph.getNodes();
  if (allNodes.length === 0) {
    if (paragraphs.length !== 0)
      throw new InconsistencyError("图结构为空，而段落不空。");
    return paragraphs;
  }

  interface Temp {
    lo: number;
    hi: number;
    rooted: boolean;
    output: CarbonNode;
  }

  let leafCounter = 0;
  const tempMap = new Map<INode, Temp>();
  const walked = new Set<INode>();
  const dfs = (node: INode): Temp => {
    // 已编译结点直接返回
    const compiled = tempMap.get(node);
    if (compiled) return compiled;

    const model = node.getModel();
    const outEdges = node.getOutEdges();

    // 填表啦
    const temp = {
      lo: -1,
      hi: -1,
      rooted: false,
    } as Temp;
    tempMap.set(node, temp);

    if (model instanceof PNodeConfig) {
      /* 叶结点 */
      if (outEdges.length !== 0) {
        (outEdges as Item[]).push(node);
        throw new GraphError("叶子结点有出边。", outEdges);
      }

      if (typeof model.label !== "string")
        throw new GraphError("无法识别的叶子类型。", [node]);

      const index = Number(model.label.substr(1)) - 1;
      if (index === undefined)
        throw new GraphError("无法识别的叶子类型。", [node]);
      if (index > paragraphs.length)
        throw new InconsistencyError("段落数量少于叶子数量。");

      temp.lo = temp.hi = index;
      temp.output = paragraphs[index];
      ++leafCounter;
    } else if (model instanceof RNodeConfig) {
      /* 内部节点 */

      // 递归构建子树
      walked.add(node);
      for (let i of outEdges) {
        const to = i.getTarget();
        if (walked.has(to)) throw new GraphError("存在回路。", [i]);
        const toModel = tempMap.get(to);
        if (toModel && toModel.rooted)
          throw new GraphError("结点存在多条入边。", [to]);
        dfs(to).rooted = true;
      }
      walked.delete(node);

      // 排序子结点并判断连续性
      const tosList = Array.from(outEdges, (v: IEdge) => ({
        v: v,
        temp: tempMap.get(v.getTarget())!,
      }));
      if (tosList.length === 0) {
        // 悬空内点
        throw new GraphError("悬空内结点。", [node]);
      }
      tosList.sort((a, b) => a.temp.lo - b.temp.lo);
      let lastHi = tosList[0].temp.lo;
      for (let i of tosList) {
        if (i.temp.lo < lastHi)
          throw new GraphError("子结点出现交叉。", [node]);
        lastHi = i.temp.hi;
      }

      // 附加数据
      temp.lo = tosList[0].temp.lo;
      temp.hi = tosList[tosList.length - 1].temp.hi;

      // 确定中心
      let center: number;
      let lastTrue = -1;
      let cEdges = [] as IEdge[];
      for (let i = 0; i < tosList.length; ++i) {
        const e = tosList[i].v;
        if (e.getModel() instanceof CEdgeConfig) {
          lastTrue = i;
          cEdges.push(e);
        }
        // 宽松处理
      }
      if (cEdges.length === 0 || cEdges.length === tosList.length) {
        center = -1;
      } else if (cEdges.length === 1) {
        if (model.label === "Joint")
          throw new GraphError("Joint结点不可有中心。", [
            node,
            tosList[lastTrue].v,
          ]);
        if (!(lastTrue === 0 || lastTrue === 1))
          throw new GraphError("结点中心取值不合法。", [
            node,
            tosList[lastTrue].v,
          ]);
        center = lastTrue;
      } else {
        (cEdges as Item[]).push(node);
        throw new GraphError("结点有多个箭头出边。", cEdges);
      }

      // 构建语料
      temp.output = {
        function: "",
        type: model.label,
        center: center,
        children: Array.from(tosList, (v) => v.temp.output),
      };
    } else {
      /* 非法结点 */
      throw new GraphError("无法识别的结点类型。", [node]);
    }
    return temp;
  };

  // 构建所有树和子树
  for (let i of allNodes.values()) dfs(i);
  if (leafCounter < paragraphs.length)
    throw new InconsistencyError("叶子数量少于段落数量。");

  // 最后的排序和连续性判断
  const finalRoots = [] as { v: INode; temp: Temp }[];
  for (let i of tempMap.entries()) {
    if (!i[1].rooted) finalRoots.push({ v: i[0], temp: i[1] });
  }
  finalRoots.sort((a, b) => a.temp.lo - b.temp.lo);
  let lastHi = finalRoots[0].temp.lo;
  for (let i of finalRoots) {
    if (i.temp.lo < lastHi)
      throw new GraphError("树根的子结点出现交叉。", [i.v]);
    lastHi = i.temp.hi;
  }

  return Array.from(finalRoots, (v) => v.temp.output);
};
