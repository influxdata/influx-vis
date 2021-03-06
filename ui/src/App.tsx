import React, { FunctionComponent } from 'react'
import {
  Route,
  Redirect,
  RouteComponentProps,
  withRouter,
  NavLink,
  Switch as SwitchRouter,
} from 'react-router-dom'
import './App.css'
import { Layout, Menu } from 'antd'
import { Header } from "antd/lib/layout/layout"
import { HomePage } from "./pages/HomePage"
import { RechartsPage } from "./pages/RechartsPage"
import { NivoPage } from "./pages/NivoPage"
import { BestPracticePage } from "./pages/BestPracticePage"

const pages: {
  url: string,
  label: string,
  page: React.FC,
}[] = [
    { url: "/home", label: "Home", page: HomePage },
    { url: "/recharts", label: "Recharts", page: RechartsPage },
    { url: "/nivo", label: "Nivo", page: NivoPage },
    { url: "/practices", label: "Best practice", page: BestPracticePage },
    // TODO: https://perspective.finos.org/
  ];


const App: FunctionComponent<RouteComponentProps> = (props) => {
  return (<>
    <div className="App">
      <Layout style={{ height: '100vh' }}>
        <Header className="header">
          <Menu theme="dark" mode="horizontal" selectedKeys={[props.location.pathname]}>
            {pages.map(({ label, url }) =>
              <Menu.Item key={url}>
                <NavLink to={url}>{label}</NavLink>
              </Menu.Item>
            )}
          </Menu>
        </Header>
        <Layout.Content style={{ padding: 16, overflow: "auto" }}>
          <SwitchRouter>
            <Redirect exact from="/" to="/home" />
            {pages.map(({ url, page }) => <Route exact path={url} component={page} />)}
          </SwitchRouter>
        </Layout.Content>
      </Layout>
    </div>
  </>)
}

export default withRouter(App)
