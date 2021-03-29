import { Card, Row, Col, Slider, InputNumber, Button } from "antd";
import FormItem from "antd/lib/form/FormItem";
import React, { useEffect, useState } from "react";
import { randomLine } from "../data/process/utils";
import { range, sorting, zip } from "../util/utils";

type TSimplificationDemoProps = {

};

type Point = {
  y: number;
  x: number;
};

type Line = Point[];


const useRefresh = () => {
  const [refreshToken, setRefreshToken] = useState(Date.now());

  return () => setRefreshToken(Date.now());
}

const distFromLine = (x1: number, y1: number, x2: number, y2: number, px: number, py: number): number => {
  const x2m1 = x2 - x1;
  const y2m1 = y2 - y1;
  return Math.abs((x2m1) * (y1 - py) - (x1 - px) * (y2m1)) / Math.sqrt(((x2m1) ** 2) + ((y2m1) ** 2));
}

// todo: into utils
const pairs = <T,>(arr: T[]) => zip(arr.slice(1), arr.slice(0, -1));

type simplifyLineProps = {
  line: Line,
  targetPoints: number,
}
const simplifyLine = (props: simplifyLineProps) => {
  const { line: _line, targetPoints } = props;
  const line = [..._line].sort(sorting.keySelector((p) => p.x, sorting.number.ascending))

  if (targetPoints >= line.length)
    return { line };

  if (targetPoints <= 2) {
    return { line: [line[0], line[line.length - 1]] }
  }

  const keep = range(line.length).map((_, i) => i === 0 || i === (line.length - 1));
  const distances = keep.map(() => -Infinity);

  const calculateDistBetweenI = (i0: number, i1: number) => {
    const [p0, p1] = [line[i0], line[i1]];
    const dist = distFromLine.bind(undefined, p0.x, p0.y, p1.x, p1.y);

    for (let i = i0 + 1; i < i1; i++) {
      const p = line[i];
      distances[i] = dist(p.x, p.y);
    }
  }

  calculateDistBetweenI(0, keep.length - 1)

  const addPoint = (i: number) => {
    keep[i] = true;
    distances[i] = -Infinity;
    // find left point that we keep from max dist point
    let iLower = i;
    while (!keep[--iLower]) { }
    calculateDistBetweenI(iLower, i);
    // find right point that we keep from max dist point
    let iUpper = i;
    while (!keep[++iUpper]) { }
    calculateDistBetweenI(i, iUpper);
  }

  const step = () => {
    const maxDist = Math.max(...distances);
    const maxDisti = distances.findIndex(x => x === maxDist);

    addPoint(maxDisti)
  };

  for (let i = Math.max(targetPoints - 2, 0); i--;) {
    step();
  }

  return {
    line: zip(line, keep)
      .filter(([_point, keep]) => keep)
      .map(([point, _keep]) => point)
  };
}

export const SimplificationDemo: React.FC<TSimplificationDemoProps> = (props) => {
  const { } = props;
  const [lineY, setLine] = useState<(number | undefined)[]>([]);
  const [targetPoints, setTargetPoints] = useState(100);
  const [pointsTotal, setPointsTotal] = useState(5000);

  const generateNew = () => setLine(
    randomLine({
      lines: 1,
      points: pointsTotal,
      noise: true,
    })[0]
  );

  useEffect(() => { generateNew(); }, [])

  const line = lineY.map((y, i) => ({ y: y! * 50, x: i * 5 })).filter((x) => x.y !== undefined) as Point[];
  const { line: simplifiedLine } = simplifyLine({ line, targetPoints });

  const [maxX, maxY] = [Math.max(...line.map(({ x }) => x)), Math.max(...line.map(({ y }) => y))]

  return <>
    <Card
      title={"Demo of simplification algorithm"}
      extra={<>
        points: <InputNumber value={pointsTotal} onChange={setPointsTotal} />
        <Button onClick={generateNew}>Generate new</Button>
      </>}
    >
      <Row gutter={[12, 12]}>
        <Col xs={24}>
          <FormItem label="visible points">
            <Row>
              <Col xs={2}>
                <InputNumber value={targetPoints} onChange={setTargetPoints} style={{ width: "100%" }} />
              </Col>
              <Col xs={8}>
                <Slider value={targetPoints} max={line.length} onChange={setTargetPoints} />
              </Col>
            </Row>
          </FormItem>
        </Col>
        <Col xs={24}>
          <div style={{ fontSize: "2em" }}>
            {`Optimized line contains ${(simplifiedLine.length * 100 / line.length).toFixed(2)}% (${simplifiedLine.length}) of total ${line.length} points from original line`}
          </div>
        </Col>
        {[
          { line: simplifiedLine, title: "optimized line" },
          { line: line, title: "Original line" },
        ].map(({ line, title }) => {
          const padding = 10;

          return <Col xs={12}>
            <Card {...{ title }}>
              <svg width={"95%"} height={"300px"} viewBox={`${-padding} ${-padding} ${maxX + padding * 2} ${maxY + padding * 2}`}>
                {pairs(line).map(([{ x: x1, y: y1 }, { x: x2, y: y2 }]) =>
                  <line {...{ x1, y1, x2, y2 }} stroke="black" strokeWidth={100}  strokeLinecap="round" />
                )}
              </svg>
            </Card>
          </Col>
        }
        )}
      </Row>
    </Card>
  </>;
};

SimplificationDemo.displayName = "SimplificationDemo";
