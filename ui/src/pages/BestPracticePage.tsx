import { Card, Col, PageHeader, Row } from "antd";
import React from "react";
import { SimplificationDemo } from "../views/SimplificationDemo";

const bestPracticesText = `\
When dealing with bigger datasets, there are problems that need to be solved to make good user interface. 
In this situation we encounter two problems - speed and memory consuption.
Both this problems can affect slower or even high-end devices, so we need to solve them to have more inclusive sotware because 
lagging of ui can be one of barriers to entre influxdb world and can scare off possible customers.

One way to (at least partialy) solve this problem is simplification algorithm that prone points from line, 
that provides detail almost not visible for human eye therefore they are useless for visualisations.
Simplifying of line results in smaller amount of points, so drawing line won't cause browser to lag 
and original data can be removed from client browser which can help performance too.
This algorithm can be implemented on both server and client with following +:
 - server
  + less internet connection
  + less data on user browser
 - client
  + same selects as before
    + existing software can just add this alg and visualisations without need to change queries
    + don't add any more load on server
  + all data present on browser for other work 
    + show tables
    + transform data on client to do some more different visualisations and analysis
`;


type TBestPracticePageProps = {

};

export const BestPracticePage: React.FC<TBestPracticePageProps> = (props) => {
  // const { } = props;

  return <>
    <PageHeader
      title="Best practices for visualisations"
    >
      <Row gutter={[12, 12]}>
        <Col xs={24}>
          <Card>
            <pre>{bestPracticesText}</pre>
          </Card>
        </Col>
        <Col xs={24}>
          <SimplificationDemo />
        </Col>
      </Row>
    </PageHeader>
  </>;
};

BestPracticePage.displayName = "SimplifyPage";
