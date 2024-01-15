import React, { useState, useEffect } from 'react';
import { MDBContainer } from 'mdb-react-ui-kit';
import './Home.css';
import * as XLSX from 'xlsx';
import logo from './assets/xgen.png';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import ReceivedTotal from './ReceivedTotal';
import PayTotal from './PayTotal';
import BalanceTotal from './BalanceTotal';
import SuccessModal from './SuccessModal';
import { Modal, Button } from 'react-bootstrap';



function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [categories, setCategories] = useState(['Office', 'Kitchen']);
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [nextItemID, setNextItemID] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedExpense, setEditedExpense] = useState({});
  const [editStatus, setEditStatus] = useState('');
  const [sortType, setSortType] = useState('recently-added');
  const [editFormData, setEditFormData] = useState({
    itemName: '',
    userName: '',
    quantity: '',
    date: '',
    amount: '',
    status: '',
    description: '',
  });
  const [status, setStatus] = useState(''); // Add this line
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [users, setUsers] = useState(['User', 'Admin', 'Ali']);
  const [isAddingCustomUser, setIsAddingCustomUser] = useState(false);
  const [customUser, setCustomUser] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: '',
  });
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDeleteExpense = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setShowModal(true);
  };

  

  const toggleSuccessModal = (message) => {
    setSuccessMessage(message);
    setIsSuccessModalOpen(!isSuccessModalOpen);
    // Automatically close the modal after 1 second
    setTimeout(() => setIsSuccessModalOpen(false), 2000);
  };

  const capitalizeWords = (str) => {
    if (!str || typeof str !== 'string') {
      return ''; // handle undefined or non-string input
    }
  
    return str
      .split(' ')
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
      .join(' ');
  };
  

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortType(e.target.value);
  };  

  const getFilteredExpenses = () => {
    const currentDate = new Date();
  
    const filteredBySearch = expenses.filter((expense) =>
      Object.values(expense).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  
    const filteredByStatus = statusFilter
  ? filteredBySearch.filter((expense) => expense.status === statusFilter)
  : filteredBySearch;

let sortedExpenses = filteredByStatus;


switch (sortType) {
  case 'recently-added':
    sortedExpenses = sortedExpenses.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : 0;
      const dateB = b.date ? new Date(b.date) : 0;
      return dateB - dateA;
    });
    break;
  case 'a-z':
    sortedExpenses = sortedExpenses.sort((a, b) => (a.itemName || '').localeCompare(b.itemName || ''));
    break;
  case 'z-a':
    sortedExpenses = sortedExpenses.sort((a, b) => (b.itemName || '').localeCompare(a.itemName || ''));
    break;
  case 'ascending':
    sortedExpenses = sortedExpenses.sort((a, b) => (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0));
    break;
  case 'descending':
    sortedExpenses = sortedExpenses.sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0));
    break;
  default:
    break;
}

switch (filterType) {
  case 'daily':
    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    return sortedExpenses.filter(
      (expense) => (expense.date ? new Date(expense.date) : 0) >= startOfDay &&
        (expense.date ? new Date(expense.date) : 0) <= currentDate
    );
  case 'monthly':
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return sortedExpenses.filter(
      (expense) => (expense.date ? new Date(expense.date) : 0) >= startOfMonth &&
        (expense.date ? new Date(expense.date) : 0) <= currentDate
    );

  case 'weekly':
    const startOfWeek = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - currentDate.getDay()
    );
    return sortedExpenses.filter(
      (expense) => (expense.date ? new Date(expense.date) : 0) >= startOfWeek &&
        (expense.date ? new Date(expense.date) : 0) <= currentDate
    );

  case 'yearly':
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    return sortedExpenses.filter(
      (expense) => (expense.date ? new Date(expense.date) : 0) >= startOfYear &&
        (expense.date ? new Date(expense.date) : 0) <= currentDate
    );

  default:
    return sortedExpenses; // 'all' or invalid filter type, return all expenses
}

  };
  
  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
     // Disable custom user input
  };

  const handleAddCustomUser = () => {
    if (customUser && !users.includes(customUser)) {
      setUsers((prevUsers) => [...prevUsers, customUser]);
      setSelectedUser(customUser);
      setCustomUser('');
      setIsAddingCustomUser(false);
    }
  };
  
  const handleConvertToUserDropdown = () => {
    setIsAddingCustomUser(false);
    setCustomUser('');
  };

  const handleSearch = (e) => {
  setSearchTerm(e.target.value);
  const filteredExpenses = expenses.filter((expense) =>
    Object.values(expense).some(
      (value) =>
        typeof value === 'string' &&
        value.toLowerCase().includes(e.target.value.toLowerCase())
    )
  );
  setDisplayedExpenses(filteredExpenses);
};

  useEffect(() => {
    fetchExpenses();
    fetchNextItemID();
    calculateTotalAmount(); 
    const token = Cookies.get('token'); // Replace 'your_token_key_here' with your actual token key

    if (!token) {
      // Redirect to the login page if the token is not present
      navigate('/home');
    }// Calculate total amount when the component mounts or expenses change
  }, []);

  const fetchNextItemID = async () => {
    try {
      const response = await fetch('https://x-gen-backend.vercel.app/api/expenses/nextItemID');
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

  const handleCustomUserChange = (e) => {
    setCustomUser(e.target.value);
  };

  const handleAddExpense = async () => {
    // Generate a unique itemID
    const itemID = nextItemID || generateUniqueItemID();
    setNextItemID(itemID + 1);
  
    const itemName = document.getElementById('itemName').value;
    const userName = document.getElementById('userName').value;
    const quantityInput = document.getElementById('quantity');
    const date = document.getElementById('date').value;
    const amountInput = document.getElementById('amount');
    const status = document.getElementById('status').value;
    const description = document.getElementById('description').value;
  
    const quantityValue = quantityInput.value.replace(/[^\d]/g, '');
    const quantity = parseInt(quantityValue, 10);
  
    // Validate and format amount
    const amountValue = amountInput.value.replace(/[^\d]/g, '');
    const amount = parseInt(amountValue, 10);
  
    
    // Basic field validations
    const validationFields = [
      { field: 'itemName', value: itemName, label: 'Item Name' },
      { field: 'quantity', value: quantity, label: 'Quantity' },
      { field: 'date', value: date, label: 'Date' },
      { field: 'amount', value: amount, label: 'Amount' },
      { field: 'status', value: status, label: 'Status' },
      { field: 'description', value: description, label: 'Description' },
    ];
  
    // Validation for the category dropdown
    const categoryField = { field: 'category', value: category, label: 'Category' };
    validationFields.push(categoryField);
  
    // Validation for the username dropdown
    const userNameField = { field: 'userName', value: userName, label: 'User Name' };
    validationFields.push(userNameField);
    
    
    let isValid = true;
  
    validationFields.forEach((field) => {
      const element = document.getElementById(field.field);
  
      if (!field.value) {
        isValid = false;
        element.style.borderColor = 'red';
        const errorLabel = document.createElement('div');
        errorLabel.className = 'error-label';
        errorLabel.innerText = `The ${field.label} must be fulfilled.`;
        errorLabel.style.color = 'red'; // Set red color
  
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
      const response = await fetch('https://x-gen-backend.vercel.app/api/expenses', {
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
          status,
          description,
        }),
      });
  
      if (response.ok) {
        const addedExpense = await response.json();
        setExpenses((prevExpenses) => [...prevExpenses, addedExpense]);
        calculateTotalAmount(); // Update total amount after adding expense
        toggleSuccessModal('Expense added successfully'); // Show success modal
        clearModalFields();
        toggleModal(); // Close the modal
      } else {
        console.error('Failed to add expense:', response.status);
      }
    } catch (error) {
      console.error('Error adding expense:', error.message);
    }
  };
  

  const fetchExpenses = async () => {
    try {
      const response = await fetch('https://x-gen-backend.vercel.app/api/expenses');
  
      if (!response.ok) {
        throw new Error(`Error fetching expenses: ${response.status}`);
      }
  
      const data = await response.json();
      setExpenses(data);
      calculateTotalAmount();
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };
  
  

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`https://x-gen-backend.vercel.app/api/expenses/${selectedExpenseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedExpenses = expenses.filter((expense) => expense._id !== selectedExpenseId);
        setExpenses(updatedExpenses);
        calculateTotalAmount();
        toggleSuccessModal('Expense deleted successfully');
      } else {
        console.error('Failed to delete expense:', response.status);
      }
    } catch (error) {
      console.error('Error deleting expense:', error.message);
    } finally {
      setShowModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
  };
  
  const calculateTotalAmount = () => {
    const total = getFilteredExpenses().reduce((acc, expense) => {
      if ((statusFilter === '' || expense.status === statusFilter) && expense.status === 'Received') {
        return acc + parseFloat(expense.amount);
      } else if ((statusFilter === '' || expense.status === statusFilter) && expense.status === 'Pay') {
        return acc - parseFloat(expense.amount);
      }
      return acc;
    }, 0);
    setTotalAmount(total);
  };
  
  
  const populateEditForm = (expense) => {
    // Populate the state with the expense data
    setEditFormData({
      itemName: expense.itemName,
      userName: expense.userName,
      quantity: expense.quantity,
      date: expense.date,
      description: expense.description,
      amount: expense.amount,
      status:expense.status,
    });

    // Set the category in the state
    setCategory(expense.category);
    setStatus(expense.status);
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
    document.getElementById('status').value = ''; // Set the selectedIndex to 0 to reset the dropdown
    document.getElementById('description').value = '';
    setStatus('');
    setSelectedUser('');
    setCustomUser('');
    setCategory('');
    setCustomCategory('');
    setIsAddingCustomCategory(false);
  
    // Reset description in the state
    setEditFormData({ ...editFormData, description: '' });
  };
  
  const openEditModal = (expense) => {
    setEditedExpense(expense);
    setIsEditModalOpen(true);
    populateEditForm(expense);
    setEditStatus(expense.status); // Set editStatus to the initial status of the expense
  };
  

  const handleEditModalSubmit = async () => {
    try {
      const _id = editedExpense._id;
  
      // Use the state values for form data
      const { itemName, userName, quantity, date, amount, description } = editFormData;
  
      // Validation
      const validationFields = [
        { field: 'itemName', value: itemName, label: 'Item Name' },
        { field: 'userName', value: userName, label: 'User Name' },
        { field: 'quantity', value: quantity, label: 'Quantity' },
        { field: 'date', value: date, label: 'Date' },
        { field: 'amount', value: amount, label: 'Amount' },
        { field: 'category', value: category, label: 'Category' },
        { field: 'status', value: editStatus, label: 'Status' },
        { field: 'description', value: description, label: 'Description' },
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
  
      const response = await fetch(`https://x-gen-backend.vercel.app/api/expenses/${_id}`, {
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
          status,
          description,
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
        toggleSuccessModal('Expense updated successfully');
    } else {
      console.error('Failed to update expense:', response.status);
    }
  } catch (error) {
    console.error('Error update expense:', error.message);
  }
  };
  
  const handleEditFormChange = (e) => {
    const { id, value } = e.target;
  
    // Check if the field is 'description'
    if (id === 'description') {
      // Limit the description to 30 words
      const words = value.split(/\s+/);
      if (words.length > 30) {
        return; // Don't update the state if the limit is exceeded
      }
    }
  
    // Update the state for other fields
    setEditFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };
  
  return (
    <MDBContainer fluid className='p-0 background overflow-hidden vh-100'>
      {/* <div className='sidebar'>
        <a href='#'>
          <i className='fa fa-fw fa-wrench'></i> Expenses
        </a>
      </div> */}

      <div className='div2'>
    
                <h1>Expenses Report</h1>
                {/* <img src="./src/assets/xgen.png" alt="Login Image" style={{ width: '4%', float:'left' , backgroundColor: 'black' }} /> */}


      {/* Modal */}
      <Modal show={showModal} onHide={handleCancelDelete} style={{ color: 'black', position: 'fixed', 
  top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)'}}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this expense? 
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Close
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      
        <BalanceTotal
          totalReceived={getFilteredExpenses()
            .filter((expense) => expense.status === 'Received')
            .reduce((total, expense) => total + parseFloat(expense.amount), 0)}
          totalPay={getFilteredExpenses()
            .filter((expense) => expense.status === 'Pay')
            .reduce((total, expense) => total + parseFloat(expense.amount), 0)}
        />
         <PayTotal expenses={getFilteredExpenses()} />
        <ReceivedTotal expenses={getFilteredExpenses()} />

        <SuccessModal
        isOpen={isSuccessModalOpen}
        message={successMessage}
        onDismiss={() => setIsSuccessModalOpen(false)}
                />
          <SuccessModal
            isOpen={successModal.isOpen}
            message={successModal.message}
            onDismiss={() => setSuccessModal({ isOpen: false, message: '' })}
          />
          <input
            type='text'
            placeholder='Search by Item Name'
            value={searchTerm}
            onChange={handleSearch}
            className='form-control'
            style={{ float: 'left', width: '300px', marginTop: '20px', marginLeft: '90px' }}
          />

          <button
          type='button'
          className='btn btn-primary'
          onClick={toggleModal}
          style={{ float: 'right',  marginTop: '20px', marginRight:'90px' }}
        >
          Add New Expense
        </button>

          <button
        type='button'
        className='btn btn-success'
        onClick={handleExportToExcel}
        style={{ float: 'right', marginTop: '20px', marginRight: '20px' }}
      >
        Export to Excel
      </button>

        <select
          className='form-select'
          value={filterType}
          onChange={handleFilterChange}
          style={{ float: 'left', marginLeft: '15px', marginTop: '20px', width: '10%' }}
        >
          <option value='all'>Filter by days</option>
          <option value='daily'>Daily</option> {/* Add this line */}
          <option value='monthly'>Monthly</option>
          <option value='weekly'>Weekly</option>
          <option value='yearly'>Yearly</option>
        </select>

        {/* ... Existing JSX ... */}
          <select
            className='form-select'
            value={sortType}
            onChange={handleSortChange}
            style={{ float: 'left', marginLeft: '20px', marginTop: '20px', width: '10%' }}
          >
            <option value='recently-added'>Recently Added</option>
            <option value='a-z'>A to Z</option>
            <option value='z-a'>Z to A</option>
            <option value='ascending'>Ascending</option>
            <option value='descending'>Descending</option>
          </select>
          {/* ... Existing JSX ... */}

          <SuccessModal message={successMessage} onClose={() => setSuccessMessage('')} />
            
        <select
        className='form-select'
        value={statusFilter}
        onChange={handleStatusFilterChange}
        style={{ float: 'left', marginLeft: '20px', marginTop: '20px', width: '10%' }}
      >
        <option value=''>Filter by status</option>
        <option value='Received'>Received</option>
        <option value='Pay'>Pay</option>
      </select>

      <div className='modal' id='myModal' style={{ display: isModalOpen ? 'block' : 'none', color: 'black', position: 'fixed', 
      top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)' }}>
            <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h4 className='modal-title'>Add New Expense</h4>
                <button type='button' className='btn-close' onClick={toggleModal}></button>
              </div>
              <div className='modal-body'>
                <div className='mb-3 row'>
                  <div className='col text-start'>
                    <label htmlFor='itemName' className='form-label' class = "required">
                      Item Name
                    </label>
                    <input type='text' className='form-control' id='itemName' />
                  </div>
                  <div className='col'>
                    <div className='col text-start'>
                    <label htmlFor='userName' className='form-label' class='required'>
        User Name
      </label>
      {isAddingCustomUser ? (
        <div className='input-group'>
          <input
            type='text'
            className='form-control'
            placeholder='Enter custom user'
            value={customUser}
            onChange={handleCustomUserChange}
          />
          <button
            className='btn btn-outline-secondary'
            type='button'
            onClick={handleAddCustomUser}
          >
            Add
          </button>
        </div>
      ) : (
        <div className='input-group'>
          <select
            className='form-select'
            id='userName'
            value={selectedUser}
            onChange={handleUserChange}
          >
            <option value='' disabled>
              Select user
            </option>
            {users.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
          <button
            className='btn btn-outline-secondary'
            type='button'
            onClick={() => setIsAddingCustomUser(true)}
          >
            Add
          </button>
        </div>
      
                  )}
                </div>
                  </div>
                </div>
                <div className='mb-3 row'>
                  <div className='col text-start'>
                    <label htmlFor='quantity' className='form-label' class = "required">
                      Quantity
                    </label>
                    <input type='text' className='form-control' id='quantity' />
                  </div>
                  <div className='col text-start'>
                    <label htmlFor='date' className='form-label' class = "required">
                      Date
                    </label>
                    <input type='date' className='form-control' id='date' />
                  </div>
                </div>
                <div className='mb-3 row'>
                  <div className='col-6 text-start'>
                    <label htmlFor='status' className='form-label' class = "required">
                      Status
                    </label>
                    <select
                      className='form-select'
                      id='status'
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value=''>Select status</option>
                      <option>Received</option>
                      <option>Pay</option>
                    </select>
                  </div>
                  <div className='col text-start'>
                    <label htmlFor='amount' className='form-label' class = "required">
                      Amount
                    </label>
                    <input type='text' className='form-control' id='amount' />
                  </div>
                </div>
                <div className='mb-3 row'>
                <div className='col text-start'>
                    <label htmlFor='description' className='form-label' class = "required">
                      Description
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='description'
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className='col-6 text-start'>
                    <label htmlFor='category' className='form-label' class = "required">
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
              <button type='button' className='btn btn-secondary' style={{float: 'left' , marginRight: '230px'}} onClick={clearModalFields}>
                  Clear
                </button>
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

        <div className='modal' id='editModal' style={{ display: isEditModalOpen ? 'block' : 'none', color: 'black', position: 'fixed', 
  top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)' }}>
  <div className='modal-dialog'>
    <div className='modal-content'>
      <div className='modal-header'>
        <h4 className='modal-title'>Edit Expense</h4>
        <button type='button' className='btn-close' onClick={() => setIsEditModalOpen(false)}></button>
      </div>
      <div className='modal-body'>
        <div className='mb-3 row'>
          <div className='col text-start'>
            <label  htmlFor='itemName' className='form-label'>
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
          <div className='col text-start'>
      <label htmlFor='userName' className='form-label'>
        User Name
      </label>
      {isAddingCustomUser ? (
        <div className='input-group'>
          <input
            type='text'
            className='form-control'
            placeholder='Enter custom user'
            value={customUser}
            onChange={(e) => setCustomUser(e.target.value)}
          />
          <button
            className='btn btn-outline-secondary'
            type='button'
            onClick={handleAddCustomUser}
          >
            Add
          </button>
        </div>
      ) : (
        <div className='input-group'>
          <select
            className='form-select'
            id='userName'
            value={editFormData.userName || ''}
            onChange={handleEditFormChange}
          >
            <option value='' disabled>
              Select user
            </option>
            {users.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
          <button
            className='btn btn-outline-secondary'
            type='button'
            onClick={handleConvertToUserDropdown}
          >
            Add
          </button>
        </div>
      )}
    </div>
</div>
</div>
        <div className='mb-3 row'>
          <div className='col text-start'>
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
          <div className='col text-start'>
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
          <div className='col-6 text-start'>
            <label htmlFor='status' className='form-label'>
              Status
            </label>
            <select
              className='form-select'
              id='status'
              value={status} // Use an empty string as the default value if status is undefined
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value=''>Select status</option>
              <option>Received</option>
              <option>Pay</option>
            </select>
          </div>
          <div className='col text-start'>
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
        </div>
        <div className='mb-3 row'>
          <div className='col text-start'>
            <label htmlFor='description' className='form-label'>
              Description
            </label>
            <input
              type='text'
              className='form-control'
              id='description'
              value={editFormData.description}
              onChange={handleEditFormChange}
            />
          </div>
          <div className='col-6 text-start'>
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
    <div className='table-scroll'>
      <table className='table table-white table-hover'>
    <thead>
      <tr>
        <th>S.No</th>
        <th>Item Name</th>
        <th>User Name</th>
        <th>Category</th>
        <th>Date</th>
        <th>Description</th> {/* Add this line */}
        <th>Amount</th>
        <th>Quantity</th>
        <th>Status</th>
        <th>Actions</th> 
      </tr>
    </thead>
    <tbody>
      {getFilteredExpenses().length === 0 ? (
        <tr>
          <td colSpan="10">Not found</td>
        </tr>
      ) : (
        getFilteredExpenses().map((expense, index) => (
          <tr key={expense._id}>
            <td>{index + 1}</td>
            <td>{capitalizeWords(expense.itemName)}</td>
            <td>{capitalizeWords(expense.userName)}</td>
            <td>{expense.category}</td>
            <td>{expense.date}</td>
            <td>{expense.description}</td> {/* Add this line */}
            <td>{expense.amount}</td>
            <td>{expense.quantity}</td>
            <td>
              <span style={{ color: expense.status === 'Received' ? 'darkgreen' : 'red' }}>
                {expense.status}
              </span>
            </td>
            <td className='action-buttons'>
              <button className='btn btn-primary' onClick={() => openEditModal(expense)}>
                Edit
              </button>
              <button className='btn btn-danger' onClick={() => handleDeleteExpense(expense._id)}>
                Delete
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
    </table>
    </div>
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
