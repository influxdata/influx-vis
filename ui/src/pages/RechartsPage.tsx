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

type TRechartsPageProps = {

};

export const RechartsPage: React.FC<TRechartsPageProps> = ({ }) => {

  const { element: influxSourceElement, table, tableVis, keys, data } = useInfluxSource();

  const rechartsData = Object.entries(data).map(([key, values]) => ({ ...values, _time: key }))

  const Chart = () =>
    <ResponsiveContainer height="100%" minHeight="200px">
      <LineChart data={rechartsData}>
        <XAxis
          dataKey="_time"
        />
        <YAxis />
        {
          keys.map(x =>
            <Line
              isAnimationActive={false}
              dataKey={x}
              type="natural"
              dot={false}
            />
          )
        }
        <Tooltip
          isAnimationActive={false}
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
              {
                //{reactElementToJSXString(Chart())}
              }
              TODO: source for component
            </code>
          </pre>
        </Card>
      </Col>
    </Row>
  </>;
};
