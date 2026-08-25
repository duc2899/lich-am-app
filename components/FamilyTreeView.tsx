import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
} from "react-native";
import Svg, { Rect, Line, Circle, Text as SvgText } from "react-native-svg";
import { DisplayNode } from "../utils/familyTreeBuilder";
import {
  computeFamilyTreeLayout,
  NODE_WIDTH,
  NODE_HEIGHT,
} from "../utils/familyTreeLayout";
import { Person } from "../types/family";

type Props = {
  root: DisplayNode;
  onPersonPress?: (personId: string) => void;
  onAddChildPress?: (familyId: string) => void;
  truongIds?: Set<string>;
  mePersonId?: string | null;
};

function touchDistance(touches: { pageX: number; pageY: number }[]): number {
  const [a, b] = touches;
  const dx = a.pageX - b.pageX;
  const dy = a.pageY - b.pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function FamilyTreeView({
  root,
  onPersonPress,
  onAddChildPress,
  truongIds,
  mePersonId,
}: Props) {
  const { nodes, links, width, height } = computeFamilyTreeLayout(root);
  const xs = nodes.map((n) => n.x);
  const offsetX = -Math.min(...xs) + NODE_WIDTH / 2 + 40;
  const offsetY = 60;

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Dùng ref để đọc/ghi giá trị mới nhất trong lúc kéo, tránh setState bị trễ (stale closure)
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
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

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
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
          {links.map((link, i) => {
            const sx = link.source.x + offsetX;
            const sy = link.source.y + offsetY + NODE_HEIGHT;
            const tx = link.target.x + offsetX;
            const ty = link.target.y + offsetY;
            const midY = sy + (ty - sy) / 2;
            return (
              <React.Fragment key={i}>
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
              </React.Fragment>
            );
          })}

          {nodes.map((node) => {
            const cx = node.x + offsetX;
            const cy = node.y + offsetY;
            const d = node.data;

            if (d.husband || d.wife) {
              const boxW = NODE_WIDTH / 2 - 8; // trừ thêm khoảng hở giữa 2 ô
              const marriageLineY = cy + NODE_HEIGHT / 2;
              const addChildY = cy + NODE_HEIGHT + 18; // nằm dưới ô, trên đường kẻ xuống con
              return (
                <React.Fragment key={d.id}>
                  {/* Dây nối nhỏ thể hiện quan hệ vợ chồng, giữa 2 ô */}
                  <Line
                    x1={cx - 6}
                    y1={marriageLineY}
                    x2={cx + 6}
                    y2={marriageLineY}
                    stroke="#999"
                    strokeWidth={2}
                  />

                  {/* Nút tròn "+" -> bấm để thêm con, đặt riêng bên dưới cặp để không đè lên ô nào */}
                  <Circle
                    cx={cx}
                    cy={addChildY}
                    r={12}
                    fill="#4A90D9"
                    onPress={() => onAddChildPress?.(d.id)}
                  />
                  <SvgText
                    x={cx}
                    y={addChildY + 4}
                    fontSize={15}
                    fontWeight="700"
                    fill="#fff"
                    textAnchor="middle"
                    onPress={() => onAddChildPress?.(d.id)}
                  >
                    +
                  </SvgText>

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
  const isDeceased = !!person.deathYear;
  const currentYear = new Date().getFullYear();

  const fill = isDeceased
    ? "#ECECEC"
    : person.gender === "male"
      ? "#DCEBFB"
      : "#FBE3EC";
  const baseStroke = person.gender === "male" ? "#4A90D9" : "#D96BA0";
  const stroke = isMe ? "#2E8B57" : isTruong ? "#D9A441" : baseStroke;
  const strokeWidth = isMe || isTruong ? 3 : 1.5;

  // Dòng thông tin phụ: tuổi hiện tại (còn sống) hoặc hưởng thọ (đã mất)
  let infoLine = "";
  if (isDeceased) {
    infoLine =
      person.birthYear && person.deathYear
        ? `✝ Hưởng thọ ${person.deathYear - person.birthYear} tuổi`
        : "✝ Đã mất";
  } else if (person.birthYear) {
    infoLine = `${currentYear - person.birthYear} tuổi`;
  }

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={isDeceased ? "5,3" : undefined}
        opacity={isDeceased ? 0.8 : 1}
        onPress={onPress}
      />

      {/* Vương miện đánh dấu trưởng, đặt ở góc trên bên trái ô */}
      {isTruong && (
        <SvgText
          x={x + 14}
          y={y + 16}
          fontSize={16}
          textAnchor="middle"
          onPress={onPress}
        >
          👑
        </SvgText>
      )}

      <SvgText
        x={x + w / 2}
        y={y + h / 2 - 10}
        fontSize={12}
        fontWeight="700"
        fill={isDeceased ? "#666" : "#222"}
        textAnchor="middle"
        onPress={onPress}
      >
        {person.fullName}
      </SvgText>
      {infoLine !== "" && (
        <SvgText
          x={x + w / 2}
          y={y + h / 2 + 14}
          fontSize={10}
          fontWeight="500"
          fill={isDeceased ? "#999" : "#666"}
          textAnchor="middle"
          onPress={onPress}
        >
          {infoLine}
        </SvgText>
      )}

      {/* Nhãn "Tôi", đặt ở góc trên bên phải ô */}
      {isMe && (
        <>
          <Rect
            x={x + w - 34}
            y={y + 4}
            width={30}
            height={16}
            rx={8}
            fill="#2E8B57"
            onPress={onPress}
          />
          <SvgText
            x={x + w - 19}
            y={y + 15}
            fontSize={9}
            fontWeight="700"
            fill="#fff"
            textAnchor="middle"
            onPress={onPress}
          >
            Tôi
          </SvgText>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
});
