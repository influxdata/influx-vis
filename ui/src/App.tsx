import React, {useState, useEffect, FunctionComponent} from 'react'
import {
  Switch,
  Route,
  Redirect,
  RouteComponentProps,
  withRouter,
  NavLink,
  matchPath,
} from 'react-router-dom'
import './App.css'
import {Layout, Menu} from 'antd'
import {
  HomeOutlined,
  DoubleRightOutlined,
  FastForwardOutlined,
  AreaChartOutlined,
} from '@ant-design/icons'

import HomePage from './pages/HomePage'
import DevicesPage from './pages/DevicesPage'
import DevicePage from './pages/DevicePage'
import NotFoundPage from './pages/NotFoundPage'
import DashboardPage from './pages/DashboardPage'

export const VIRTUAL_DEVICE = 'virtual_device'

const {Sider} = Layout

const App: FunctionComponent<RouteComponentProps> = (props) => {
  const [menuCollapsed, setMenuCollapsed] = useState(false)

  return (
    <div className="App">
      <Layout style={{minHeight: '100vh'}}>
        <Sider
          collapsible
          collapsed={menuCollapsed as boolean}
          onCollapse={() => setMenuCollapsed(!menuCollapsed)}
        >
          <Menu
            theme="dark"
            selectedKeys={[]}
            mode="inline"
          >
            <Menu.Item key="/home" icon={<HomeOutlined />}>
              <NavLink to="/home">Home</NavLink>
            </Menu.Item>
            <Menu.Item key="/devices" icon={<DoubleRightOutlined />}>
              <NavLink to="/devices">Device Registrations</NavLink>
            </Menu.Item>
            <Menu.Item
              key="/devices/virtual_device"
              icon={<FastForwardOutlined />}
            >
              <NavLink to="/devices/virtual_device">Virtual Device</NavLink>
            </Menu.Item>
            <Menu.Item key="/dashboard/:device" icon={<AreaChartOutlined />}>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </Menu.Item>
            {}
          </Menu>
        </Sider>
        <Switch>
          <Redirect exact from="/" to="/home" />
          <Route exact path="/home" component={HomePage} />
          <Route
            exact
            path="/devices"
            render={(props) => (
              <DevicesPage {...props} helpCollapsed={helpCollapsed} />
            )}
          />
          <Route
            exact
            path="/devices/:deviceId"
            render={(props) => (
              <DevicePage {...props} helpCollapsed={helpCollapsed} />
            )}
          />
          <Redirect
            exact
            from="/dashboard"
            to={`/dashboard/${VIRTUAL_DEVICE}`}
          />
          <Route
            exact
            path="/dashboard/:deviceId"
            render={(props) => (
              <DashboardPage {...props} helpCollapsed={helpCollapsed} />
            )}
          />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </Layout>
    </div>
  )
}

export default withRouter(App)
