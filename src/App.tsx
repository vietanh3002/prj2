import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBarComponent from './components/NavBar';
import { Container } from 'react-bootstrap';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cancel from './pages/Cancel';
import Success from './pages/Success';
import Store from './pages/Store';
import Graph from './pages/Graph';
import { dummyGraphData3 } from './samples/DummyData';

const App = () => {
  return (
    <Container>
      <NavBarComponent></NavBarComponent>
      <BrowserRouter>
        <Routes>
          <Route index element={<Graph />}></Route>
          <Route path="store" element={<Store />}></Route>
          <Route path="success" element={<Success />} />
          <Route path="cancel" element={<Cancel />} />
        </Routes>
      </BrowserRouter>
    </Container>
  );
};

export default App;
