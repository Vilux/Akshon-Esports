import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Logo from '../img/akshonlogo.jpg';
import '../css/home.css';

class Home extends Component {
    constructor(props) {
        super(props);
      }
    
  render() {
    return (
    <Container>
      <Row>
        <Col>
          <img src={Logo} id="akshonlogo" alt="Logo of Akhson Esports"></img>
        </Col>
      </Row>
      </Container>
    );
  }
}
export default Home;
