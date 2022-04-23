import React, { Component } from 'react';

//引入路由
import {Route, Switch} from 'react-router-dom';

//引入store和Provider
import store from "./store";
import { Provider } from 'react-redux';

//引入样式
import 'antd/dist/antd.css';
import './style';

//引入组件
import Login from "./Login";
import Users from "./Users";

function App() {
  return (
    <Provider store={store}>
      <Switch>
        <Route path='/users' component={Users} />
        <Route exact path='/' component={Login} />
      </Switch>
    </Provider>
  );
}

export default App;
