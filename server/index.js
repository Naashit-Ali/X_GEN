// table-server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const EmployeeModel = require('./models/Employee')
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB using Mongoose

mongoose.connect('mongodb+srv://user:12345@naashit.asifuci.mongodb.net/employee', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  EmployeeModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        if (user.password === password) {
          // Generate a token
          const token = jwt.sign({ userId: user._id }, 'token', { expiresIn: '7d' });

          // Set the token in a cookie with a 7-day expiry
          res.cookie('token', token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });

          res.json({ status: 'Success', token });
        } else {
          res.status(401).json({ error: 'Incorrect password' });
        }
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch((error) => {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Missing token' });
  }

  jwt.verify(token, 'token', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Attach the decoded user ID to the request for further use
    req.userId = decoded.userId;
    next();
  });
}

app.post('/register', (req, res) =>{
  EmployeeModel.create(req.body)
  .then(employees => res.json(employees))
  .catch(err => res.json(err))
})


// Define Expense schema
const expenseSchema = new mongoose.Schema({
  itemID: String,
  itemName: String,
  userName: String,
  category: String,
  date: String,
  amount: String,
  quantity: String,
  status: String,

});

const Expense = mongoose.model('Expense', expenseSchema);

// API endpoint to get the next available item ID
app.get('/api/expenses/nextItemID', async (req, res) => {
  try {
    // Find the maximum item ID in the database
    const maxItemID = await Expense.findOne({}, { itemID: 1 }).sort({ itemID: -1 });

    // Calculate the next available item ID
    const nextItemID = maxItemID ? parseInt(maxItemID.itemID) + 1 : 1001;

    res.json({ nextItemID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to add a new expense
// API endpoint to add a new expense
app.post('/api/expenses', async (req, res) => {
  const { itemID, itemName, userName, category, date, amount, quantity, status } = req.body;
  try {
    const newExpense = new Expense({ itemID, itemName, userName, category, date, amount, quantity, status }); // Add "status" here
    await newExpense.save();
    res.json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  const expenseId = req.params.id;
  const { itemName, userName, category, date, amount, quantity, status } = req.body; // Add "status" here

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { itemName, userName, category, date, amount, quantity, status }, // Add "status" here
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// API endpoint to delete an expense by ID
app.delete('/api/expenses/:id', async (req, res) => {
  const expenseId = req.params.id;

  try {
    const deletedExpense = await Expense.findByIdAndDelete(expenseId);

    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Update the itemID sequence
    const updatedExpenses = await Expense.find().sort({ itemID: 1 });
    const updatedItemID = 1001;

    await Promise.all(
      updatedExpenses.map(async (expense, index) => {
        expense.itemID = updatedItemID + index;
        await expense.save();
      })
    );

    res.json(deletedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/home', verifyToken, (req, res) => {
  // Use req.userId to get the authenticated user's ID and perform actions accordingly
  res.json({ message: 'Welcome to the home page!', userId: req.userId });
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.redirect('/login'); // Redirect to the login page
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

