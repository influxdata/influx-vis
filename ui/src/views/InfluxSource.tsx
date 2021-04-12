import React from "react";
import { newTable, fromFlux } from '@influxdata/giraffe'
import { useState } from "react";
import { Button, Form, InputNumber, Select, Switch } from "antd";
import FormItem from "antd/lib/form/FormItem";
import { range } from "../util";
import { Plot } from "@influxdata/giraffe";
import { DEFAULT_TABLE_COLORS } from "@influxdata/giraffe";
import TextArea from "antd/lib/input/TextArea";

import { Option } from "antd/lib/mentions";
import { TableGraphLayerConfig } from "@influxdata/giraffe/dist/types";
import csvs from "../data/giraffe";
import "../util";
import { csvFromLines, randomLine } from "../data/process/utils";
import { Table } from "@influxdata/giraffe";

export type NumericDataWithKeys = { [_time: number]: { [key: string]: number } };

// todo: use @influxdata/influxdb-client instead of giraffe table

export const normalizedDataFromTable = (table: Table, groupByColumns: string[]) => {
  const data: NumericDataWithKeys = {};

  const time = table.getColumn("_time", "number") as number[] || [];
  const values = table.getColumn("_value", "number") as number[] || [];

  const keysColumns = groupByColumns.map(x => table.getColumn(x,) as number[] | string[])
  const getKey = (i: number) => {
    const keys = keysColumns
      .map(x => x?.[i] || "")
      .map(x => typeof x === "number" ? x.toString() : x)
      .reduce((a, b) => `${a} ${b}`, "")
      ;

    return keys;
  };

  const keysArr = range(table.length || 0)
    .map(getKey)
    ;

  const keys = keysArr.uniqueStr();

  if (time?.length)
    time?.forEach((time, i) => {
      const value = values[i];
      const key = keysArr[i];

      const entry = data[time];
      if (!entry)
        data[time] = { [key]: value };
      else
        entry[key] = value;
    });

  return { data, keys };
}


const useRandomGenerator = (onGenerate: (line: (number | undefined)[][]) => void) => {
  const [lines, setLines] = useState(5);
  const [points, setPoints] = useState(1_000);
  const [density, setDensity] = useState(1);
  const [noise, setNoise] = useState(true);

  const Component = <Form layout="inline">
    <FormItem label={"Points"}>
      <InputNumber value={points} onChange={setPoints} />
    </FormItem>
    <FormItem label={"Lines"}>
      <InputNumber value={lines} onChange={setLines} />
    </FormItem>
    <FormItem label={"Density [0,1]"}>
      <InputNumber value={density} onChange={setDensity} />
    </FormItem>
    <FormItem label={"Use Noise"}>
      <Switch checked={noise} onChange={setNoise} />
    </FormItem>
    <FormItem>
      <Button onClick={() => {
        const line = randomLine({ points, lines, noise, density });
        onGenerate(line);
      }}>Generate</Button>
    </FormItem>
  </Form>;

  return { Component, };

}


export const useInfluxSource = () => {
  const [csv, setCsv] = useState("");
  const [preset, setPreset] = useState("");

  const _table = (() => {
    // return newTable(0);
    try {
      return fromFlux(csv).table || newTable(0);
    } catch (e) {
      return newTable(0);
    }
  })();

  const [selectedColumns, setSelectedColumns] = useState<string[]>(["_field"]);

  // todo: add optional simplification
  const table = _table;

  const columns = table.columnKeys.filter(x => x !== "_time" && x !== "_start" && x !== "_stop" && x !== "_value")

  const tableVis =
    <div
      style={{
        width: 'calc(100%)',
        height: '200px',
        filter: "invert(1)",
        // margin: '50px',
      }}
    >
      {table?.length
        ? <Plot config={{
          fluxResponse: csv,
          layers: [
            {
              type: 'table',
              properties: {
                colors: DEFAULT_TABLE_COLORS,
                decimalPlaces: {},
                fieldOptions: [],
                tableOptions: {

                },
                timeFormat: "YYYY/MM/DD HH:mm:ss",
              },
              timeZone: "Local",
            } as TableGraphLayerConfig,
          ],
        }} />
        : undefined
      }
    </div>
    ;

  const { Component: generator } = useRandomGenerator((line) => {
    const csv = csvFromLines(line);
    setSelectedColumns(["_field", "line"]);
    setCsv(csv);
  });

  const element: React.ReactElement = (<>
    <Form
      labelCol={{ xs: 24, md: 8 }}
      wrapperCol={{ xs: 24, md: 8 }}
    >
      <FormItem label={"Preset"}>
        <Select value={preset} onChange={x => {
          setPreset(x);
          const csv = csvs.find(([key]) => key === x)?.[1];
          if (!csv) return;
          setCsv(csv);
        }}>
          <Option value="">Custom</Option>
          {csvs.map(([key]) =>
            <Option value={key} >{key}</Option>
          )}
        </Select>
      </FormItem>
      <FormItem label={"CSV"} style={{ width: "100%", height: "100%", position: "relative" }}>
        <TextArea onChange={x => { setPreset(""); setCsv(x.target.value); }} value={csv.split("\n").limit(100).join("\n")} rows={10} ></TextArea>
        <div style={{ position: "absolute", right: 24, bottom: 4, opacity: .9, background: "white", padding: 4 }}>
          Could be trimmed
        </div>
        <div style={{ position: "absolute", right: 24, top: 2, padding: 4, background: "white" }}>
          <Button style={{ marginRight: 4 }} onClick={async () => {
            await navigator.clipboard.writeText(csv);
          }}>Copy</Button>
          <Button onClick={async () => {
            const text = await navigator.clipboard.readText();
            setCsv(text);
          }}>Paste</Button>
        </div>
      </FormItem>
      <FormItem label={"Generate"}>
        {generator}
      </FormItem>
      <FormItem label={"Group by Tags"}>
        <Select value={selectedColumns} onChange={x => setSelectedColumns(x.uniqueStr())} mode="multiple">
          {columns.map(x => <Option value={x} >{x}</Option>)}
        </Select>
      </FormItem>
    </Form>
  </>)
    ;


  return {
    table,
    element,
    tableVis,
    selectedColumns,
  };
};


