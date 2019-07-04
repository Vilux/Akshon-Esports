import React, { Component } from 'react';
import { Container } from 'reactstrap';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import NotFound from './components/NotFound';
import Login from './components/User/Login';
import Profile from './components/User/Profile';
import Home from './components/Home';
import GameDisplay from './components/GameDisplay';
import Admin from './components/Admin/Admin';
import Leaderboard from './components/Leaderboard';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: null,
      isAdmin: false,
      key: '',
      roleID: ""
    };

    this.setActiveKey = this.setActiveKey.bind(this);
    this.handleSessionSet = this.handleSessionSet.bind(this);
    this.handleProfileGet = this.handleProfileGet.bind(this);
  }

  async componentDidMount() {
    if (localStorage.getItem('sessionID') === null) {
      let [a] = await Promise.all([this.handleSessionSet()]);
    }
    else {
      this.handleProfileGet();
    }
  }

  handleSessionSet() {
    fetch(`/users/api/GetUser`)
      .then(response => {
        if (response.status === 200) return response.json()
        else throw Error(response.status)
      })
      .then(item => { localStorage.setItem('sessionID', item) })
      .then(this.handleProfileGet())
      .catch(function (err) {
      })
  }

  setActiveKey(e) {
    this.setState({ key: e });
  }

  handleProfileGet() {
    fetch(`/users/api/LoggedIn?sessionID=${encodeURIComponent(localStorage.getItem('sessionID'))}`, {
      method: 'GET'
    })
      .then(response => {
        if (response.status === 200) return response.json()
      })
      .then(post => {
        this.setState({ roleID: post.roleID });
      }) //get json
      .catch(err => { console.log(err); }); //catch any errors
  }

  handleLogout(event) {
    event.preventDefault();
    fetch(`/users/Logout`)
      .then(
        localStorage.clear(),
        sessionStorage.clear(),
        setTimeout(
        function() {
            window.location.href = "/";
        }
        .bind(this),
        100
    ));
  }

  render() {
    return (
      <Router>
        <nav className="navbar navbar-expand-md navbar-light justify-content-between main-nav">
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse text-center" id="navbarNav">
            <ul className="navbar-nav mx-auto flex-nowrap">
              <li id="GameDisplay" className="nav-item"><a className="nav-link" href="/GameDisplay">Games</a></li>
              <li id="Leaderboard" className="nav-item"><a className="nav-link" href="/Leaderboard">Leaderboard</a></li>
              <li className="nav-item" id="Login" style={{ display: this.state.roleID != "" ? 'none' : 'block' }}><a className="nav-link" href="/User/Login">Login</a></li>
              {/* <li className="nav-item" id="Profile" style={{ display: this.state.roleID != "" ? 'block' : 'none' }}><a className="nav-link" href="/Profile">Profile</a></li> */}
              <li className="nav-item" id="Logout" style={{ display: this.state.roleID != "" ? 'block' : 'none' }}><a className="nav-link" href="*" onClick={this.handleLogout}>Logout</a></li>
              <li className="nav-item" id="Admin" style={{ display: this.state.roleID != 2 ? 'none' : 'block' }}><a className="nav-link" href="/Admin">Admin</a></li>
            </ul>
          </div>
        </nav>
        <Container>
          {/* Our router goes here */}
          <Switch>
            {/* <Route exact path="/GameDisplay" component={GameDisplay} /> */}
            <Route exact path="/GameDisplay" component={GameDisplay} />
            <Route exact path={'/Profile'} component={Profile} />
            <Route exact path="/User/Login" component={Login} />
            {this.state.roleID === 2 &&
              <Route exact path="/Admin" component={Admin} />}
            <Route exact path="/Leaderboard" component={Leaderboard} />
            <Route exact path="/" component={Home} />

            {/* Does a redirect. */}
            <Redirect from="/return" to="/Login" />
            <Redirect from="/users/return" to="/" />

            {/* Shows an error page. */}
            <Route path="*" component={NotFound} />
          </Switch>
        </Container>
      </Router>
    );
  }
}

export default App;
