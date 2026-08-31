import { hierarchy, tree, HierarchyPointNode } from "d3-hierarchy";
import { DisplayNode, getNodeChildren } from "./familyTreeBuilder";

export const NODE_WIDTH = 230; // 1 cặp vợ chồng (2 ô cạnh nhau) hoặc 1 ô đơn
export const NODE_HEIGHT = 90; // tăng để chứa 2 dòng: tên + tuổi/trạng thái, có padding thoáng
export const GAP_X = 90; // khoảng cách ngang giữa các node cùng tầng
export const GAP_Y = 180; // khoảng cách dọc giữa các tầng thế hệ (đủ chỗ cho cuống nối + nút "+" + hàng vợ/chồng phụ khi nhiều vợ/chồng)

export type LayoutResult = {
  nodes: HierarchyPointNode<DisplayNode>[];
  links: { source: HierarchyPointNode<DisplayNode>; target: HierarchyPointNode<DisplayNode> }[];
  width: number;
  height: number;
};

// "Nửa chiều rộng" thực tế của 1 node, tính theo đơn vị node chuẩn.
// Node bình thường (1 vợ/chồng hoặc độc thân) = 0.5. Node nhiều vợ/chồng cần rộng hơn
// để đủ chỗ rẽ nhánh, nên nửa chiều rộng tăng theo số cuộc hôn nhân.
function getHalfWidthUnits(node: { data: DisplayNode }): number {
  const marriageCount = node.data.multiMarriage?.marriages.length;
  return marriageCount ? marriageCount / 2 : 0.5;
}

export function computeFamilyTreeLayout(root: DisplayNode): LayoutResult {
  const rootHierarchy = hierarchy(root, getNodeChildren);
  const treeLayout = tree<DisplayNode>()
    .nodeSize([NODE_WIDTH + GAP_X, NODE_HEIGHT + GAP_Y])
    .separation((a, b) => {
      // Tổng "nửa chiều rộng" của 2 node cạnh nhau quyết định khoảng cách cần có giữa chúng
      // -- node càng nhiều vợ/chồng càng cần nhiều khoảng trống xung quanh để không lấn sang
      // node bên cạnh. Mặc định d3 dùng hằng số 1/2, ở đây thay bằng giá trị tính theo thực tế.
      const base = getHalfWidthUnits(a) + getHalfWidthUnits(b);
      return a.parent === b.parent ? base : base + 0.3;
    });
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