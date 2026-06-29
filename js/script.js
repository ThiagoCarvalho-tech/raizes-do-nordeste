function salvarCliente() {
  const nome = document.getElementById("nome")?.value;
  const telefone = document.getElementById("telefone")?.value;
  const lgpd = document.getElementById("lgpd");

  if (!nome || !telefone) {
    alert("Preencha nome e telefone para continuar.");
    return;
  }

  if (lgpd && !lgpd.checked) {
    alert("Você precisa aceitar o uso dos dados conforme a LGPD.");
    return;
  }

  localStorage.setItem("clienteNome", nome);
  localStorage.setItem("clienteTelefone", telefone);

  window.location.href = "unidades.html";
}

function selecionarUnidade(nomeUnidade, elemento) {
  localStorage.setItem("unidadeSelecionada", nomeUnidade);

  elemento.classList.add("selected");
  const status = elemento.querySelector("span");
  status.textContent = "Selecionando...";

  setTimeout(() => {
    window.location.href = "cardapio.html";
  }, 500);
}

function simularPagamento() {
  const aprovado = Math.random() > 0.25;

  if (!aprovado) {
    alert("Pagamento recusado pelo sistema externo. Tente outra forma de pagamento.");
    return;
  }

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const subtotal = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  const pedido = {
    numero: Math.floor(1000 + Math.random() * 9000),
    data: new Date().toLocaleDateString("pt-BR"),
    valor: subtotal,
    status: "Recebido",
    itens: carrinho
  };

  const historico = JSON.parse(localStorage.getItem("historicoPedidos")) || [];

  historico.unshift(pedido);

  localStorage.setItem("ultimoPedido", JSON.stringify(pedido));
  localStorage.setItem("historicoPedidos", JSON.stringify(historico));
  const pontosAtuais = Number(localStorage.getItem("pontosFidelidade")) || 0;
  const novosPontos = Math.floor(subtotal);

  localStorage.setItem("pontosFidelidade", pontosAtuais + novosPontos);
  localStorage.removeItem("carrinho");

  window.location.href = "confirmado.html";
}

function adicionarAoCarrinho(nome, preco, imagem) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  const itemExistente = carrinho.find(item => item.nome === nome);

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      nome: nome,
      preco: preco,
      imagem: imagem,
      quantidade: 1
    });
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  alert("Produto adicionado ao carrinho!");
}

function carregarCarrinho() {
  const lista = document.getElementById("cart-list");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");

  if (!lista) return;

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  if (carrinho.length === 0) {
    lista.innerHTML = "<p>Seu carrinho está vazio.</p>";
    subtotalEl.textContent = "R$ 0,00";
    totalEl.textContent = "R$ 0,00";
    return;
  }

  let subtotal = 0;
  lista.innerHTML = "";

  carrinho.forEach((item, index) => {
    subtotal += item.preco * item.quantidade;

    lista.innerHTML += `
      <article class="cart-item">
        <img src="${item.imagem}" alt="${item.nome}">

        <div class="cart-info">
          <h3>${item.nome}</h3>
          <p>R$ ${item.preco.toFixed(2).replace(".", ",")} un.</p>
          <strong>R$ ${(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</strong>
        </div>

        <div class="cart-actions">
          <button onclick="alterarQuantidade(${index}, -1)">−</button>
          <span>${item.quantidade}</span>
          <button onclick="alterarQuantidade(${index}, 1)">+</button>
        </div>
      </article>
    `;
  });

  const tipoEntrega = document.querySelector('input[name="tipo"]:checked')?.value;
  const frete = tipoEntrega === "entrega" ? 5 : 0;
  const total = subtotal + frete;

  const freteEl = document.getElementById("frete");

  subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
  if (freteEl) freteEl.textContent = `R$ ${frete.toFixed(2).replace(".", ",")}`;
  totalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;

}

function alterarQuantidade(index, valor) {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  carrinho[index].quantidade += valor;

  if (carrinho[index].quantidade <= 0) {
    carrinho.splice(index, 1);
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  carregarCarrinho();
}

document.addEventListener("DOMContentLoaded", carregarCarrinho);

function carregarPedidoConfirmado() {
  const numeroEl = document.getElementById("numero-pedido");
  if (!numeroEl) return;

  const pedido = JSON.parse(localStorage.getItem("ultimoPedido"));

  if (pedido) {
    numeroEl.textContent = `#${pedido.numero}`;
  }
}

document.addEventListener("DOMContentLoaded", carregarPedidoConfirmado);

function carregarHistorico() {
  const lista = document.getElementById("history-list");
  if (!lista) return;

  const historico = JSON.parse(localStorage.getItem("historicoPedidos")) || [];

  if (historico.length === 0) {
    lista.innerHTML = "<p>Nenhum pedido encontrado.</p>";
    return;
  }

  lista.innerHTML = "";

  historico.forEach((pedido, index) => {
    lista.innerHTML += `
      <article class="history-card" onclick="abrirDetalhesPedido(${index}, this)">
        <div>
          <h3>Pedido #${pedido.numero}</h3>
          <p>${pedido.data} • ${pedido.itens.length} item(ns)</p>
          <strong>R$ ${pedido.valor.toFixed(2).replace(".", ",")}</strong>
        </div>

        <span>${pedido.status}</span>
      </article>
    `;
  });
}

function abrirDetalhesPedido(index, elemento) {

  elemento.classList.add("selected-history");
  const status = elemento.querySelector("span");
  if (status) {
    status.textContent = "Abrindo...";
  }
  localStorage.setItem("pedidoSelecionado", index);
  setTimeout(() => {
    window.location.href = "detalhes-pedido.html";
  }, 500);

}

document.addEventListener("DOMContentLoaded", carregarHistorico);

function carregarFidelidade() {
  const pontosEl = document.getElementById("pontos");
  if (!pontosEl) return;

  const pontos = Number(localStorage.getItem("pontosFidelidade")) || 0;
  pontosEl.textContent = pontos;
}

document.addEventListener("DOMContentLoaded", carregarFidelidade);

function carregarPerfil() {

  const nome = document.getElementById("nomePerfil");
  const telefone = document.getElementById("telefonePerfil");
  const pedidos = document.getElementById("qtdPedidos");
  const pontos = document.getElementById("perfilPontos");

  if (!nome) return;

  nome.textContent = localStorage.getItem("clienteNome") || "Cliente";

  telefone.textContent = localStorage.getItem("clienteTelefone") || "";

  const historico = JSON.parse(localStorage.getItem("historicoPedidos")) || [];

  pedidos.textContent = historico.length;

  pontos.textContent = Number(localStorage.getItem("pontosFidelidade")) || 0;

}

document.addEventListener("DOMContentLoaded", carregarPerfil);

function carregarUnidadeAtual() {
  const unidadeEl = document.getElementById("unidade-atual");
  if (!unidadeEl) return;

  unidadeEl.textContent = localStorage.getItem("unidadeSelecionada") || "Recife - Boa Viagem";
}

document.addEventListener("DOMContentLoaded", carregarUnidadeAtual);

function ativarNavbar() {
  const paginaAtual = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    const destino = link.getAttribute("href");

    if (destino === paginaAtual) {
      link.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", ativarNavbar);

function carregarDetalhesPedido() {
  const detalhe = document.getElementById("order-detail");
  if (!detalhe) return;

  const historico = JSON.parse(localStorage.getItem("historicoPedidos")) || [];
  const index = localStorage.getItem("pedidoSelecionado");
  const pedido = historico[index];

  if (!pedido) {
    detalhe.innerHTML = "<p>Pedido não encontrado.</p>";
    return;
  }

  let itensHTML = "";

  pedido.itens.forEach((item) => {
    itensHTML += `
      <article class="detail-item">
        <img src="${item.imagem}" alt="${item.nome}">
        <div>
          <h3>${item.nome}</h3>
          <p>Quantidade: ${item.quantidade}</p>
          <strong>R$ ${(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</strong>
        </div>
      </article>
    `;
  });

  detalhe.innerHTML = `
    <section class="detail-card">
      <h2>Pedido #${pedido.numero}</h2>
      <p><strong>Data:</strong> ${pedido.data}</p>
      <p><strong>Status:</strong> ${pedido.status}</p>
      <p><strong>Unidade:</strong> ${localStorage.getItem("unidadeSelecionada") || "Recife - Boa Viagem"}</p>
      <p><strong>Total:</strong> R$ ${pedido.valor.toFixed(2).replace(".", ",")}</p>
    </section>

    <section class="detail-list">
      <h3>Itens do pedido</h3>
      ${itensHTML}
    </section>
  `;
}

document.addEventListener("DOMContentLoaded", carregarDetalhesPedido);

function filtrarCategoria(categoria, botao) {

  document.querySelectorAll(".category")
    .forEach(btn => btn.classList.remove("active"));

  botao.classList.add("active");

  const produtos = document.querySelectorAll(".product-card");

  produtos.forEach(produto => {

    if (categoria === "todos") {

      produto.style.display = "flex";

      return;

    }

    if (produto.dataset.categoria === categoria) {

      produto.style.display = "flex";

    } else {

      produto.style.display = "none";

    }

  });

}