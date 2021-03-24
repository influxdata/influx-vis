import { Card, Col, Row, Switch } from "antd";
import React, { Profiler, useRef, useState } from "react";
import { normalizedDataFromTable, useInfluxSource } from "../views/InfluxSource";
import "../util/utils";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ResponsiveLine, ResponsiveLineCanvas } from '@nivo/line';

type TNivoPageProps = {

};

const formatDate = (d: any): string => {
  if (typeof d === "number")
    return formatDate(new Date(d));
  if (d instanceof Date)
    return `${d.getHours()}:${d.getMinutes()}`;
  return "";
}

export const NivoPage: React.FC<TNivoPageProps> = ({ }) => {

  const { element: influxSourceElement, table, tableVis, selectedColumns } = useInfluxSource();
  const { data, keys } = normalizedDataFromTable(table, selectedColumns);

  const nivoData = keys.map(key => ({
    id: key,
    data: Object.entries(data)
      .filter(([_, values]) => values[key] !== undefined)
      .map(([x, values]) => ({ x: +x, y: values[key] })),
  }))

  const [isCanvas, setIsCanvas] = useState(true);

  const LineComponent = (isCanvas ? ResponsiveLineCanvas : ResponsiveLine) as typeof ResponsiveLine;

  const divRef = useRef<HTMLDivElement>(undefined!);

  const Chart = () => (
    <>
      <Switch
        checked={isCanvas}
        onChange={setIsCanvas}
        checkedChildren={"CANVAS"} unCheckedChildren={"SVG"} style={{ width: "80px" }}
      />
      <div style={{ height: "300px", width: "100%" }}>
        <LineComponent
          data={nivoData}

          margin={{ top: 50, right: 50, bottom: 110, left: 60 }}
          // yFormat=" >-.2f"
          xScale={{ type: "linear", min: "auto", max: "auto" }}
          yScale={{ type: "linear", min: "auto", }}
          enableGridX={false}
          enableGridY={false}
          enablePoints={false}
          enableSlices={"x"}
          // isInteractive={false}
          axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 40,
            format: (x) => formatDate(x),
          }}
          axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
          }}
        />
      </div>
    </>)
    ;


  return <>
    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <Card style={{ backgroundColor: "black" }} >
          {tableVis}
        </Card>
      </Col>

      <Col xs={24} xl={8} >
        <Card style={{ height: "100%" }} >
          <Profiler id="chart-nivo" onRender={(_id, _phase, duration) => { divRef?.current && (divRef.current.textContent = "last render time: " + (duration.toFixed(3) || "")); }}>
            <Chart />
          </Profiler>
          <div ref={divRef} style={{ position: "absolute", bottom: 4, left: 4 }} />
        </Card>
      </Col>
      <Col xs={24} xl={8}>
        <Card style={{ height: "100%" }} bodyStyle={{ height: "100%" }}>
          {influxSourceElement}
        </Card>
      </Col>
      <Col xs={24} xl={8}>
        <Card style={{ height: "100%", minHeight: "400px" }}>
          <div style={{ overflow: "auto", position: "absolute", height: "calc(100% - (24px * 2))", width: "calc(100% - (24px * 2))" }}>
            <SyntaxHighlighter language="jsx" style={docco} >
              {`\
`}
            </SyntaxHighlighter>
          </div>
        </Card>
      </Col>
    </Row>
  </>;
};
