import React from "react";
import { Table as InfluxTable, newTable, fromFlux } from '@influxdata/giraffe'
import { useState } from "react";
import { Button, Form, Input, InputNumber, List, Select } from "antd";
import FormItem from "antd/lib/form/FormItem";
import { range } from "../util/utils";
import { Plot } from "@influxdata/giraffe";
import { DEFAULT_TABLE_COLORS } from "@influxdata/giraffe";
import { tableCSV } from "../util/csv";
import TextArea from "antd/lib/input/TextArea";

import * as csv01 from "../data/bandCSV";
import * as csv02 from "../data/fluxCSV";
import * as csv03 from "../data/mosaicCSV";
import * as csv04 from "../data/tableGraph";
import { Option } from "antd/lib/mentions";
import { TableGraphLayerConfig } from "@influxdata/giraffe/dist/types";

const csvs = [csv01, csv02, csv03, csv04].map(x => Object.entries(x)).flat()

type TInfluxSourceProps = {
  onTableChange: (table: InfluxTable) => void
};

export const useInfluxSource = () => {
  const [csv, setCsv] = useState("");
  const [preset, setPreset] = useState("");

  const table = (() => {
    try {
      return fromFlux(csv).table || newTable(0);
    } catch (e) {
      return newTable(0);
    }
  })();


  const tableVis =
    <div
      style={{
        width: 'calc(100%)',
        height: '200px',
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

  const element: React.ReactElement = <>
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
      <FormItem label={"CSV"} style={{ width: "100%", height: "100%" }}>
        <TextArea onChange={x => { setPreset(""); setCsv(x.target.value); }} value={csv} rows={10} ></TextArea>
      </FormItem>
    </Form>
  </>;


  return {
    table,
    element,
    tableVis,
  };
};

