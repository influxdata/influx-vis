import { Card, Col, Row } from "antd";
import React from "react";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Line, Brush, Legend, Tooltip } from "recharts";
import { normalizedDataFromTable, useInfluxSource } from "../views/InfluxSource";
import "../util/utils";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

type TRechartsPageProps = {

};

const formatDate = (d: Date) => {
  return `${d.getHours()}:${d.getMinutes()}`;
}

const colorFromIndex = (i: number) => `#${i % 2 === 0 ? 'ff' : '00'}${i % 3 === 1 ? 'aa' : '00'
  }${i % 3 === 0 ? 'ff' : '00'}`;

export const RechartsPage: React.FC<TRechartsPageProps> = ({ }) => {

  const { element: influxSourceElement, table, tableVis, selectedColumns } = useInfluxSource();
  const { data, keys } = normalizedDataFromTable(table, selectedColumns);

  const rechartsData = Object.entries(data).map(([key, values]) => ({ ...values, _time: +key }))

  const Chart = () =>
    <ResponsiveContainer height="100%" minHeight="300px">
      <LineChart data={rechartsData}>
        <XAxis
          dataKey="_time"
          tickFormatter={(t) => {
            if (t === 'auto' || t === 0) return "";
            const date = new Date(t)
            return formatDate(date);
          }}
        />
        <YAxis />
        {
          keys.map((x, i) =>
            <Line
              isAnimationActive={false}
              dataKey={x}
              type="natural"
              dot={false}
              stroke={colorFromIndex(i)}
            />
          )
        }
        <Tooltip
          isAnimationActive={false}
          formatter={(a: number) => a.toFixed(3)}
          labelFormatter={(d: number) => formatDate(new Date(d))}
        />
        <Brush />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
    ;
  // TODO: https://perspective.finos.org/
  return <>
    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <Card style={{ backgroundColor: "black" }} >
          {tableVis}
        </Card>
      </Col>

      <Col xs={24} xl={8} >
        <Card style={{ height: "100%" }}>
          <Chart />
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
            Normalize data
            <SyntaxHighlighter language="jsx" style={docco} >
              {`const { data, keys } = normalizedDataFromTable(table, groupByCols);`}
            </SyntaxHighlighter>

            Modify normalized data for usage in recharts
            <SyntaxHighlighter language="jsx" style={docco} >
              {`const rechartsData = Object.entries(data)
  .map(([key, values]) => ({ ...values, _time: +key }))`}
            </SyntaxHighlighter>

            Render recharts line component
            <SyntaxHighlighter language="jsx" style={docco} >
              {`\
<LineChart data={rechartsData}>
  <XAxis
    dataKey="_time"
    tickFormatter={(t) => {
      if (t === 'auto' || t === 0) return "";
      const date = new Date(t)
      return formatDate(date);
    }}
  />
  <YAxis />
  {
    keys.map((x, i) =>
      <Line
        isAnimationActive={false}
        dataKey={x}
        type="natural"
        dot={false}
        stroke={\`#\${i % 2 == 0 ? 'ff' : '00'}\${
          i % 3 === 1 ? 'aa' : '00'
          }\${i % 3 === 0 ? 'ff' : '00'}\`}
      />
    )
  }
  <Tooltip
    isAnimationActive={false}
    formatter={(a:number)=>a.toFixed(3)}
    labelFormatter={(d: number)=>formatDate(new Date(d))}
  />
  <Brush />
  <Legend />
</LineChart>
`}
            </SyntaxHighlighter>
          </div>
        </Card>
      </Col>
    </Row>
  </>;
};
