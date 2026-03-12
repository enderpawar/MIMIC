import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Position } from '@xyflow/react';

/** Control point distance as ratio of segment length (curve roundness) */
const BEZIER_OFFSET = 0.25;
/** Spring: lower = more latency (0.02), overshoot (1.06) gives elasticity */
const SPRING_STRENGTH = 0.02;
const SPRING_OVERSHOOT = 1.06;
const DAMPING = 0.82;

export interface ElasticConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromPosition: Position;
  toPosition: Position;
  connectionLineStyle?: CSSProperties;
}

function getControlOffset(position: Position, fromX: number, fromY: number, toX: number, toY: number): { x: number; y: number } {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy) || 1;
  const offset = Math.min(len * BEZIER_OFFSET, 120);
  switch (position) {
    case Position.Left:
      return { x: -offset, y: 0 };
    case Position.Right:
      return { x: offset, y: 0 };
    case Position.Top:
      return { x: 0, y: -offset };
    case Position.Bottom:
      return { x: 0, y: offset };
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * Make.com-style connection line:
 * - Cubic Bezier curve
 * - Spring physics: line end follows mouse with latency and elasticity
 */
export function ElasticConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  connectionLineStyle,
}: ElasticConnectionLineProps): JSX.Element {
  const displayRef = useRef({ x: toX, y: toY, vx: 0, vy: 0 });
  const pathRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    displayRef.current.x = toX;
    displayRef.current.y = toY;
    displayRef.current.vx = 0;
    displayRef.current.vy = 0;
  }, [toX, toY]);

  useEffect(() => {
    function tick(): void {
      const display = displayRef.current;
      const dx = toX - display.x;
      const dy = toY - display.y;
      display.vx += dx * SPRING_STRENGTH * SPRING_OVERSHOOT;
      display.vy += dy * SPRING_STRENGTH * SPRING_OVERSHOOT;
      display.vx *= DAMPING;
      display.vy *= DAMPING;
      display.x += display.vx;
      display.y += display.vy;

      const o1 = getControlOffset(fromPosition, fromX, fromY, display.x, display.y);
      const o2 = getControlOffset(toPosition, fromX, fromY, display.x, display.y);
      const cx1 = fromX + o1.x;
      const cy1 = fromY + o1.y;
      const cx2 = display.x + o2.x;
      const cy2 = display.y + o2.y;
      const d = `M ${fromX} ${fromY} C ${cx1} ${cy1} ${cx2} ${cy2} ${display.x} ${display.y}`;

      if (pathRef.current) pathRef.current.setAttribute('d', d);
      if (circleRef.current) {
        circleRef.current.setAttribute('cx', String(display.x));
        circleRef.current.setAttribute('cy', String(display.y));
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fromX, fromY, toX, toY, fromPosition, toPosition]);

  const o1 = getControlOffset(fromPosition, fromX, fromY, toX, toY);
  const o2 = getControlOffset(toPosition, fromX, fromY, toX, toY);
  const cx1 = fromX + o1.x;
  const cy1 = fromY + o1.y;
  const cx2 = toX + o2.x;
  const cy2 = toY + o2.y;
  const initialD = `M ${fromX} ${fromY} C ${cx1} ${cy1} ${cx2} ${cy2} ${toX} ${toY}`;

  return (
    <g>
      <path
        ref={pathRef}
        fill="none"
        stroke="var(--editor-connection-line, #94a3b8)"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="react-flow__connection-path"
        d={initialD}
        style={connectionLineStyle}
      />
      <circle
        ref={circleRef}
        cx={toX}
        cy={toY}
        r={4}
        fill="var(--editor-connection-line, #94a3b8)"
        style={connectionLineStyle}
      />
    </g>
  );
}
