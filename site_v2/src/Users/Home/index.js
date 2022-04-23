import React, {Component} from 'react';
import { connect } from "react-redux";

import { actionCreators } from "../../Login/store";
import Background from "../../static/lighttheme2.jpg";

class Home extends Component {
  componentDidMount() {
    this.props.getLoginState();
  }

  render() {
    const { username } = this.props;
    return (
      <div style={{height: "100%", backgroundImage: `url(${Background})`, backgroundSize: '100%,100%', display: 'flex', flexFlow: "column", justifyContent: "center", alignItems: "center"}}>
        <div style={{fontSize: "500%", color: "white"}}>
          欢迎登录Petroleum语料标注系统，
        </div>
        <div style={{fontSize: "500%", color: "white"}}>
          {username}。
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    username: state.login.username,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getLoginState(){
      dispatch(actionCreators.getLoginState());
    },
  }
};

export default connect(mapStateToProps,mapDispatchToProps)(Home);
