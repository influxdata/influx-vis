import { Card, Row, Col, Slider, InputNumber, Button } from "antd";
import FormItem from "antd/lib/form/FormItem";
import React, { useEffect, useState } from "react";
import { Point, simplifyLine } from "../data/process/simplifyLine";
import { randomLine } from "../data/process/utils";
import { pairs } from "../util";

type TSimplificationDemoProps = {

};

export const SimplificationDemo: React.FC<TSimplificationDemoProps> = (props) => {
  // const { } = props;
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => generateNew(), []);

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
