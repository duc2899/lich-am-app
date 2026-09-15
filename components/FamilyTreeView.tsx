import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  LayoutChangeEvent,
} from "react-native";
import Svg, {
  Rect,
  Line,
  Circle,
  Text as SvgText,
  Defs,
  Pattern,
  Image as SvgImage,
  ClipPath,
} from "react-native-svg";
import { DisplayNode } from "../utils/familyTreeBuilder";
import {
  computeFamilyTreeLayout,
  NODE_WIDTH,
  NODE_HEIGHT,
} from "../utils/familyTreeLayout";
import { Person } from "../types/family";
import { useTheme } from "../context/ThemeContext";

type Props = {
  root: DisplayNode;
  persons: Person[];
  onPersonPress?: (personId: string) => void;
  truongIds?: Set<string>;
  mePersonId?: string | null;
  expandableFamilyIds: Set<string>;
  collapsedFamilyIds: Set<string>;
  onToggleCollapse: (familyId: string) => void;
};

type PersonPosition = { x: number; y: number };

function touchDistance(touches: { pageX: number; pageY: number }[]): number {
  const [a, b] = touches;
  const dx = a.pageX - b.pageX;
  const dy = a.pageY - b.pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

function BranchLine({
  sx,
  sy,
  tx,
  ty,
}: {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}) {
  const midY = sy + (ty - sy) / 2;
  return (
    <>
      <Line
        x1={sx}
        y1={sy}
        x2={sx}
        y2={midY}
        stroke="#B0B0B0"
        strokeWidth={2}
      />
      <Line
        x1={sx}
        y1={midY}
        x2={tx}
        y2={midY}
        stroke="#B0B0B0"
        strokeWidth={2}
      />
      <Line
        x1={tx}
        y1={midY}
        x2={tx}
        y2={ty}
        stroke="#B0B0B0"
        strokeWidth={2}
      />
    </>
  );
}

function CollapseToggle({
  cx,
  cy,
  collapsed,
  onPress,
}: {
  cx: number;
  cy: number;
  collapsed: boolean;
  onPress: () => void;
}) {
  return (
    <>
      <Circle
        cx={cx}
        cy={cy}
        r={11}
        fill="#fff"
        stroke="#B0B0B0"
        strokeWidth={1.5}
        onPress={onPress}
      />
      <SvgText
        x={cx}
        y={cy + 4}
        fontSize={14}
        fontWeight="700"
        fill="#888"
        textAnchor="middle"
        onPress={onPress}
      >
        {collapsed ? "+" : "−"}
      </SvgText>
    </>
  );
}

const STUB_LENGTH = 34;
const TOGGLE_OFFSET_IN_STUB = 15;

function BranchConnector({
  originX,
  originY,
  childTargets,
  familyId,
  expandableFamilyIds,
  collapsedFamilyIds,
  onToggleCollapse,
}: {
  originX: number;
  originY: number;
  childTargets: { id: string; x: number; y: number }[];
  familyId: string;
  expandableFamilyIds: Set<string>;
  collapsedFamilyIds: Set<string>;
  onToggleCollapse: (familyId: string) => void;
}) {
  const isExpandable = expandableFamilyIds.has(familyId);
  const isCollapsed = collapsedFamilyIds.has(familyId);
  const stubEndY = originY + STUB_LENGTH;

  if (!isExpandable) return null;

  return (
    <>
      <Line
        x1={originX}
        y1={originY}
        x2={originX}
        y2={stubEndY}
        stroke="#B0B0B0"
        strokeWidth={2}
      />
      <CollapseToggle
        cx={originX}
        cy={originY + TOGGLE_OFFSET_IN_STUB}
        collapsed={isCollapsed}
        onPress={() => onToggleCollapse(familyId)}
      />
      {childTargets.map((t) => (
        <BranchLine key={t.id} sx={originX} sy={stubEndY} tx={t.x} ty={t.y} />
      ))}
    </>
  );
}

function computePersonPositions(
  nodes: ReturnType<typeof computeFamilyTreeLayout>["nodes"],
  offsetX: number,
  offsetY: number,
): Map<string, PersonPosition> {
  const map = new Map<string, PersonPosition>();

  for (const node of nodes) {
    const cx = node.x + offsetX;
    const cy = node.y + offsetY;
    const d = node.data;
    if (d.isPlaceholder) continue;

    if (d.multiMarriage) {
      map.set(d.multiMarriage.anchor.id, { x: cx, y: cy });

      const nodeChildren = node.children ?? [];
      let childCursor = 0;
      const spouseBoxY = cy + NODE_HEIGHT + 15;

      for (const marriage of d.multiMarriage.marriages) {
        const count =
          marriage.children.length > 0 ? marriage.children.length : 1;
        const group = nodeChildren.slice(childCursor, childCursor + count);
        childCursor += count;
        if (marriage.spouse) {
          const groupXs = group.map((c) => c.x + offsetX);
          const centerX =
            groupXs.length > 0
              ? (Math.min(...groupXs) + Math.max(...groupXs)) / 2
              : cx;
          map.set(marriage.spouse.id, { x: centerX, y: spouseBoxY });
        }
      }
    } else if (d.husband || d.wife) {
      if (d.husband) map.set(d.husband.id, { x: cx - NODE_WIDTH / 4, y: cy });
      if (d.wife) map.set(d.wife.id, { x: cx + NODE_WIDTH / 4, y: cy });
    } else if (d.singlePerson) {
      map.set(d.singlePerson.id, { x: cx, y: cy });
    }
  }

  return map;
}

export default function FamilyTreeView({
  root,
  persons,
  onPersonPress,
  truongIds,
  mePersonId,
  expandableFamilyIds,
  collapsedFamilyIds,
  onToggleCollapse,
}: Props) {
  const { colors } = useTheme();
  const { nodes, width, height } = computeFamilyTreeLayout(root);
  const xs = nodes.map((n) => n.x);
  const offsetX = -Math.min(...xs) + NODE_WIDTH / 2 + 40;
  const offsetY = 60;

  const personPositions = useMemo(
    () => computePersonPositions(nodes, offsetX, offsetY),
    [nodes, offsetX, offsetY],
  );

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const liveRef = useRef({ scale: 1, translateX: 0, translateY: 0 });
  const gestureRef = useRef<{
    mode: "none" | "pan" | "pinch";
    lastDist: number;
    lastX: number;
    lastY: number;
  }>({
    mode: "none",
    lastDist: 0,
    lastX: 0,
    lastY: 0,
  });
  const animationFrameRef = useRef<number | null>(null);

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  // Tự nội suy bằng requestAnimationFrame, gọi lại đúng setTranslate/setScale sẵn có nhiều lần
  // liên tiếp -- không đụng gì tới PanResponder/logic pan-pinch đang chạy ổn định.
  const animateTo = (
    targetX: number,
    targetY: number,
    targetScale: number,
    duration = 300,
  ) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startX = liveRef.current.translateX;
    const startY = liveRef.current.translateY;
    const startScale = liveRef.current.scale;
    const startTime = Date.now();

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      const currentX = startX + (targetX - startX) * eased;
      const currentY = startY + (targetY - startY) * eased;
      const currentScale = startScale + (targetScale - startScale) * eased;

      liveRef.current.translateX = currentX;
      liveRef.current.translateY = currentY;
      liveRef.current.scale = currentScale;
      setTranslate({ x: currentX, y: currentY });
      setScale(currentScale);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        // Nếu người dùng chạm vào màn hình giữa lúc đang trượt tới -> huỷ animation ngay,
        // nhường quyền điều khiển lại cho tay chạm, tránh 2 bên giành nhau ghi đè giá trị.
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          gestureRef.current.mode = "pinch";
          gestureRef.current.lastDist = touchDistance(touches as any);
        } else if (touches.length === 1) {
          gestureRef.current.mode = "pan";
          gestureRef.current.lastX = touches[0].pageX;
          gestureRef.current.lastY = touches[0].pageY;
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2) {
          const dist = touchDistance(touches as any);
          if (gestureRef.current.mode !== "pinch") {
            gestureRef.current.mode = "pinch";
            gestureRef.current.lastDist = dist;
            return;
          }
          const factor = dist / gestureRef.current.lastDist;
          const nextScale = Math.min(
            Math.max(liveRef.current.scale * factor, 0.3),
            2.5,
          );
          liveRef.current.scale = nextScale;
          gestureRef.current.lastDist = dist;
          setScale(nextScale);
        } else if (touches.length === 1) {
          if (gestureRef.current.mode !== "pan") {
            gestureRef.current.mode = "pan";
            gestureRef.current.lastX = touches[0].pageX;
            gestureRef.current.lastY = touches[0].pageY;
            return;
          }
          const dx = touches[0].pageX - gestureRef.current.lastX;
          const dy = touches[0].pageY - gestureRef.current.lastY;
          liveRef.current.translateX += dx;
          liveRef.current.translateY += dy;
          gestureRef.current.lastX = touches[0].pageX;
          gestureRef.current.lastY = touches[0].pageY;
          setTranslate({
            x: liveRef.current.translateX,
            y: liveRef.current.translateY,
          });
        }
      },
      onPanResponderRelease: () => {
        gestureRef.current.mode = "none";
      },
      onPanResponderTerminate: () => {
        gestureRef.current.mode = "none";
      },
    }),
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setContainerSize({ width: w, height: h });
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleJumpToPerson = (personId: string) => {
    const pos = personPositions.get(personId);
    if (!pos || containerSize.width === 0) return;

    const s = liveRef.current.scale;
    const tx = containerSize.width / 2 - s * pos.x;
    const ty = containerSize.height / 2 - s * pos.y;

    animateTo(tx, ty, s, 300);

    setSearchOpen(false);
    setSearchQuery("");
    onPersonPress?.(personId);
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return persons
      .filter((p) => p.fullName.toLowerCase().includes(q))
      .slice(0, 30);
  }, [searchQuery, persons]);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...panResponder.panHandlers}
      onLayout={handleLayout}
    >
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <Pattern
            id="dotGrid"
            width={28}
            height={28}
            patternUnits="userSpaceOnUse"
          >
            <Circle cx={2} cy={2} r={1.4} fill={colors.border} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#dotGrid)" />
      </Svg>

      <View
        style={{
          transform: [
            { translateX: translate.x },
            { translateY: translate.y },
            { scale },
          ],
        }}
      >
        <Svg width={width} height={height}>
          {nodes.map((node) => {
            const cx = node.x + offsetX;
            const cy = node.y + offsetY;
            const d = node.data;

            if (d.isPlaceholder) return null;

            if (d.multiMarriage) {
              const anchor = d.multiMarriage.anchor;
              const nodeChildren = node.children ?? [];
              let childCursor = 0;

              const branches = d.multiMarriage.marriages.map((marriage) => {
                const count =
                  marriage.children.length > 0 ? marriage.children.length : 1;
                const group = nodeChildren.slice(
                  childCursor,
                  childCursor + count,
                );
                childCursor += count;

                const groupXs = group.map((c) => c.x + offsetX);
                const centerX =
                  (Math.min(...groupXs) + Math.max(...groupXs)) / 2;
                const realChildren = group.filter((c) => !c.data.isPlaceholder);

                return { marriage, centerX, group: realChildren };
              });

              const spouseBoxY = cy + NODE_HEIGHT + 15;

              return (
                <React.Fragment key={d.id}>
                  <PersonBox
                    x={cx - NODE_WIDTH / 4}
                    y={cy}
                    w={NODE_WIDTH / 2}
                    h={NODE_HEIGHT}
                    person={anchor}
                    isTruong={truongIds?.has(anchor.id) ?? false}
                    isMe={mePersonId === anchor.id}
                    onPress={() => onPersonPress?.(anchor.id)}
                  />

                  {branches.map(({ marriage, centerX, group }) => (
                    <React.Fragment key={marriage.familyId}>
                      <BranchLine
                        sx={cx}
                        sy={cy + NODE_HEIGHT}
                        tx={centerX}
                        ty={spouseBoxY}
                      />

                      {marriage.spouse && (
                        <PersonBox
                          x={centerX - NODE_WIDTH / 4}
                          y={spouseBoxY}
                          w={NODE_WIDTH / 2}
                          h={NODE_HEIGHT}
                          person={marriage.spouse}
                          isTruong={truongIds?.has(marriage.spouse.id) ?? false}
                          isMe={mePersonId === marriage.spouse.id}
                          onPress={() => onPersonPress?.(marriage.spouse!.id)}
                        />
                      )}

                      <BranchConnector
                        originX={centerX}
                        originY={spouseBoxY + NODE_HEIGHT}
                        childTargets={group.map((c) => ({
                          id: c.data.id,
                          x: c.x + offsetX,
                          y: c.y + offsetY,
                        }))}
                        familyId={marriage.familyId}
                        expandableFamilyIds={expandableFamilyIds}
                        collapsedFamilyIds={collapsedFamilyIds}
                        onToggleCollapse={onToggleCollapse}
                      />
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            }

            if (d.husband || d.wife) {
              const boxW = NODE_WIDTH / 2 - 8;
              const ringIconY = cy + NODE_HEIGHT * 0.35;
              const childTargets = (node.children ?? []).map((c) => ({
                id: c.data.id,
                x: c.x + offsetX,
                y: c.y + offsetY,
              }));
              return (
                <React.Fragment key={d.id}>
                  <SvgText
                    x={cx}
                    y={ringIconY}
                    fontSize={13}
                    textAnchor="middle"
                  >
                    💍
                  </SvgText>

                  <BranchConnector
                    originX={cx}
                    originY={cy + NODE_HEIGHT}
                    childTargets={childTargets}
                    familyId={d.id}
                    expandableFamilyIds={expandableFamilyIds}
                    collapsedFamilyIds={collapsedFamilyIds}
                    onToggleCollapse={onToggleCollapse}
                  />

                  {d.husband && (
                    <PersonBox
                      x={cx - NODE_WIDTH / 2}
                      y={cy}
                      w={boxW}
                      h={NODE_HEIGHT}
                      person={d.husband}
                      isTruong={truongIds?.has(d.husband.id) ?? false}
                      isMe={mePersonId === d.husband.id}
                      onPress={() => onPersonPress?.(d.husband!.id)}
                    />
                  )}
                  {d.wife && (
                    <PersonBox
                      x={cx + 12}
                      y={cy}
                      w={boxW}
                      h={NODE_HEIGHT}
                      person={d.wife}
                      isTruong={truongIds?.has(d.wife.id) ?? false}
                      isMe={mePersonId === d.wife.id}
                      onPress={() => onPersonPress?.(d.wife!.id)}
                    />
                  )}
                </React.Fragment>
              );
            }

            if (d.singlePerson) {
              return (
                <PersonBox
                  key={d.id}
                  x={cx - NODE_WIDTH / 4}
                  y={cy}
                  w={NODE_WIDTH / 2}
                  h={NODE_HEIGHT}
                  person={d.singlePerson}
                  isTruong={truongIds?.has(d.singlePerson.id) ?? false}
                  isMe={mePersonId === d.singlePerson.id}
                  onPress={() => onPersonPress?.(d.singlePerson!.id)}
                />
              );
            }
            return null;
          })}
        </Svg>
      </View>

      <TouchableOpacity
        style={[
          styles.searchBtn,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => setSearchOpen(true)}
      >
        <Text style={styles.searchBtnIcon}>🔍</Text>
      </TouchableOpacity>

      <View
        style={[
          styles.zoomBadge,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.zoomBadgeText, { color: colors.textSecondary }]}>
          {Math.round(scale * 100)}%
        </Text>
      </View>

      <Modal
        visible={searchOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSearchOpen(false)}
      >
        <Pressable
          style={styles.searchOverlay}
          onPress={() => setSearchOpen(false)}
        >
          <Pressable
            style={[styles.searchCard, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <TextInput
              style={[
                styles.searchInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Tìm theo tên..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 320 }}
              ListEmptyComponent={
                searchQuery.trim() !== "" ? (
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    Không tìm thấy ai tên "{searchQuery}"
                  </Text>
                ) : null
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultRow}
                  onPress={() => handleJumpToPerson(item.id)}
                >
                  <View
                    style={[
                      styles.resultAvatar,
                      {
                        backgroundColor:
                          item.gender === "male" ? colors.male : colors.female,
                      },
                    ]}
                  >
                    {item.photoUri ? (
                      <SvgImage
                        x={0}
                        y={0}
                        width={36}
                        height={36}
                        href={item.photoUri}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    ) : (
                      <Text style={styles.resultAvatarText}>
                        {item.fullName.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.resultName, { color: colors.text }]}>
                    {item.fullName}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.searchCloseBtn}
              onPress={() => setSearchOpen(false)}
            >
              <Text
                style={[
                  styles.searchCloseText,
                  { color: colors.textSecondary },
                ]}
              >
                Đóng
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function PersonBox({
  x,
  y,
  w,
  h,
  person,
  isTruong = false,
  isMe = false,
  onPress,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  person: Person;
  isTruong?: boolean;
  isMe?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const isDeceased = !!person.deathYear;

  const cx = x + w / 2;
  const avatarR = 24;
  const avatarCy = y + avatarR + 2;
  const baseColor = person.gender === "male" ? colors.male : colors.female;
  const ringColor = isMe ? colors.success : isTruong ? colors.accent : null;

  return (
    <>
      {ringColor && (
        <Circle
          cx={cx}
          cy={avatarCy}
          r={avatarR + 4}
          fill="none"
          stroke={ringColor}
          strokeWidth={3}
          onPress={onPress}
        />
      )}

      {person.photoUri ? (
        <>
          <Defs>
            <ClipPath id={`clip-${person.id}`}>
              <Circle cx={cx} cy={avatarCy} r={avatarR} />
            </ClipPath>
          </Defs>
          <SvgImage
            x={cx - avatarR}
            y={avatarCy - avatarR}
            width={avatarR * 2}
            height={avatarR * 2}
            href={person.photoUri}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#clip-${person.id})`}
            opacity={isDeceased ? 0.45 : 1}
            onPress={onPress}
          />
        </>
      ) : (
        <>
          <Circle
            cx={cx}
            cy={avatarCy}
            r={avatarR}
            fill={baseColor}
            opacity={isDeceased ? 0.45 : 1}
            onPress={onPress}
          />
          <SvgText
            x={cx}
            y={avatarCy + 6}
            fontSize={18}
            fontWeight="700"
            fill="#fff"
            textAnchor="middle"
            onPress={onPress}
          >
            {person.fullName.charAt(0)}
          </SvgText>
        </>
      )}

      <Circle
        cx={cx + avatarR - 4}
        cy={avatarCy + avatarR - 4}
        r={9}
        fill={colors.surface}
        stroke={baseColor}
        strokeWidth={1.5}
        onPress={onPress}
      />
      <SvgText
        x={cx + avatarR - 4}
        y={avatarCy + avatarR - 1}
        fontSize={10}
        fontWeight="700"
        fill={baseColor}
        textAnchor="middle"
        onPress={onPress}
      >
        {person.gender === "male" ? "♂" : "♀"}
      </SvgText>

      <SvgText
        x={cx}
        y={avatarCy + avatarR + 18}
        fontSize={12}
        fontWeight="600"
        fill={isDeceased ? colors.textSecondary : colors.text}
        textAnchor="middle"
        onPress={onPress}
      >
        {person.fullName}
      </SvgText>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  searchBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  searchBtnIcon: { fontSize: 18 },
  zoomBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  zoomBadgeText: { fontSize: 12, fontWeight: "700" },

  searchOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    paddingTop: 80,
  },
  searchCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  emptyText: { textAlign: "center", fontSize: 13, paddingVertical: 20 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 9,
  },
  resultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  resultAvatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  resultName: { fontSize: 14, fontWeight: "600" },
  searchCloseBtn: { marginTop: 8, alignItems: "center", paddingVertical: 8 },
  searchCloseText: { fontWeight: "600", fontSize: 13 },
});
