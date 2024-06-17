import { Button, Card } from 'react-bootstrap';

const ProductCard = (props: any) => {
  const product = props.product;

  return (
    <Card>
      <Card.Body>
        <Card.Title>{product.title}</Card.Title>
        <Card.Text>{product.price} VNĐ</Card.Text>
        <Button variant="primary">Add to cart</Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
