import "./style.css";
import Chart from "chart.js/auto";

type TransactionType = "income" | "expense";

type Category =
  | "Food"
  | "Shopping"
  | "Transport"
  | "Salary"
  | "Entertainment"
  | "Bills"
  | "Health"
  | "Other";

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
}

const categories: Category[] = [
  "Food",
  "Shopping",
  "Transport",
  "Salary",
  "Entertainment",
  "Bills",
  "Health",
  "Other",
];

let payments: Transaction[] = [
  {
    id: 1,
    title: "Kiyim sotib olish",
    amount: 300000,
    type: "expense",
    category: "Shopping",
  },
  {
    id: 2,
    title: "Airportga borish",
    amount: 500000,
    type: "income",
    category: "Transport",
  },
];

const app = document.querySelector<HTMLDivElement>("#app")!;

let moneyChart: Chart | undefined;

function getTotal(type: TransactionType): number {
  let total = 0;

  for (const item of payments) {
    if (item.type === type) {
      total += item.amount;
    }
  }

  return total;
}

function render() {
  const income = getTotal("income");
  const expense = getTotal("expense");
  const balance = income - expense;

  let options = "";

  for (const category of categories) {
    options += `<option value="${category}">${category}</option>`;
  }

  let list = "";

  for (let i = payments.length - 1; i >= 0; i--) {
    const item = payments[i];

    let sign = "-";
    let name = "Chiqim";
    let icon = "fa-arrow-trend-down";

    if (item.type === "income") {
      sign = "+";
      name = "Kirim";
      icon = "fa-arrow-trend-up";
    }

    list += `
      <div class="transaction">
        <div class="transaction-info">
          <div class="transaction-icon ${item.type}">
            <i class="fa-solid ${icon}"></i>
          </div>

          <div>
            <strong>${item.title}</strong>
            <p>${name} • ${item.category}</p>
          </div>
        </div>

        <div class="transaction-actions">
          <strong class="${item.type}">
            ${sign}${item.amount.toLocaleString()} so'm
          </strong>

          <button class="delete" data-id="${item.id}" title="O'chirish">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  if (payments.length === 0) {
    list = "<p>Hozircha to'lovlar yo'q</p>";
  }

  app.innerHTML = `
    <div class="dashboard">
      <header class="header">
        <div class="brand">
          <img src="logo.png" alt="Expense Tracker Logo" class="logo">
          <h1>Expense Tracker</h1>
        </div>
      </header>

      <section class="summary">
        <div class="card">
          <div class="card-top">
            <div class="card-icon income-bg">
              <i class="fa-solid fa-arrow-trend-up"></i>
            </div>
            <span>Jami kirim</span>
          </div>

          <h2>${income.toLocaleString()} <small>so'm</small></h2>
          <p>Umumiy daromadingiz</p>
        </div>

        <div class="card">
          <div class="card-top">
            <div class="card-icon expense-bg">
              <i class="fa-solid fa-arrow-trend-down"></i>
            </div>
            <span>Jami chiqim</span>
          </div>

          <h2>${expense.toLocaleString()} <small>so'm</small></h2>
          <p>Umumiy xarajatlaringiz</p>
        </div>

        <div class="card">
          <div class="card-top">
            <div class="card-icon balance-bg">
              <i class="fa-solid fa-sack-dollar"></i>
            </div>
            <span>Jami Balans</span>
          </div>

          <h2 class="${balance < 0 ? "negative" : ""}">
            ${balance.toLocaleString()} <small>so'm</small>
          </h2>

          <p>Kirim va chiqim farqi</p>
        </div>
      </section>

      <section class="content">
        <form id="transaction-form">
          <div class="section-title">
            <div class="title-icon">
              <i class="fa-solid fa-plus"></i>
            </div>

            <div>
              <h3>Yangi tranzaksiya</h3>
              <p>Ma'lumotlarni to'ldiring</p>
            </div>
          </div>

          <label for="title">Tranzaksiya nomi</label>
          <input
            id="title"
            name="title"
            placeholder="Pul qayerga ketgani"
            required
            maxlength="100"
          >

          <label for="amount">Summa so'm</label>
          <input
            id="amount"
            name="amount"
            type="number"
            placeholder="So'm, 1500000"
            required
          >

          <label for="type">Tranzaksiya turi</label>
          <select id="type" name="type">
            <option value="expense">Chiqim</option>
            <option value="income">Kirim</option>
          </select>

          <label for="category">Kategoriya</label>
          <select id="category" name="category">
            ${options}
          </select>

          <button type="submit" class="submit-btn">
            <i class="fa-solid fa-plus"></i>
            Tranzaksiya qo'shish
          </button>
        </form>

        <div class="transactions">
          <div class="section-title transaction-heading">
            <div>
              <h3>Tranzaksiyalar</h3>
              <p>Barcha kirim va chiqimlaringiz</p>
            </div>

            <span class="count">${payments.length} ta</span>
          </div>

          <div class="transaction-list">${list}</div>
        </div>
      </section>

      <div class="chart-card">
        <h3>Kirim va chiqim grafigi</h3>

        <div class="chart-container">
          <canvas id="moneyChart"></canvas>
        </div>
      </div>
    </div>
  `;

  const canvas = document.querySelector<HTMLCanvasElement>("#moneyChart")!;

  if (moneyChart) {
    moneyChart.destroy();
  }

  moneyChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Kirim", "Chiqim"],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: ["#16a34a", "#dc2626"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  const form = document.querySelector<HTMLFormElement>("#transaction-form")!;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = (document.querySelector("#title") as HTMLInputElement).value;
    const amount = Number(
      (document.querySelector("#amount") as HTMLInputElement).value,
    );

    if (title === "" || amount <= 0) {
      alert("Ma'lumotlarni to'g'ri kiriting!");
      return;
    }

    const type = (document.querySelector("#type") as HTMLSelectElement)
      .value as TransactionType;

    const category = (document.querySelector("#category") as HTMLSelectElement)
      .value as Category;

    payments.push({
      id: Date.now(),
      title: title,
      amount: amount,
      type: type,
      category: category,
    });

    render();
  });

  const buttons = document.querySelectorAll<HTMLButtonElement>(".delete");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (confirm("O'chirilsinmi?")) {
        const id = Number(button.dataset.id);

        payments = payments.filter((item) => item.id !== id);

        render();
      }
    });
  });
}

render();
