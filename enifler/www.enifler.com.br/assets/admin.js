const adminApp = {
  orders: [],
  products: [],
  money: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
  date: new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" })
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

async function adminApi(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Não foi possível concluir a solicitação.");
  return data;
}

function showPanel(show) {
  document.querySelector("#admin-login").classList.toggle("hidden", show);
  document.querySelector("#admin-panel").classList.toggle("hidden", !show);
}

function statusLabel(status) {
  const labels = {
    PENDING: "Aguardando",
    COMPLETED: "Pago",
    FAILED: "Falhou",
    REFUSED: "Recusado",
    REFUNDED: "Estornado",
    CHARGED_BACK: "Contestado"
  };
  return labels[status] || status;
}

function customerPhone(order) {
  const { ddd, mobile } = order.customer;
  return ddd && mobile ? `(${ddd}) ${mobile}` : "Não informado no pagamento";
}

function orderRow(order) {
  const email = order.customer.paymentEmail || order.customer.registeredEmail || "Não informado";
  const registeredEmail = order.customer.registeredEmail || "Não informado";
  const ddd = order.customer.ddd || "—";
  const mobile = order.customer.mobile || "—";
  const statusClass = order.status === "COMPLETED" ? "completed" : ["FAILED", "REFUSED", "REFUNDED", "CHARGED_BACK"].includes(order.status) ? "failed" : "";
  return `<tr>
    <td><strong>${escapeHtml(order.customer.name)}</strong><small>${escapeHtml(registeredEmail)}</small></td>
    <td><strong>${escapeHtml(order.customer.document || "—")}</strong><small>CPF</small></td>
    <td><strong>${escapeHtml(email)}</strong><small>Email</small></td>
    <td><strong>${escapeHtml(ddd)}</strong><small>DDD</small></td>
    <td><strong>${escapeHtml(mobile)}</strong><small>Celular</small></td>
    <td><strong>${escapeHtml(order.orderId)}</strong><small>${adminApp.date.format(new Date(order.createdAt))}</small></td>
    <td><strong>${adminApp.money.format(order.total)}</strong><small>${order.paymentVariant === "pix2" ? "PIX 2" : "PIX"}</small></td>
    <td><span class="status-pill ${statusClass}">${escapeHtml(statusLabel(order.status))}</span></td>
    <td><button class="detail-button" type="button" data-order="${escapeHtml(order.orderId)}">Ver detalhes</button></td>
  </tr>`;
}

function renderOrders(list = adminApp.orders) {
  const body = document.querySelector("#orders-body");
  const empty = document.querySelector("#admin-empty");
  body.innerHTML = list.map(orderRow).join("");
  empty.classList.toggle("hidden", list.length > 0);
  document.querySelector(".admin-table").classList.toggle("hidden", list.length === 0);
}

function renderStats(stats) {
  document.querySelector("#stat-customers").textContent = stats.customers;
  document.querySelector("#stat-orders").textContent = stats.orders;
  document.querySelector("#stat-pending").textContent = stats.pending;
  document.querySelector("#stat-received").textContent = adminApp.money.format(stats.received);
}

function productAdminCard(product) {
  return `<article class="product-admin-item" data-product-id="${escapeHtml(product.id)}">
    <div class="product-admin-info">
      <img src="${escapeHtml(product.image)}" alt="">
      <div><strong title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</strong><small>Original cadastrado: ${adminApp.money.format(product.originalPrice)}</small></div>
    </div>
    <div class="price-control">
      <label>Preço real</label>
      <div class="input-prefix"><span>R$</span><input name="realPrice" type="number" min="0.01" step="0.01" value="${product.realPrice.toFixed(2)}"></div>
    </div>
    <div class="price-control">
      <label>Desconto interno</label>
      <div class="input-prefix"><input name="hiddenPercent" type="number" min="0" max="90" step="0.1" value="0"><span>%&nbsp;</span></div>
    </div>
    <div class="price-control">
      <label>Promoção visível</label>
      <div class="input-prefix"><input name="promoPercent" type="number" min="0" max="90" step="0.1" value="${product.promoPercent}"><span>%&nbsp;</span></div>
    </div>
    <div class="price-control"><label>Cliente pagará</label><div class="computed-price">${adminApp.money.format(product.salePrice)}</div></div>
    <div class="product-actions"><button class="save-product" type="button">SALVAR</button><button class="restore-product" type="button">RESTAURAR</button></div>
  </article>`;
}

function renderProducts() {
  document.querySelector("#product-admin-list").innerHTML = adminApp.products.map(productAdminCard).join("");
}

async function loadAdminData() {
  const button = document.querySelector("#refresh-admin");
  button.disabled = true;
  try {
    const [data, productData] = await Promise.all([
      adminApi("/api/admin/customers"),
      adminApi("/api/admin/products")
    ]);
    adminApp.orders = data.orders;
    adminApp.products = productData.products;
    renderStats(data.stats);
    renderOrders();
    renderProducts();
  } catch (error) {
    if (error.message.includes("autorizado")) showPanel(false);
    else showToast(error.message);
  } finally {
    button.disabled = false;
  }
}

function updateComputedPrice(card) {
  const real = Number(card.querySelector("[name=realPrice]").value) || 0;
  const hidden = Number(card.querySelector("[name=hiddenPercent]").value) || 0;
  const promo = Number(card.querySelector("[name=promoPercent]").value) || 0;
  const effectiveReal = real * (1 - hidden / 100);
  card.querySelector(".computed-price").textContent = adminApp.money.format(effectiveReal * (1 - promo / 100));
}

async function saveProduct(card, action = "save") {
  card.classList.add("product-saving");
  const payload = {
    id: card.dataset.productId,
    action,
    realPrice: Number(card.querySelector("[name=realPrice]").value),
    hiddenPercent: Number(card.querySelector("[name=hiddenPercent]").value),
    promoPercent: Number(card.querySelector("[name=promoPercent]").value)
  };
  try {
    await adminApi("/api/admin/products/update", { method: "POST", body: JSON.stringify(payload) });
    const products = await adminApi("/api/admin/products");
    adminApp.products = products.products;
    renderProducts();
    showToast(action === "restore" ? "Preço original restaurado." : "Preço atualizado na loja.");
  } catch (error) {
    card.classList.remove("product-saving");
    showToast(error.message);
  }
}

function openOrder(orderId) {
  const order = adminApp.orders.find(item => item.orderId === orderId);
  if (!order) return;
  const customer = order.customer;
  document.querySelector("#detail-title").textContent = order.orderId;
  document.querySelector("#detail-content").innerHTML = `
    <div class="detail-grid">
      <div class="detail-field"><span>Nome completo</span><strong>${escapeHtml(customer.name)}</strong></div>
      <div class="detail-field"><span>CPF</span><strong>${escapeHtml(customer.document || "Não informado")}</strong></div>
      <div class="detail-field"><span>E-mail cadastrado</span><strong>${escapeHtml(customer.registeredEmail || "Não informado")}</strong></div>
      <div class="detail-field"><span>E-mail do pagamento</span><strong>${escapeHtml(customer.paymentEmail || "Não informado")}</strong></div>
      <div class="detail-field"><span>DDD do PIX 2</span><strong>${escapeHtml(customer.ddd || "Não informado")}</strong></div>
      <div class="detail-field"><span>Celular do PIX 2</span><strong>${escapeHtml(customer.mobile || "Não informado")}</strong></div>
      <div class="detail-field"><span>Telefone completo</span><strong>${escapeHtml(customerPhone(order))}</strong></div>
      <div class="detail-field"><span>Tipo de pagamento</span><strong>${order.paymentVariant === "pix2" ? "PIX 2" : "PIX"}</strong></div>
      <div class="detail-field"><span>Status</span><strong>${escapeHtml(statusLabel(order.status))}</strong></div>
      <div class="detail-field"><span>Valor</span><strong>${adminApp.money.format(order.total)}</strong></div>
      <div class="detail-field"><span>ID da transação</span><strong>${escapeHtml(order.transactionId || "—")}</strong></div>
      <div class="detail-field"><span>Data</span><strong>${adminApp.date.format(new Date(order.createdAt))}</strong></div>
    </div>
    <div class="detail-products"><h3>Produtos</h3>${order.items.map(item =>
      `<p><span>${escapeHtml(item.quantity)}× ${escapeHtml(item.name)}</span><strong>${adminApp.money.format(item.price * item.quantity)}</strong></p>`
    ).join("")}</div>`;
  const modal = document.querySelector("#order-detail");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeOrder() {
  const modal = document.querySelector("#order-detail");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function customerExportLine(order) {
  const customer = order.customer || {};
  const document = customer.document || customer.registeredEmail || "";
  const email = customer.paymentEmail || customer.registeredEmail || "";
  const mobile = customer.mobile || "";
  const ddd = customer.ddd || "";
  return `${document}|${email}|${mobile}|${ddd}`;
}

async function exportCustomers() {
  const lines = [...new Set(adminApp.orders.map(customerExportLine).filter(line => line.replace(/\|/g, "").trim()))];
  if (!lines.length) {
    showToast("Nenhum cliente para exportar.");
    return;
  }
  const content = lines.join("\n");
  try {
    await navigator.clipboard.writeText(content);
    showToast("Lista copiada e arquivo baixado.");
  } catch {
    showToast("Arquivo de clientes exportado.");
  }
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `clientes-enifler-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function clearCustomers() {
  if (!adminApp.orders.length) {
    showToast("Nenhum registro para limpar.");
    return;
  }
  const confirmed = confirm("Tem certeza que deseja limpar todos os registros de clientes e pedidos do painel?");
  if (!confirmed) return;
  const button = document.querySelector("#clear-customers");
  button.disabled = true;
  try {
    await adminApi("/api/admin/customers/clear", { method: "POST", body: "{}" });
    adminApp.orders = [];
    renderStats({ customers: 0, orders: 0, pending: 0, received: 0 });
    renderOrders();
    document.querySelector("#admin-search").value = "";
    showToast("Registros de clientes limpos.");
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
}

document.querySelector("#admin-login-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const error = document.querySelector("#admin-login-error");
  const button = form.querySelector("button");
  error.textContent = "";
  button.disabled = true;
  try {
    await adminApi("/api/admin/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    form.reset();
    showPanel(true);
    await loadAdminData();
  } catch (exception) {
    error.textContent = exception.message;
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#admin-logout").addEventListener("click", async () => {
  await adminApi("/api/admin/logout", { method: "POST", body: "{}" });
  showPanel(false);
});

document.querySelector("#refresh-admin").addEventListener("click", loadAdminData);
document.querySelector("#export-customers")?.addEventListener("click", exportCustomers);
document.querySelector("#clear-customers")?.addEventListener("click", clearCustomers);

document.querySelector("#admin-search").addEventListener("input", event => {
  const term = event.target.value.toLocaleLowerCase("pt-BR").trim();
  const filtered = adminApp.orders.filter(order => JSON.stringify(order).toLocaleLowerCase("pt-BR").includes(term));
  renderOrders(filtered);
});

document.querySelector("#orders-body").addEventListener("click", event => {
  const button = event.target.closest("[data-order]");
  if (button) openOrder(button.dataset.order);
});

document.querySelector("#product-admin-list").addEventListener("input", event => {
  const card = event.target.closest("[data-product-id]");
  if (card) updateComputedPrice(card);
});

document.querySelector("#product-admin-list").addEventListener("click", event => {
  const card = event.target.closest("[data-product-id]");
  if (!card) return;
  if (event.target.closest(".save-product")) saveProduct(card);
  if (event.target.closest(".restore-product")) saveProduct(card, "restore");
});

document.querySelectorAll("[data-close-detail]").forEach(button => button.addEventListener("click", closeOrder));

(async () => {
  try {
    const session = await adminApi("/api/admin/session");
    showPanel(session.authenticated);
    if (session.authenticated) await loadAdminData();
  } catch {
    showPanel(false);
  }
})();
