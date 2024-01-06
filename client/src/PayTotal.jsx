// PayTotal.jsx
import React, { useEffect, useState } from 'react';

const PayTotal = ({ expenses }) => {
  const [totalPay, setTotalPay] = useState(0);

  useEffect(() => {
    const payTotal = expenses
      .filter((expense) => expense.status === 'Pay')
      .reduce((total, expense) => total + parseFloat(expense.amount), 0);

    setTotalPay(payTotal);
  }, [expenses]);

  return (
    <div className="total-div pay-total">
      <h4>Total Pay</h4>
      <span>Rs {totalPay.toFixed(2)}</span>
    </div>
  );
};

export default PayTotal;
