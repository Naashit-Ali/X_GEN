import React, { useState, useEffect } from 'react';
import { MDBContainer } from 'mdb-react-ui-kit';
import './Home.css';
import * as XLSX from 'xlsx';
import logo from './assets/xgen.png';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';



function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [categories, setCategories] = useState(['Office', 'Kitchen']);
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [nextItemID, setNextItemID] = useState(1001);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedExpense, setEditedExpense] = useState({});
  const [editFormData, setEditFormData] = useState({
    itemName: '',
    userName: '',
    quantity: '',
    date: '',
    amount: '',
  });
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();


  
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const getFilteredExpenses = () => {
    const currentDate = new Date();

    switch (filterType) {
      case 'monthly':
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return expenses.filter(
          (expense) => new Date(expense.date) >= startOfMonth && new Date(expense.date) <= currentDate
        );

      case 'weekly':
        const startOfWeek = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - currentDate.getDay()
        );
        return expenses.filter(
          (expense) => new Date(expense.date) >= startOfWeek && new Date(expense.date) <= currentDate
        );

      case 'yearly':
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        return expenses.filter(
          (expense) => new Date(expense.date) >= startOfYear && new Date(expense.date) <= currentDate
        );

      default:
        return expenses; // 'all' or invalid filter type, return all expenses
    }
  };


  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredExpenses = expenses.filter((expense) =>
    expense.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchExpenses();
    fetchNextItemID();
    calculateTotalAmount(); 
    const token = Cookies.get('token'); // Replace 'your_token_key_here' with your actual token key

    if (!token) {
      // Redirect to the login page if the token is not present
      navigate('/home');
    }// Calculate total amount when the component mounts or expenses change
  }, [][expenses]);

  const fetchNextItemID = async () => {
    try {
      const response = await fetch('https://x-genback.vercel.app/api/expenses/nextItemID');
      const data = await response.json();
      setNextItemID(data.nextItemID);
    } catch (error) {
      console.error('Error fetching next item ID:', error);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setCustomCategory('');
    setIsAddingCustomCategory(false);
    resetFormValidation();
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

  const generateUniqueItemID = () => {
    const existingItemIDs = new Set(expenses.map((expense) => expense.itemID));
    let newID = nextItemID;

    while (existingItemIDs.has(newID)) {
      newID += 1;
    }

    return newID;
  };

  const handleAddExpense = async () => {
    // Generate a unique itemID
    const itemID = nextItemID || generateUniqueItemID();
    setNextItemID(itemID + 1);
  
    const itemName = document.getElementById('itemName').value;
    const userName = document.getElementById('userName').value;
    const quantity = document.getElementById('quantity').value;
    const date = document.getElementById('date').value;
    const amount = document.getElementById('amount').value;
  
    // Basic field validations
    const validationFields = [
      { field: 'itemName', value: itemName, label: 'Item Name' },
      { field: 'userName', value: userName, label: 'User Name' },
      { field: 'quantity', value: quantity, label: 'Quantity' },
      { field: 'date', value: date, label: 'Date' },
      { field: 'amount', value: amount, label: 'Amount' },
      { field: 'category', value: category, label: 'Category' },
    ];
  
    let isValid = true;
  
    validationFields.forEach((field) => {
      const element = document.getElementById(field.field);
  
      if (!field.value) {
        isValid = false;
        element.style.borderColor = 'red';
        const errorLabel = document.createElement('div');
        errorLabel.className = 'error-label';
        errorLabel.innerText = `The ${field.label} must be fulfilled.`;
  
        // Check if the error label already exists before adding it
        if (!element.parentElement.querySelector('.error-label')) {
          element.parentElement.appendChild(errorLabel);
        }
      } else {
        element.style.borderColor = ''; // Reset border color
        const errorLabel = element.parentElement.querySelector('.error-label');
        if (errorLabel) {
          errorLabel.remove(); // Remove error label if it exists
        }
      }
    });
  
    if (!isValid) {
      return;
    }
  
    try {
      const response = await fetch('https://x-genback.vercel.app/api/expenses', {
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
        calculateTotalAmount(); // Update total amount after adding expense
        toggleModal();
        clearModalFields();
      } else {
        console.error('Failed to add expense:', response.status);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch('https://x-genback.vercel.app/api/expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const response = await fetch(`https://x-genback.vercel.app/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        const updatedExpenses = expenses.filter((expense) => expense._id !== expenseId);
        setExpenses(updatedExpenses);
        calculateTotalAmount(); // Update total amount after deleting expense
      } else {
        console.error('Failed to delete expense:', response.status);
      }
    } catch (error) {
      console.error('Error deleting expense:', error.message);
    }
  };
  
  const calculateTotalAmount = () => {
    const total = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
    setTotalAmount(total);
  };
  
  const populateEditForm = (expense) => {
    // Populate the state with the expense data
    setEditFormData({
      itemName: expense.itemName,
      userName: expense.userName,
      quantity: expense.quantity,
      date: expense.date,
      amount: expense.amount,
    });

    // Set the category in the state
    setCategory(expense.category);
  };


  const handleExportToExcel = () => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
  
    const fileName = `expenses_${formattedDate}.xlsx`;
  
    const ws = XLSX.utils.json_to_sheet(expenses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, fileName);
  };
  

  const clearModalFields = () => {
    document.getElementById('itemName').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('date').value = '';
    document.getElementById('amount').value = '';
    setCategory('');
    setCustomCategory('');
    setIsAddingCustomCategory(false);
    resetFormValidation();
  };


  const openEditModal = (expense) => {
    setEditedExpense(expense);
    setIsEditModalOpen(true);
    populateEditForm(expense);
  };

  const handleEditModalSubmit = async () => {
    try {
      const _id = editedExpense._id;

      // Use the state values for form data
      const { itemName, userName, quantity, date, amount } = editFormData;

      // Validation
      const validationFields = [
        { field: 'itemName', value: itemName, label: 'Item Name' },
        { field: 'userName', value: userName, label: 'User Name' },
        { field: 'quantity', value: quantity, label: 'Quantity' },
        { field: 'date', value: date, label: 'Date' },
        { field: 'amount', value: amount, label: 'Amount' },
        { field: 'category', value: category, label: 'Category' },
      ];

      let isValid = true;

      validationFields.forEach((field) => {
        const element = document.getElementById(field.field);

        if (!field.value) {
          isValid = false;
          element.style.borderColor = 'red';
          const errorLabel = document.createElement('div');
          errorLabel.className = 'error-label';
          errorLabel.innerText = `The ${field.label} must be fulfilled.`;

          if (!element.parentElement.querySelector('.error-label')) {
            element.parentElement.appendChild(errorLabel);
          }
        } else {
          element.style.borderColor = '';
          const errorLabel = element.parentElement.querySelector('.error-label');
          if (errorLabel) {
            errorLabel.remove();
          }
        }
      });

      if (!isValid) {
        return;
      }

      const response = await fetch(`https://x-genback.vercel.app/api/expenses/${_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName,
          userName,
          quantity,
          date,
          amount,
          category,
        }),
      });

      if (response.ok) {
        const updatedExpense = await response.json();
        const updatedExpenses = expenses.map((exp) => (exp._id === _id ? updatedExpense : exp));
        setExpenses(updatedExpenses);
        calculateTotalAmount();
        setIsEditModalOpen(false);
        setEditedExpense({});
        clearModalFields();
      } else {
        console.error('Failed to edit expense:', response.status);
      }
    } catch (error) {
      console.error('Error editing expense:', error);
    }
  };

  const handleEditFormChange = (e) => {
    const { id, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  
  return (
    <MDBContainer fluid className='p-0 background overflow-hidden vh-100'>
      <div className='sidebar'>
        <a href='#'>
          <i className='fa fa-fw fa-wrench'></i> Expenses
        </a>
      </div>

      <div className='div2'>
      
        <h1>Expenses Report</h1>
          <input
            type='text'
            placeholder='Search by Item Name'
            value={searchTerm}
            onChange={handleSearch}
            className='form-control'
            style={{ float: 'right', width: '400px', marginTop: '20px', border: '2px solid #000' }}
          />
          <button
        type='button'
        className='btn btn-success'
        onClick={handleExportToExcel}
        style={{ float: 'right', marginTop: '20px', marginRight: '20px' }}
      >
        Export to Excel
      </button>

      

        <button
          type='button'
          className='btn btn-primary'
          onClick={toggleModal}
          style={{ float: 'left', marginLeft: '20px', marginTop: '20px' }}
        >
          Add New Expense
        </button>

        <select
          className='form-select'
          value={filterType}
          onChange={handleFilterChange}
          style={{ float: 'left', marginLeft: '40px', marginTop: '20px', width: '20%' }}
        >
          <option value='all'>All</option>
          <option value='monthly'>Monthly</option>
          <option value='weekly'>Weekly</option>
          <option value='yearly'>Yearly</option>
        </select>

        <div className='modal' id='myModal' style={{ display: isModalOpen ? 'block' : 'none', color: 'black' }}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h4 className='modal-title'>Add New Expense</h4>
                <button type='button' className='btn-close' onClick={toggleModal}></button>
              </div>
              <div className='modal-body'>
                <div className='mb-3 row'>
                  <div className='col'>
                    <label htmlFor='itemName' className='form-label'>
                      Item Name
                    </label>
                    <input type='text' className='form-control' id='itemName' />
                  </div>
                  <div className='col'>
                    <label htmlFor='userName' className='form-label'>
                      User Name
                    </label>
                    <input type='text' className='form-control' id='userName' />
                  </div>
                </div>
                <div className='mb-3 row'>
                  <div className='col'>
                    <label htmlFor='quantity' className='form-label'>
                      Quantity
                    </label>
                    <input type='text' className='form-control' id='quantity' />
                  </div>
                  <div className='col'>
                    <label htmlFor='date' className='form-label'>
                      Date
                    </label>
                    <input type='date' className='form-control' id='date' />
                  </div>
                </div>
                <div className='mb-3 row'>
                  <div className='col'>
                    <label htmlFor='amount' className='form-label'>
                      Amount
                    </label>
                    <input type='text' className='form-control' id='amount' />
                  </div>
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
              <button type='button' className='btn btn-secondary' onClick={clearModalFields}>
                Clear
              </button>
              <button type='button' className='btn btn-primary' onClick={handleAddExpense}>
                Submit
              </button>
            </div>
            </div>
          </div>
        </div>


        <div className='modal' id='editModal' style={{ display: isEditModalOpen ? 'block' : 'none', color: 'black' }}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h4 className='modal-title'>Edit Expense</h4>
              <button type='button' className='btn-close' onClick={() => setIsEditModalOpen(false)}></button>
            </div>
            <div className='modal-body'>
  <div className='mb-3 row'>
    <div className='col'>
      <label htmlFor='itemName' className='form-label'>
        Item Name
      </label>
      <input
        type='text'
        className='form-control'
        id='itemName'
        value={editFormData.itemName}
        onChange={handleEditFormChange}
      />
    </div>
                  <div className='col'>
                    <label htmlFor='userName' className='form-label'>
                      User Name
                    </label>
                    <input
                    type='text'
                    className='form-control'
                    id='userName'
                    value={editFormData.userName}
                    onChange={handleEditFormChange}
                  />
                  </div>
                </div>
                <div className='mb-3 row'>
                  <div className='col'>
                    <label htmlFor='quantity' className='form-label'>
                      Quantity
                    </label>
                    <input
                    type='text'
                    className='form-control'
                    id='quantity'
                    value={editFormData.quantity}
                    onChange={handleEditFormChange}
                  />
                  </div>
                  <div className='col'>
                    <label htmlFor='date' className='form-label'>
                      Date
                    </label>
                    <input
                    type='date'
                    className='form-control'
                    id='date'
                    value={editFormData.date}
                    onChange={handleEditFormChange}
                  />
                  </div>
                </div>
                <div className='mb-3 row'>
                  <div className='col'>
                    <label htmlFor='amount' className='form-label'>
                      Amount
                    </label>
                    <input
                    type='text'
                    className='form-control'
                    id='amount'
                    value={editFormData.amount}
                    onChange={handleEditFormChange}
                  />
                  </div>
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
              
              {/* Edit modal form fields */}
              {/* ... Copy and modify the form fields for editing ... */}
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-danger' onClick={() => setIsEditModalOpen(false)}>
                Close
              </button>
              <button type='button' className='btn btn-primary' onClick={handleEditModalSubmit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

        <div className='table_div'>
      <div className='table-container'>
      <table className='table table-white table-hover'>
              <thead>
                <tr>
                  <th>S.No</th>
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
                {getFilteredExpenses().map((expense, index) => (
                  <tr key={expense._id}>
                    <td>{index + 1}</td>
                    <td>{expense.itemName}</td>
                    <td>{expense.userName}</td>
                    <td>{expense.category}</td>
                    <td>{expense.date}</td>
                    <td>{expense.amount}</td>
                    <td>{expense.quantity}</td>
                    <td className='action-buttons'>
                      <button
                        className='btn btn-primary'
                        onClick={() => openEditModal(expense)}
                      >
                        Edit
                      </button>
                      <button
                        className='btn btn-danger'
                        onClick={() => handleDeleteExpense(expense._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
        </table>
      </div>

      <div className='total-row'>
        <table className='table table-dark table-hover'>
          <tfoot>
            <tr>
              <td colSpan='5'></td>
              <td>Total:</td>
              <td>{totalAmount.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
        </div>
      </div>
    </MDBContainer>
  );
}

export default Home;
