// Expense Tracker

// Get elements
const transactionForm = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const transactionList = document.getElementById("transactionList");
const emptyState = document.getElementById("emptyState");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const currentBalance = document.getElementById("currentBalance");

const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");

const submitBtn = document.getElementById("submitBtn");
const cancelEdit = document.getElementById("cancelEdit");
const formTitle = document.getElementById("formTitle");


// Data
let transactions = JSON.parse(
    localStorage.getItem("expenseTrackerTransactions")
) || [];

let editId = null;

// Set today's date automatically
dateInput.value = new Date().toISOString().split("T")[0];


// Save to Local Storage
function saveTransactions() {
    localStorage.setItem(
        "expenseTrackerTransactions",
        JSON.stringify(transactions)
    );
}


// Format Currency
function formatCurrency(amount) {
    return `Rs. ${Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}


// Calculate Summary
function updateSummary() {

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {

        if (transaction.type === "income") {
            income += Number(transaction.amount);
        } else {
            expense += Number(transaction.amount);
        }

    });

    const balance = income - expense;

    totalIncome.textContent = formatCurrency(income);
    totalExpense.textContent = formatCurrency(expense);
    currentBalance.textContent = formatCurrency(balance);
}


// Display Transactions
function displayTransactions() {

    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

    let filteredTransactions = transactions.filter(transaction => {

        const typeMatch =
            selectedType === "all" ||
            transaction.type === selectedType;

        const categoryMatch =
            selectedCategory === "all" ||
            transaction.category === selectedCategory;

        return typeMatch && categoryMatch;
    });

    // Sort newest first
    filteredTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    transactionList.innerHTML = "";

    if (filteredTransactions.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        filteredTransactions.forEach(transaction => {

            const row = document.createElement("tr");

            const amountClass =
                transaction.type === "income"
                    ? "amount-income"
                    : "amount-expense";

            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";

            const badgeClass =
                transaction.type === "income"
                    ? "badge-income"
                    : "badge-expense";

            const typeText =
                transaction.type === "income"
                    ? "Income"
                    : "Expense";

            row.innerHTML = `
                <td>
                    <strong>${escapeHTML(transaction.description)}</strong>
                </td>

                <td>
                    ${escapeHTML(transaction.category)}
                </td>

                <td>
                    ${formatDate(transaction.date)}
                </td>

                <td>
                    <span class="badge ${badgeClass}">
                        ${typeText}
                    </span>
                </td>

                <td class="${amountClass}">
                    ${sign}${formatCurrency(transaction.amount)}
                </td>

                <td>
                    <button
                        class="action-btn edit-btn"
                        onclick="editTransaction('${transaction.id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteTransaction('${transaction.id}')"
                    >
                        Delete
                    </button>
                </td>
            `;

            transactionList.appendChild(row);
        });
    }

    updateSummary();
}


// Format Date
function formatDate(date) {

    const formattedDate = new Date(date + "T00:00:00");

    return formattedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}


// Escape HTML
function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// Add / Update Transaction
transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!description || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    if (editId !== null) {

        const transaction = transactions.find(
            item => item.id === editId
        );

        if (transaction) {

            transaction.description = description;
            transaction.amount = amount;
            transaction.type = type;
            transaction.category = category;
            transaction.date = date;
        }

        editId = null;

        submitBtn.textContent = "Add Transaction";
        formTitle.textContent = "Add Transaction";
        cancelEdit.classList.add("hidden");

    } else {

        const newTransaction = {
            id: Date.now().toString(),
            description: description,
            amount: amount,
            type: type,
            category: category,
            date: date
        };

        transactions.push(newTransaction);
    }

    saveTransactions();

    transactionForm.reset();

    dateInput.value =
        new Date().toISOString().split("T")[0];

    typeInput.value = "expense";

    displayTransactions();

});


// Edit Transaction
function editTransaction(id) {

    const transaction = transactions.find(
        item => item.id === id
    );

    if (!transaction) {
        return;
    }

    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;

    editId = id;

    formTitle.textContent = "Edit Transaction";
    submitBtn.textContent = "Update Transaction";
    cancelEdit.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Cancel Edit
cancelEdit.addEventListener("click", function () {

    editId = null;

    transactionForm.reset();

    dateInput.value =
        new Date().toISOString().split("T")[0];

    typeInput.value = "expense";

    formTitle.textContent = "Add Transaction";
    submitBtn.textContent = "Add Transaction";

    cancelEdit.classList.add("hidden");
});


// Delete Transaction
function deleteTransaction(id) {

    const transaction = transactions.find(
        item => item.id === id
    );

    if (!transaction) {
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete "${transaction.description}"?`
    );

    if (!confirmed) {
        return;
    }

    transactions = transactions.filter(
        item => item.id !== id
    );

    saveTransactions();

    displayTransactions();
}

// Filters
typeFilter.addEventListener(
    "change",
    displayTransactions
);

categoryFilter.addEventListener(
    "change",
    displayTransactions
);


// Initial Display
displayTransactions();