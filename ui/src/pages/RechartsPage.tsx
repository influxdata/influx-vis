import { Card, Col, Row, Select } from "antd";
import React from "react";
import { useState } from "react";
import reactElementToJSXString from "react-element-to-jsx-string";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Line, Brush, Legend, Tooltip } from "recharts";
import { useInfluxSource } from "../views/InfluxSource";
import "../util/utils";
import { Option } from "antd/lib/mentions";
import FormItem from "antd/lib/form/FormItem";

type TRechartsPageProps = {

};

export const RechartsPage: React.FC<TRechartsPageProps> = ({ }) => {

  // const data = [
  //   {
  //     "name": "Page A",
  //     "uv": 4000,
  //     "pv": 2400,
  //     "amt": 2400
  //   },
  //   {
  //     "name": "Page B",
  //     "uv": 3000,
  //     "pv": 1398,
  //     "amt": 2210
  //   },
  //   {
  //     "name": "Page C",
  //     "uv": 2000,
  //     "pv": 9800,
  //     "amt": 2290
  //   },
  //   {
  //     "name": "Page D",
  //     "uv": 2780,
  //     "pv": 3908,
  //     "amt": 2000
  //   },
  //   {
  //     "name": "Page E",
  //     "uv": 1890,
  //     "pv": 4800,
  //     "amt": 2181
  //   },
  //   {
  //     "name": "Page F",
  //     "uv": 2390,
  //     "pv": 3800,
  //     "amt": 2500
  //   },
  //   {
  //     "name": "Page G",
  //     "uv": 3490,
  //     "pv": 4300,
  //     "amt": 2100
  //   }
  // ];

  const { element: influxSourceElement, table, tableVis } = useInfluxSource();

  const time = table.getColumn("_time", "number") as number[];
  const values = table.getColumn("_value", "number") as number[] || [];
  const fields = table.getColumn("_field", "string") as string[] || [];

  const columns = table.columnKeys.filter(x => x !== "_time" && x !== "_start" && x !== "_stop" && x !== "_value" && x !== "_field")

  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // todo: hashed
  const data = !time
    ? []
    : time
      .filter((x, i) => time.findIndex((y) => y === x) === i)
      .map((x: number) => ({ _time: x } as { _time: number, [key: string]: number }))
    ;

  // const keys = selectedColumns.map(x=> table.getColumn(x,))

  if (time?.length)
    time?.forEach((time, i) => {
      const field = fields[i];
      const value = values[i];

      data.find(x => x._time === time)![field] = value;
    });

  const uniqueFields = fields.unique();

  const Chart = () =>
    <ResponsiveContainer height="100%" minHeight="200px">
      <LineChart data={data}>
        <XAxis
          dataKey="_time"
        />
        <YAxis />
        {
          uniqueFields.map(x =>
            <Line
              isAnimationActive={false}
              dataKey={x}
              type="natural"
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
          <FormItem>
            <Select onChange={x=>setSelectedColumns([x.toString(), ...selectedColumns].unique())} mode="multiple">
              {columns.map(x => <Option value={x} >{x}</Option>)}
            </Select>
          </FormItem>
        </Card>
      </Col>
      <Col xs={24} xl={8}>
        <Card style={{ height: "100%", minHeight: "400px" }}>
          <pre style={{ overflow: "auto", position: "absolute", height: "calc(100% - (24px * 2))", width: "calc(100% - (24px * 2))" }}>
            <code style={{}}>
              {reactElementToJSXString(Chart())}
            </code>
          </pre>
        </Card>
      </Col>
    </Row>
  </>;
};
