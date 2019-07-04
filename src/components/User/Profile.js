import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import '../../css/login.css';

class Login extends Component {

  constructor(props) {
    super(props);

    
    this.state = {
      user: '',
      email: '',
      NotAllowed: false,
      sessionID: null
    };

    this.handleProfileGet = this.handleProfileGet.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleRedirect = this.handleRedirect.bind(this);
  }

  async componentDidMount() {
    await this.handleProfileGet();
    
    // document.getElementById("Profile").classList.add('activeTab');
  }

      //api call to get profile
    handleProfileGet() {
          console.log("Session ID from storage: " + localStorage.getItem('sessionID'));
        fetch(`/users/api/LoggedIn?sessionID=${encodeURIComponent(localStorage.getItem('sessionID'))}`, {
            method: 'GET'
        })
        .then(response => { 
          if (response.status == 200) return response.json() 
        })
        .then(post => { 
          console.log(post);
          console.log(post.userID);
          this.setState({user: post.username, email: post.email, NotAllowed: post.NotAllowed});
        }) //get json
        .catch(err => {console.log(err); /*this.handleRedirect()*/}); //catch any errors
    }

    //logs user out, does a redirect through client
    handleLogout(event) {
        event.preventDefault();
        window.localStorage.clear();
        window.sessionStorage.clear();
        localStorage.setItem('isLogged', false);
        fetch(`/users/Logout`)
        .then(window.location.href = '/');
    }

    handleRedirect() {
      window.localStorage.clear();
      window.sessionStorage.clear();
      localStorage.setItem('isLogged', false);
      fetch(`/users/Logout`)
      .then(window.location.href = '/');
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
          <h2>{this.state.user != '' ? this.state.user : null}</h2>
          <h3>{this.state.email != '' ? this.state.email : null}</h3>
          </Col>
        </Row>
        <Row>
          <Col>
          <h3>Current session ID is: {this.state.session != null ? this.state.session : ''}</h3>
            <Button onClick={this.handleLogout} color="danger">Log out</Button>
          </Col>
        </Row>
      </Container>
    );
  }
}
export default Login;
