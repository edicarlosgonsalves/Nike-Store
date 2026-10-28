
const precoProduto = 799;

const imagemTenis = document.querySelector("#imagemTenis");
const seletorTamanho = document.querySelector("#tamanho");
const mensagem = document.querySelector("#mensagem");

const painelCarrinho = document.querySelector("#painelCarrinho");
const fundoCarrinho = document.querySelector("#fundoCarrinho");
const itensCarrinho = document.querySelector("#itensCarrinho");

const contadorCarrinho = document.querySelector("#contadorCarrinho");
const subtotalElemento = document.querySelector("#subtotal");
const totalElemento = document.querySelector("#total");

let corSelecionada = "Verde";

// Recupera os produtos salvos no navegador.
let carrinho = [];

try {
    const dadosSalvos = JSON.parse(
        localStorage.getItem("carrinhoNike") || "[]"
    );

    if (Array.isArray(dadosSalvos)) {
        carrinho = dadosSalvos.filter(item =>
            item &&
            item.nome === "Nike Air Zoom" &&
            typeof item.id === "string" &&
            typeof item.tamanho === "string" &&
            typeof item.cor === "string" &&
            typeof item.imagem === "string" &&
            Number.isInteger(item.quantidade) &&
            item.quantidade > 0 &&
            item.quantidade <= 99
        );
    }
} catch (erro) {
    carrinho = [];
}

// Formata os valores como dinheiro brasileiro.
function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Salva o carrinho no navegador.
function salvarCarrinho() {
    localStorage.setItem("carrinhoNike", JSON.stringify(carrinho));
}

// Troca a cor e a imagem do tênis.
document.querySelectorAll(".botoes").forEach(botao => {
    botao.addEventListener("click", () => {
        const cor = botao.dataset.cor;
        const imagem = botao.dataset.imagem;

        corSelecionada = botao.dataset.nome;

        document.body.style.backgroundColor = cor;

        document.querySelectorAll(".botoes").forEach(item => {
            item.classList.remove("ativo");
        });

        botao.classList.add("ativo");

        imagemTenis.style.opacity = 0;

        setTimeout(() => {
            imagemTenis.src = imagem;
            imagemTenis.alt = `Tênis Nike Air Zoom ${corSelecionada}`;
            imagemTenis.style.opacity = 1;
        }, 350);
    });
});

// Adiciona o produto ao carrinho.
document.querySelector("#adicionarCarrinho").addEventListener("click", () => {
    const tamanho = seletorTamanho.value;

    if (!tamanho) {
        mensagem.textContent = "Escolha um tamanho antes de continuar.";
        seletorTamanho.focus();
        return;
    }

    const imagem = document.querySelector(".botoes.ativo").dataset.imagem;

    // Produtos iguais, com a mesma cor e tamanho,
    // ficam agrupados no mesmo item.
    const id = `${corSelecionada}-${tamanho}`;

    const produtoExistente = carrinho.find(item => item.id === id);

    if (produtoExistente) {
        if (produtoExistente.quantidade >= 99) {
            mensagem.textContent = "Limite de 99 unidades por variação.";
            return;
        }

        produtoExistente.quantidade++;
    } else {
        carrinho.push({
            id,
            nome: "Nike Air Zoom",
            preco: precoProduto,
            tamanho,
            cor: corSelecionada,
            imagem,
            quantidade: 1
        });
    }

    salvarCarrinho();
    atualizarCarrinho();

    mensagem.textContent = "Tênis adicionado ao carrinho!";

    abrirCarrinho();
});

// Atualiza os produtos e os valores exibidos.
function atualizarCarrinho() {
    itensCarrinho.replaceChildren();

    let quantidadeTotal = 0;
    let subtotal = 0;

    carrinho.forEach(produto => {
        quantidadeTotal += produto.quantidade;
        subtotal += produto.preco * produto.quantidade;

        const item = document.createElement("article");
        item.className = "item-carrinho";

        const imagem = document.createElement("img");
        imagem.src = produto.imagem;
        imagem.alt = `${produto.nome} ${produto.cor}`;
        imagem.className = "imagem-item";

        const detalhes = document.createElement("div");
        detalhes.className = "detalhes-item";

        const nome = document.createElement("h3");
        nome.textContent = produto.nome;

        const variante = document.createElement("p");
        variante.textContent = `Cor: ${produto.cor} | Tamanho: ${produto.tamanho}`;

        const preco = document.createElement("p");
        preco.textContent = formatarPreco(produto.preco);

        const controles = document.createElement("div");
        controles.className = "controles-quantidade";

        const diminuir = document.createElement("button");
        diminuir.textContent = "−";
        diminuir.setAttribute("aria-label", "Diminuir quantidade");

        diminuir.addEventListener("click", () => {
            alterarQuantidade(produto.id, -1);
        });

        const quantidade = document.createElement("span");
        quantidade.textContent = produto.quantidade;

        const aumentar = document.createElement("button");
        aumentar.textContent = "+";
        aumentar.setAttribute("aria-label", "Aumentar quantidade");
        aumentar.disabled = produto.quantidade >= 99;

        aumentar.addEventListener("click", () => {
            alterarQuantidade(produto.id, 1);
        });

        const remover = document.createElement("button");
        remover.textContent = "Remover";
        remover.className = "remover-item";

        remover.addEventListener("click", () => {
            removerProduto(produto.id);
        });

        controles.append(diminuir, quantidade, aumentar);

        detalhes.append(nome, variante, preco, controles, remover);
        item.append(imagem, detalhes);
        itensCarrinho.append(item);
    });

    if (carrinho.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "carrinho-vazio";
        vazio.textContent = "Seu carrinho está vazio.";
        itensCarrinho.append(vazio);
    }

    contadorCarrinho.textContent = quantidadeTotal;
    subtotalElemento.textContent = formatarPreco(subtotal);
    totalElemento.textContent = formatarPreco(subtotal);

    salvarCarrinho();
}

// Aumenta ou diminui a quantidade de um produto.
function alterarQuantidade(id, variacao) {
    const produto = carrinho.find(item => item.id === id);

    if (!produto) return;

    produto.quantidade += variacao;

    if (produto.quantidade <= 0) {
        removerProduto(id);
        return;
    }

    if (produto.quantidade > 99) {
        produto.quantidade = 99;
    }

    atualizarCarrinho();
}

// Remove um produto do carrinho.
function removerProduto(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    atualizarCarrinho();
}

// Abre e fecha o painel lateral.
function abrirCarrinho() {
    painelCarrinho.classList.add("aberto");
    fundoCarrinho.classList.add("visivel");

    painelCarrinho.setAttribute("aria-hidden", "false");
    document.body.classList.add("carrinho-aberto");
}

function fecharCarrinho() {
    painelCarrinho.classList.remove("aberto");
    fundoCarrinho.classList.remove("visivel");

    painelCarrinho.setAttribute("aria-hidden", "true");
    document.body.classList.remove("carrinho-aberto");
}

document.querySelector("#abrirCarrinho")
    .addEventListener("click", abrirCarrinho);

document.querySelector("#fecharCarrinho")
    .addEventListener("click", fecharCarrinho);

fundoCarrinho.addEventListener("click", fecharCarrinho);

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
        fecharCarrinho();
    }
});

// Ainda não existe pagamento ou checkout real.
document.querySelector("#finalizarCompra").addEventListener("click", () => {
    if (carrinho.length === 0) {
        alert("Adicione um produto antes de continuar.");
        return;
    }

    alert(
        "Seu carrinho está pronto!\n" +
        "O pagamento ainda não está integrado neste projeto."
    );
});

// Mostra os produtos que já estavam salvos.
atualizarCarrinho();

