import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, Container, Row, Col, UncontrolledAlert } from 'reactstrap';
import SimpleReactValidator from 'simple-react-validator';
import '../../css/login.css';

class Login extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      userLogin: '',
      emailRegister: '',
      userRegister: '',
      passwordLogin: '',
      passwordRegister: '',
      passwordConfirm: '',
      message: '',
      isAuthenticated: false,
      token: null
    };

    this.handleChangeLogin = this.handleChangeLogin.bind(this);
    this.handleChangeRegister = this.handleChangeRegister.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
  }

  componentWillMount() {
    // Create new validator object for each form.
    this.validatorRegister = new SimpleReactValidator({
      validators: {
        confirm: {
          message: 'Passwords don\'t match.',
          rule: (val, params) => {
            return val === this.state.passwordRegister;
          },
          required: true  // optional
        }
      },
      element: 
      (message, className) => <div className='text-danger'>{message}</div>,
    })

    this.validatorLogin = new SimpleReactValidator({
      element: 
      (message, className) => <div className='text-danger'>{message}</div>,
    })    
  }

  componentDidMount() {
    document.getElementById("Login").classList.add('activeTab');
  }

  handleChangeRegister(event) {
    if (this.state.message.length > 0)
      this.setState({ message: '' });
    if (event.target.id === 'emailRegister')
      this.setState({ emailRegister: event.target.value });
    else if (event.target.id === 'userRegister')
      this.setState({ userRegister: event.target.value });
    else if (event.target.id === 'passwordRegister')
      this.setState({ passwordRegister: event.target.value });
    else if (event.target.id === 'passwordConfirm')
      this.setState({ passwordConfirm: event.target.value });
  }

  handleChangeLogin(event) {
    if (this.state.message.length > 0)
      this.setState({ message: '' });
    if (event.target.id === 'userLogin')
      this.setState({ userLogin: event.target.value });
    else if (event.target.id === 'passwordLogin')
      this.setState({ passwordLogin: event.target.value });
  }

  //do post request to store a local user JSON object into the node.js server
  handleLogin(event) {
    //stop page from refreshing

    event.preventDefault();
    //get values from form
    var user = event.target.userLogin.value;
    var password = event.target.passwordLogin.value;
    if( this.validatorLogin.allValid() ){
      //do a POST request to node.js server, pointed in /routes/users.js
      fetch(`/users/auth/local/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: user,
          Password: password,
        })
      })
        .then(response => {
          if (response.status === 200) {
            response.json().then(user => localStorage.setItem('sessionID', user));
            window.location.href = "/GameDisplay";
          }
          else if (response.status === 401)
            this.setState({ message: 'Failed to login. Try again.' });
        }) //redirect
        .catch(err => console.log(err)); //catch any errors
    }
    else {
      this.validatorLogin.showMessages();
      // rerender to show messages for the first time
      this.forceUpdate();
    }
  }

  handleRegister(event) {
    //stop page from refreshing

    event.preventDefault();
    //get values from form
    var email = event.target.emailRegister.value;
    var user = event.target.userRegister.value;
    var password = event.target.passwordRegister.value;
    var passwordConfirm = event.target.passwordConfirm.value;

    if( this.validatorRegister.allValid() ){

        //do a POST request to node.js server, pointed in /routes/users.js
        fetch(`/users/auth/local/register`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: email,
            Username: user,
            Password: password,
            ConfirmPassword: passwordConfirm
          })
        })
        .then(response => {
          if (response.status === 200) {
            response.json().then(user => localStorage.setItem('sessionID', user));
            window.location.href = "/GameDisplay";
          }
          else if (response.status === 401)
            this.setState({ message: 'There is already a user registered with that email.' });
        }) //redirect
        .catch(err => console.log(err)); //catch any errors
      }
      else {
        this.validatorRegister.showMessages();
        // rerender to show messages for the first time
        this.forceUpdate();
      }
  }

  render() {
    this.validatorLogin.purgeFields();
    this.validatorRegister.purgeFields();
    return (
      <Container>
        <Row>
          <Col>
          {this.state.message.length > 0 ? <UncontrolledAlert color="danger">{this.state.message}</UncontrolledAlert> : ''}
          </Col>
        </Row>
        <Row>
          <Col>
          <h2>Login</h2>
          <hr/>
          <Form onSubmit={this.handleLogin}>
            <FormGroup>
              <Label for="userLogin">User Name</Label>
              <Input name="userLogin" id="userLogin" value={this.state.userLogin}
                onChange={this.handleChangeLogin} placeholder="email@example.com/username" />
                {this.validatorLogin.message('user name', this.state.userLogin, 'required')}
            </FormGroup>
            <FormGroup>
              <Label for="password">Password</Label>
              <Input type="password" name="passwordLogin" value={this.state.passwordLogin} 
                onChange={this.handleChangeLogin} id="passwordLogin" placeholder="password" />
              {this.validatorLogin.message('password', this.state.passwordLogin, 'required|alpha_num_space|min:8|max:20')}
            </FormGroup>
            <Button>Login</Button>
          </Form>
          {/* Change http://localhost:3001 to https://speedy-equator-238017.appspot.com for production*/}
          <Button color="primary"><a id="loginGoogle" href="https://speedy-equator-238017.appspot.com/users/auth/google">Log In with Google</a></Button>
          </Col>
          <Col>
          <h2>Register</h2>
          <hr/>
          <Form onSubmit={this.handleRegister}>
          <FormGroup>
              <Label for="emailRegister">Email</Label>
              <Input type="email" name="emailRegister" id="emailRegister" value={this.state.emailRegister}
                onChange={this.handleChangeRegister} placeholder="email@example.com" />
                {this.validatorRegister.message('email', this.state.emailRegister, 'required|email')}
            </FormGroup>
          <FormGroup>
              <Label for="userRegister">User Name</Label>
              <Input name="userRegister" id="userRegister" value={this.state.userRegister}
                onChange={this.handleChangeRegister} placeholder="username" />
                {this.validatorRegister.message('user name', this.state.userRegister, 'required|alpha_num_dash')}
            </FormGroup>
            <FormGroup>
              <Label for="password">Password</Label>
              <Input type="password" name="passwordRegister" id="passwordRegister" value={this.state.passwordRegister} 
                onChange={this.handleChangeRegister} placeholder="password" />
              {this.validatorRegister.message('password', this.state.passwordRegister, 'required|alpha_num_space|min:8|max:20')}
            </FormGroup>
            <FormGroup>
              <Label for="password">Confirm Password</Label>
              <Input type="password" name="passwordConfirm" id="passwordConfirm" value={this.state.passwordConfirm} 
                onChange={this.handleChangeRegister} placeholder="confirm password" />
              {this.validatorRegister.message('confirmation password', this.state.passwordConfirm, 'required|alpha_num_space|min:8|max:20|confirm')}
            </FormGroup>
            <Button>Register</Button>
          </Form>
          </Col>
      </Row>
    </Container>
    );
  }
}
export default Login;