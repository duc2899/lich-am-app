import { hierarchy, tree, HierarchyPointNode } from "d3-hierarchy";
import { DisplayNode } from "./familyTreeBuilder";

export const NODE_WIDTH = 330; // 1 cặp vợ chồng (2 ô cạnh nhau) hoặc 1 ô đơn
export const NODE_HEIGHT = 120; // tăng để chứa 2 dòng: tên + tuổi/trạng thái, có padding thoáng
export const GAP_X = 100; // khoảng cách ngang giữa các node cùng tầng
export const GAP_Y = 150; // khoảng cách dọc giữa các tầng thế hệ

export type LayoutResult = {
    nodes: HierarchyPointNode<DisplayNode>[];
    links: { source: HierarchyPointNode<DisplayNode>; target: HierarchyPointNode<DisplayNode> }[];
    width: number;
    height: number;
};

export function computeFamilyTreeLayout(root: DisplayNode): LayoutResult {
    const rootHierarchy = hierarchy(root, (d) => d.children);
    const treeLayout = tree<DisplayNode>().nodeSize([NODE_WIDTH + GAP_X, NODE_HEIGHT + GAP_Y]);
    const positioned = treeLayout(rootHierarchy);

    const nodes = positioned.descendants();
    const links = positioned.links();

    // Tính biên để biết tổng kích thước canvas cần vẽ
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    return {
        nodes,
        links,
        width: maxX - minX + NODE_WIDTH + GAP_X * 2,
        height: maxY + NODE_HEIGHT + GAP_Y * 2,
    };
}