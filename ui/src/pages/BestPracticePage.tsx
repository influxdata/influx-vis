import { Card, Col, PageHeader, Row } from "antd";
import React from "react";
import { SimplificationDemo } from "../views/SimplificationDemo";

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
          <Card title="Problem Statement">
            <div>

              <p>When dealing with, bigger time series datasets, some problems need to be
              solved to make a good user interface.</p>

            </div>

            <div>

              <p>In this situation, we encounter two problems - <b>speed</b> and <b>memory</b> consumption.</p>

            </div>

            <div>

              <p>Both these problems slow down even high-end devices, so we need
              to solve them because the lagging of the UI layer can be one of
              the barriers to visualize InfluxDB queries in your application and
              can scare off its users.</p>

            </div>
            <div>

              <p>One way to, at least partially, solve this problem is to
              simplify the rendering of the line by removing those points that
              provide a level of detail almost not visible for the human eye,
              therefore they are useless for visualizations.</p>

            </div>
            <div>

              <p>Line simplification results in a smaller amount of points, so
              drawing lines won't cause the browser to lag and original data can
              be removed from the client browser. Both significantly improve the
              performance of a browser.</p>

            </div>
            <div>

              <p>This algorithm can be implemented on both server and client
              with the following beefits:</p>

            </div>
            <div>
              <ul>
                <li>server</li>
                <ul>
                  <li>low-end internet connection</li>
                  <li>less data on user browser</li>
                </ul>
                <li>client</li>
                <ul>
                  <li>all data sent to browser</li>
                  <li>the algorithm can be added with no need to change queries</li>
                  <li>don't add any more load on server</li>
                  <li>all data remain on browser for other work, such as tables, or other analytic transformations</li>
                </ul>
              </ul>
            </div>

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
