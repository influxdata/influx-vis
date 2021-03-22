import { Card, Col, Row, Select } from "antd";
import React from "react";
import { useState } from "react";
import reactElementToJSXString from "react-element-to-jsx-string";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Line, Brush, Legend, Tooltip } from "recharts";
import { useInfluxSource } from "../views/InfluxSource";
import "../util/utils";
import { Option } from "antd/lib/mentions";
import FormItem from "antd/lib/form/FormItem";
import { range } from "../util/utils";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
type TRechartsPageProps = {

};

const formatDate = (d: Date) => {
  return `${d.getHours()}:${d.getMinutes()}`;
}

export const RechartsPage: React.FC<TRechartsPageProps> = ({ }) => {

  const { element: influxSourceElement, table, tableVis, keys, data } = useInfluxSource();

  const rechartsData = Object.entries(data).map(([key, values]) => ({ ...values, _time: +key }))

  const Chart = () =>
    <ResponsiveContainer height="100%" minHeight="200px">
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
              stroke={`#${i % 2 == 0 ? 'ff' : '00'}${i % 3 === 1 ? 'aa' : '00'
                }${i % 3 === 0 ? 'ff' : '00'}`}
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
          <pre style={{ overflow: "auto", position: "absolute", height: "calc(100% - (24px * 2))", width: "calc(100% - (24px * 2))" }}>
            <code style={{}}>
              <SyntaxHighlighter language="jsx" style={docco}>
                {`\
const { element: influxSourceElement, table, tableVis, keys, data } = useInfluxSource();

const rechartsData = Object.entries(data)
  .map(([key, values]) => ({ ...values, _time: +key }))

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
        stroke={\`#\${i % 2 == 0 ? 'ff' : '00'}\${i % 3 === 1 ? 'aa' : '00'
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
            </code>
          </pre>
        </Card>
      </Col>
    </Row>
  </>;
};
