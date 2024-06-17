import { Col, Row } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import { dummyProductArray } from '../samples/DummyData';

const Store = () => {
  return (
    <>
      <p>Welcome to the store!</p>
      {/* <h1>Welcome to the store!</h1> */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1> Book of the day !!! </h1>
      </div>
      <Row xs={1} md={3} className="g-4">
        {dummyProductArray.map((product, index) => (
          <Col align="center" key={index}>
            <ProductCard product={product}></ProductCard>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Store;
