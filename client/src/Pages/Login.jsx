import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import speedometer from "../assets/speed-meter.png"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Login = ({onLogin}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const navigate = useNavigate()
   

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/login', {
     email,password
      });
  if(res.data.success == true){
    onLogin(res.data.token);
    localStorage.setItem("token",res.data.token)
setTimeout(()=>{
  navigate("/trips")
},1000)
    
  }    } catch (err) {
      alert('Error fetching trips',err);
    }
  };


  return (
    <div className="login-background">
      <Container fluid>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={10} md={6} lg={4}>
            <div className="login-box p-4">
              <h2 className="text-center mb-4">
                <img src ={speedometer} style={{width:"100px",height:"100px"}} />
              </h2>
           
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="dark" className="w-100">
                  Sign In
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
