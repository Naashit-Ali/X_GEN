// BalanceTotal.jsx
import React, { useEffect, useState } from 'react';

const BalanceTotal = ({ totalReceived, totalPay }) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const calculatedBalance = totalReceived - totalPay;
    setBalance(calculatedBalance);
  }, [totalReceived, totalPay]);

  return (
    <div className="total-div balance-total">
      <h4>Balance</h4>
      <span>Rs {balance.toFixed(2)}</span>
    </div>
  );
};

export default BalanceTotal;
