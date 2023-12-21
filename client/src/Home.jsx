import React, { useState, useEffect } from 'react';
import { MDBContainer } from 'mdb-react-ui-kit';
import './Home.css';

function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [categories, setCategories] = useState(['Office', 'Kitchen']);
    const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [nextItemID, setNextItemID] = useState(1001); // Initialize with the starting value
  
    useEffect(() => {
      fetchExpenses();
    }, []);
  
    const toggleModal = () => {
      setIsModalOpen(!isModalOpen);
      setCustomCategory('');
      setIsAddingCustomCategory(false);
    };
  
    const handleCategoryChange = (e) => {
      setCategory(e.target.value);
    };
  
    const handleCustomCategoryChange = (e) => {
      setCustomCategory(e.target.value);
    };
  
    const handleAddCustomCategory = () => {
      if (customCategory.trim() !== '' && !categories.includes(customCategory)) {
        setCategories([...categories, customCategory]);
        setCategory(customCategory);
        setCustomCategory('');
        setIsAddingCustomCategory(false);
      }
    };
  
    const handleConvertToTextField = () => {
      setIsAddingCustomCategory(true);
    };
  
    const handleAddExpense = async () => {
    const itemName = document.getElementById('itemName').value;
    const userName = document.getElementById('userName').value;
    const quantity = document.getElementById('quantity').value;
    const date = document.getElementById('date').value;
    const amount = document.getElementById('amount').value;

    // Increment itemID and use it
    const itemID = nextItemID;
    setNextItemID(nextItemID + 1);

    // Basic field validations
    if (!itemName || !userName || !quantity || !date || !amount || !category) {
      alert('All fields must be filled.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemID,
          itemName,
          userName,
          quantity,
          date,
          amount,
          category,
        }),
      });

      if (response.ok) {
        const addedExpense = await response.json();
        setExpenses((prevExpenses) => [...prevExpenses, addedExpense]);
        toggleModal(); // Close the modal after successful submission
      } else {
        console.error('Failed to add expense:', response.status);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };
  
    const fetchExpenses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/expenses');
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };
  

  return (
    <MDBContainer fluid className='p-0 background-radial-gradient overflow-hidden vh-100'>
      <div className='sidebar'>
        <a href='#home'>
          <i className='fa fa-fw fa-home'></i> Home
        </a>
        <a href='/expenses'>
          <i className='fa fa-fw fa-wrench'></i> Expenses
        </a>
        <a href='#clients'>
          <i className='fa fa-fw fa-user'></i> Vendors
        </a>
        <a href='#contact'>
          <i className='fa fa-fw fa-envelope'></i> User
        </a>
      </div>

      <div className='div2'>
        <h1>Expenses Report</h1>
        <button
          type='button'
          className='btn btn-primary'
          onClick={toggleModal}
          style={{ float: 'left', marginLeft: '20px', marginTop: '20px' }}
        >
          Add New Expense
        </button>

        <div className='modal' id='myModal' style={{ display: isModalOpen ? 'block' : 'none', color: 'black' }}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h4 className='modal-title'>Modal Heading</h4>
                <button type='button' className='btn-close' onClick={toggleModal}></button>
              </div>
              <div className='modal-body'>
                <div className='mb-3 row'>
                  <div className='col'>
                    <label htmlFor='itemID' className='form-label'>
                      Item ID
                    </label>
                    <input type='text' className='form-control' id='itemID' />
                  </div>
                  <div className='col'>
                    <label htmlFor='itemName' className='form-label'>
                      Item Name
                    </label>
                    <input type='text' className='form-control' id='itemName' />
                  </div>
                </div>
                <div className='mb-3 row'>
                  <div className='col'>
                    <label htmlFor='userName' className='form-label'>
                      User Name
                    </label>
                    <input type='text' className='form-control' id='userName' />
                  </div>
                  <div className='col'>
                    <label htmlFor='quantity' className='form-label'>
                      Quantity
                    </label>
                    <input type='text' className='form-control' id='quantity' />
                  </div>
                </div>
                <div className='mb-3 row'>
                  <div className='col'>
                    <label htmlFor='date' className='form-label'>
                      Date
                    </label>
                    <input type='date' className='form-control' id='date' />
                  </div>
                  <div className='col'>
                    <label htmlFor='amount' className='form-label'>
                      Amount
                    </label>
                    <input type='text' className='form-control' id='amount' />
                  </div>
                </div>
                <div className='mb-3 row'>
                  <div className='col-6'>
                    <label htmlFor='category' className='form-label'>
                      Category
                    </label>
                    {isAddingCustomCategory ? (
                      <div className='input-group'>
                        <input
                          type='text'
                          className='form-control'
                          placeholder='Enter custom category'
                          value={customCategory}
                          onChange={handleCustomCategoryChange}
                        />
                        <button
                          className='btn btn-outline-secondary'
                          type='button'
                          onClick={handleAddCustomCategory}
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <div className='input-group'>
                        <select
                          className='form-select'
                          id='category'
                          value={category}
                          onChange={handleCategoryChange}
                        >
                          <option value='' disabled>
                            Select category
                          </option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          className='btn btn-outline-secondary'
                          type='button'
                          onClick={handleConvertToTextField}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* End of form fields */}
              </div>

              <div className='modal-footer'>
                <button type='button' className='btn btn-danger' onClick={toggleModal}>
                  Close
                </button>
                <button type='button' className='btn btn-primary' onClick={handleAddExpense}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='table_div'>
          <table className='table table-white table-hover'>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Item Name</th>
                <th>User Name</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{expense.itemID}</td>
                  <td>{expense.itemName}</td>
                  <td>{expense.userName}</td>
                  <td>{expense.category}</td>
                  <td>{expense.date}</td>
                  <td>{expense.amount}</td>
                  <td>{expense.quantity}</td>
                  <td className='action-buttons'>
                    <a href='' className='btn btn-primary'>
                      Edit
                    </a>
                    <a href='' className='btn btn-danger'>
                      Delete
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MDBContainer>
  );
}

export default Home;
