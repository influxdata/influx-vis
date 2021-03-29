import { Card } from "antd";
import React from "react";

type THomePageProps = {

};

export const HomePage: React.FC<THomePageProps> = ({ }) => {

  return <>
    <Card title="Example project for visualisation with influxDB backend">
      This project is example how to use influxdata as source for different graph/visualisation libraries. 
      <div />
      Function "useInfluxSource" simulates influxdb influx source through csv influx together with user inputed select of which columns is selected to group values. UI has also buildin generator for random csv lines.
      <div />
      Only not-pivoted data (values stored in "_value" column) are supported for now.
      <div />
      <strong>normalizedDataFromTable</strong> show proposed function for easier more "JavaScript-ish" working with incoming influx data. There should be only simple transformation needed after data normalization function.
      <div />
      Simplification algorithm presented on Best practice tab is <strong>not</strong> used for libraries (original data is used)
    </Card>
  </>;
};
