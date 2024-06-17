import { Button, Container, Navbar, Modal, ModalBody } from 'react-bootstrap';
import { useState } from 'react';

const NavBarComponent = () => {
  const [show, setShow] = useState(false);
  const handleModalClose = () => setShow(false);
  const handleModalShow = () => setShow(true);

  return (
    <>
      <Navbar expand="sm">
        <Navbar.Brand href="/">Cricket BookStore</Navbar.Brand>
        <Navbar.Toggle />
        {/* <Navbar.Collapse className="justify-content-end">
          <Button onClick={handleModalShow}>Cart 0 items</Button>
        </Navbar.Collapse> */}
      </Navbar>
      <Modal show={show} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Shopping Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>THis is modal body</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NavBarComponent;
