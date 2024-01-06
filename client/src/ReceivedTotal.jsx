// ReceivedTotal.jsx
import React, { useEffect, useState } from 'react';

const ReceivedTotal = ({ expenses }) => {
  const [totalReceived, setTotalReceived] = useState(0);

  useEffect(() => {
    const receivedTotal = expenses
      .filter((expense) => expense.status === 'Received')
      .reduce((total, expense) => total + parseFloat(expense.amount), 0);

    setTotalReceived(receivedTotal);
  }, [expenses]);

  return (
    <div className="total-div received-total">
      <h4>Total Received</h4>
      <span>Rs {totalReceived.toFixed(2)}</span>
    </div>
  );
};

export default ReceivedTotal;
