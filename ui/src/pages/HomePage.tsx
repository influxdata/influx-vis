import { Card } from "antd";
import React from "react";

export const HomePage: React.FC = () => {

  return <>
    <Card title="Visualize InfluxDB query results by using the 3rd party React components">

      <div>

        <p>This project is a <strong>playground for React front developers</strong> that look for 
        ways to visualize <strong>InfluxDB</strong> query results by using the 3rd party <strong>React</strong> components.
        For the <strong>dashboard</strong> use case, the
        Influxdata Giraffe project is not always an option. Alternatively, some
        of the most popular graph/visualization React-based data visualization
        libraries are easy to use, too. Here we present <strong>Nivo</strong> and <strong>Recharts</strong>. This is what you find at the Nivo and
        Recharts tabs.</p>

      </div>

      <h3>How to Use this Application</h3>
      <div>
        <p>To start, follow the procedure:</p>
        <ol>
          <li>Open one of the two tabs located in the header - <strong>Recharts</strong> or <strong>Nivo</strong>.</li>
          <li>Select sample data from the dropdown labeled <strong>Preset</strong>.</li>
          <li>The line chart shows up. Its properties can be modified by UI controls in the middle.</li>
          <ul>
            <li>Copy paste your CSV, that you get from Influx DB.</li>
            <li>Generate random points, number of lines, density etc. Find the performance limits of <strong>SVG</strong> and <strong>canvas</strong> on your computer.</li>
            <li>Group the data in the chart by columns</li>
          </ul>
          <li>The source code used to display the chart is shown on the right side.</li>
          <li>The same data is rendered in the table in the last row.</li>
        </ol>
      </div>

      <h3>Performance and Scalability</h3>
      <div>

        <p>To plot lines, SVG finds the performance limits first. This applies
        above 50K points. In Nivo, there is the option to use a better-performing
        canvas. However, for dashboards, replacing <strong>SVG</strong> with <strong>canvas</strong> to render
        data faster is not the complete answer
        to acceptable performance. The canvas object starts hitting its limit
        with 100-300K points.</p>

      </div>

      <div>
        <p>The last tab called <strong>Best practice</strong> shows how to <strong>build high-performing and scalable charts</strong>.</p>
      </div>

      <h3>How is the application designed</h3>

      <div>

        <p>There is the function called <code>useInfluxSource</code>. It
        represents the InfluxDB source. The implementation provides data in the
        format of annotated CSVs that are served by the database. The
        application has also a built-in data generator of random CSV lines.</p>

      </div>

      <div>

        <p>The demo renders a chart that plots the data stored in the column
        titled <strong>_value</strong>. There is the UI control demonstrating
        how the data fields can be aggregated.</p>

      </div>

      <div>

        <p>To plot the chart, the data must be transformed into data structures
        that are natively consumable by chart objects. In the source code, look
        up the function called <code>normalizedDataFromTable</code>. The
        function makes it easy to work with incoming InfluxDB data.</p>

      </div>

    </Card>
  </>;
};
