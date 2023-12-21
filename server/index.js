// table-server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://user:12345@naashit.asifuci.mongodb.net/employee', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Expense schema
const expenseSchema = new mongoose.Schema({
  itemID: String,
  itemName: String,
  userName: String,
  category: String,
  date: String,
  amount: String,
  quantity: String,
});

const Expense = mongoose.model('Expense', expenseSchema);

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
app.post('/api/expenses', async (req, res) => {
  const { itemID, itemName, userName, category, date, amount, quantity } = req.body;

  try {
    const newExpense = new Expense({ itemID, itemName, userName, category, date, amount, quantity });
    await newExpense.save();
    res.json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
