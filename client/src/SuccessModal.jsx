import React from 'react';
import { Modal } from 'react-bootstrap'; // Make sure to install 'react-bootstrap' if you haven't already

const SuccessModal = ({ isOpen, message, onDismiss }) => {
  return (
    <Modal show={isOpen} onHide={onDismiss} backdrop='static' keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Success</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='text-success text-center'>
          <i className='fa-solid fa-circle-check'></i>
          <p className='px-4 pb-0 mb-1'>{message}</p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SuccessModal;
