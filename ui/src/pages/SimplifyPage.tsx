import { Button, Card, Col, PageHeader, Row, Slider } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { randomLine } from "../data/process/utils";
import { range, zip } from "../util/utils";

type TSimplifyPageProps = {

};

type point = {
  y: number;
  x: number;
};

const pointsTotal = 10_000;

const genLine = () => randomLine({
  lines: 1,
  points: pointsTotal,
  noise: true,
})[0];

const useRefresh = () => {
  const [refreshToken, setRefreshToken] = useState(Date.now());

  return () => setRefreshToken(Date.now());
}

export const SimplifyPage: React.FC<TSimplifyPageProps> = (props) => {
  const { } = props;
  const [lineY, setLine] = useState(genLine());
  const [keep, setKeep] = useState(range(lineY.length).map((_, i) => i === 0 || i === (lineY.length - 1)));
  const refresh = useRefresh();

  // not stable
  const generateNew = () => {
    setLine(genLine());
    setKeep(range(lineY.length).map((_, i) => i === 0 || i === (lineY.length - 1)));
    refresh();
  }

  const line = lineY.map((y, i) => ({ y: y * 50, x: i * 5 })).filter((x) => x.y !== undefined) as point[];

  const maxX = Math.max(...line.map(({ x }) => x))
  const maxY = Math.max(...line.map(({ y }) => y))

  const padding = 5;

  const lines = (() => {
    let i = 0;
    let last = line[0];
    const lines: [point, point][] = [];

    range(keep.length).forEach(x => {
      if (!keep[x])
        return;
      const newPoint = line[x];
      lines.push([last, newPoint]);
      last = newPoint;
    })

    return lines;
  })();


  //#region alg

  const [algState] = useState({
    distances: keep.map(() => -Infinity),

  });

  const distances = algState.distances;

  const distFromLine = (x1: number, y1: number, x2: number, y2: number, px: number, py: number): number => {
    const x2m1 = x2 - x1;
    const y2m1 = y2 - y1;
    return Math.abs((x2m1) * (y1 - py) - (x1 - px) * (y2m1)) / Math.sqrt(((x2m1) ** 2) + ((y2m1) ** 2));
  }

  const calculateDistBetweenI = (i0: number, i1: number) => {
    distances[i0] = -Infinity;
    distances[i1] = -Infinity;
    const [p0, p1] = [line[i0], line[i1]];

    const dist = distFromLine.bind(undefined, p0.x, p0.y, p1.x, p1.y);

    for (let i = i0 + 1; i < i1; i++) {
      const p = line[i];
      distances[i] = dist(p.x, p.y);
    }
  }

  useEffect(() => {
    calculateDistBetweenI(0, keep.length - 1)
  }, [])

  //#endregion alg

  const step = () => {
    const maxDist = Math.max(...distances);
    const maxDisti = distances.findIndex(x => x === maxDist);

    keep[maxDisti] = true;
    // find left point that we keep from max dist point
    let iLower = maxDisti;
    while (!keep[--iLower]) { }
    calculateDistBetweenI(iLower, maxDisti);
    // find right point that we keep from max dist point
    let iUpper = maxDisti;
    while (!keep[++iUpper]) { }
    calculateDistBetweenI(maxDisti, iUpper);

    // const noni = keep.findIndex(x => !x);
    // keep[noni] = true;
    refresh()
  };

  useEffect(() => {
    const i = setInterval(() => {
      if (keep.some(x => !x))
        step();
    }, 200);
    return () => clearImmediate(i as any);
  }, [lineY])

  const visiblePoints = keep.filter(x => x).length;

  return <>
    <PageHeader
      title="Demo of adapted line simplification algorithm"
    >

      <Card
        title={`${(keep.filter(x => x).length * 100 / keep.length).toFixed(0)}% Points total ${pointsTotal} Points visible: ${keep.filter(x => x).length}`}
        extra="Refresh for new diagram"
      >
        <Row>
          {/* 
          <Col xs={24}>
            <Slider value={visiblePoints} max={pointsTotal} />
          </Col>
          */}
          <Col xs={8}>
            <Card title="optimized line">
              <svg width={300} height={300} viewBox={`${-padding} ${-padding} ${maxX + padding * 2} ${maxY + padding * 2}`}>
                {lines.map(([{ x: x1, y: y1 }, { x: x2, y: y2 }]) =>
                  <line {...{ x1, y1, x2, y2 }} stroke="black" strokeWidth={100} />
                )}
              </svg>
            </Card>
          </Col>
          <Col xs={8}>
            <Card title="Points sized by adding priority">
              <svg width={300} height={300} viewBox={`${-padding} ${-padding} ${maxX + padding * 2} ${maxY + padding * 2}`}>
                {line.map(({ x, y }, i) =>
                  <circle cx={x} cy={y} r={distances[i] ** .6} />
                )}
                {zip(line.slice(1), line.slice(0, -1)).map(([{ x: x1, y: y1 }, { x: x2, y: y2 }]) =>
                  <line {...{ x1, y1, x2, y2 }} stroke="black" />
                )}
              </svg>
            </Card>
          </Col>
          <Col xs={8}>
            <Card title="Real line">
              <svg width={300} height={300} viewBox={`${-padding} ${-padding} ${maxX + padding * 2} ${maxY + padding * 2}`}>
                {zip(line.slice(1), line.slice(0, -1)).map(([{ x: x1, y: y1 }, { x: x2, y: y2 }]) =>
                  <line {...{ x1, y1, x2, y2 }} stroke="black" strokeWidth={100} />
                )}
              </svg>
            </Card>
          </Col>
        </Row>
      </Card>
    </PageHeader>
  </>;
};

SimplifyPage.displayName = "SimplifyPage";
