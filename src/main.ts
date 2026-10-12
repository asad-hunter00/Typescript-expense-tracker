import "./style.css";
import Chart from "chart.js/auto";

type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
};

const categories = [
  "Food",
  "Shopping",
  "Transport",
  "Salary",
  "Entertainment",
  "Bills",
  "Health",
  "Other",
];

let payments: Transaction[] = JSON.parse(
  localStorage.getItem("payments") || "[]",
);

if (payments.length === 0) {
  payments = [
    {
      id: 1,
      title: "Kiyim sotib olish",
      amount: 300000,
      type: "expense",
      category: "Shopping",
    },
    {
      id: 2,
      title: "Ish haqi",
      amount: 500000,
      type: "income",
      category: "Salary",
    },
  ];
}

const app = document.querySelector<HTMLDivElement>("#app")!;

let chart: Chart;

function render() {
  let income = 0;
  let expense = 0;

  for (const item of payments) {
    if (item.type === "income") {
      income += item.amount;
    } else {
      expense += item.amount;
    }
  }

  const balance = income - expense;

  let options = "";

  for (const category of categories) {
    options += `<option value="${category}">${category}</option>`;
  }

  let list = "";

  for (const item of payments) {
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

          <button
            class="delete"
            onclick="deletePayment(${item.id})"
            title="O'chirish"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  if (payments.length === 0) {
    list = `<p class="empty">Hozircha tranzaksiyalar yo'q</p>`;
  }

  app.innerHTML = `
    <div class="dashboard">

      <header class="header">
        <div class="brand">
          <div class="brand-icon">
            <img src="logo.png" alt="Brand Logo" width="50">
          </div>
          <div>
            <h1>Expense Tracker</h1>
            <p>Moliyangizni nazorat qiling</p>
          </div>
        </div>
      </header>

      <section class="summary">

        <div class="card income-card">
          <div class="card-top">
            <div class="card-icon income-bg">
              <i class="fa-solid fa-arrow-trend-up"></i>
            </div>
            <span>Jami kirim</span>
          </div>
          <h2>${income.toLocaleString()} <small>so'm</small></h2>
          <p>Umumiy daromadingiz</p>
        </div>

        <div class="card expense-card">
          <div class="card-top">
            <div class="card-icon expense-bg">
              <i class="fa-solid fa-arrow-trend-down"></i>
            </div>
            <span>Jami chiqim</span>
          </div>
          <h2>${expense.toLocaleString()} <small>so'm</small></h2>
          <p>Umumiy xarajatlaringiz</p>
        </div>

        <div class="card balance-card">
          <div class="card-top">
            <div class="card-icon balance-bg">
              <i class="fa-solid fa-wallet"></i>
            </div>
            <span>Jami balans</span>
          </div>
          <h2 class="${balance < 0 ? "negative" : ""}">
            ${balance.toLocaleString()} <small>so'm</small>
          </h2>
          <p>Kirim va chiqim farqi</p>
        </div>

      </section>

      <section class="content">

        <form id="form" onsubmit="addPayment(event)">
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
            placeholder="Masalan, oziq-ovqat"
            required
            maxlength="100"
          >

          <label for="amount">Summa (so'm)</label>
          <input
            id="amount"
            type="number"
            min="1"
            placeholder="150000"
            required
          >

          <label for="type">Tranzaksiya turi</label>
          <select id="type">
            <option value="expense">Chiqim</option>
            <option value="income">Kirim</option>
          </select>

          <label for="category">Kategoriya</label>
          <select id="category">
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

          <div class="transaction-list">
            ${list}
          </div>
        </div>

      </section>

      <div class="chart-card">
        <div class="section-title">
          <div class="title-icon">
            <img src="logo.png" alt="Brand Logo" width="150">
          </div>
          <div>
            <h3>Kirim va chiqim grafigi</h3>
            <p>Moliyaviy holatingiz tahlili</p>
          </div>
        </div>

        <div class="chart-container">
          <canvas id="moneyChart"></canvas>
        </div>
      </div>

    </div>
  `;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(document.querySelector<HTMLCanvasElement>("#moneyChart")!, {
    type: "doughnut",
    data: {
      labels: ["Kirim", "Chiqim"],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: ["#16a34a", "#ef4444"],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function addPayment(event: SubmitEvent) {
  event.preventDefault();

  const title = (document.querySelector("#title") as HTMLInputElement).value;

  const amount = Number(
    (document.querySelector("#amount") as HTMLInputElement).value,
  );

  const type = (document.querySelector("#type") as HTMLSelectElement)
    .value as Transaction["type"];

  const category = (document.querySelector("#category") as HTMLSelectElement)
    .value;

  if (title.trim() === "" || amount <= 0) {
    alert("Ma'lumotlarni to'g'ri kiriting!");
    return;
  }

  payments.push({
    id: Date.now(),
    title: title.trim(),
    amount: amount,
    type: type,
    category: category,
  });

  localStorage.setItem("payments", JSON.stringify(payments));

  render();
}

function deletePayment(id: number) {
  if (!confirm("Rostdan ham o'chirilsinmi?")) {
    return;
  }

  const newPayments: Transaction[] = [];

  for (const item of payments) {
    if (item.id !== id) {
      newPayments.push(item);
    }
  }

  payments = newPayments;

  localStorage.setItem("payments", JSON.stringify(payments));

  render();
}

(window as any).addPayment = addPayment;
(window as any).deletePayment = deletePayment;

localStorage.setItem("payments", JSON.stringify(payments));

render();
