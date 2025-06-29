let bairrosData = [];
let bairroAtual = null;

function confirmarBairroDia() {
    const bairro = document.getElementById('bairro').value;
    const data = document.getElementById('data').value;
    if (!bairro || !data) {
        alert("Selecione o bairro e a data!");
        return;
    }
    bairroAtual = { bairro, data, peixes: [], fechamento: {} };
    document.getElementById('selecao-bairro-dia').classList.add('hidden');
    document.getElementById('adicionar-peixes').classList.remove('hidden');
}

function adicionarPeixe() {
    const container = document.getElementById('peixes-lista');

    const div = document.createElement('div');
    div.className = 'peixe-item';
    div.innerHTML = `
        <input type="text" placeholder="Nome do Peixe" class="nome-peixe">
        <input type="number" placeholder="Quantidade Comprada (kg)" class="quantidade-comprada">
        <input type="number" placeholder="Sobra (kg)" class="sobra">
        <input type="number" placeholder="Preço Venda por kg (R$)" class="preco-venda">
    `;
    container.appendChild(div);
}

function irParaFechamento() {
    const peixeItems = document.querySelectorAll('.peixe-item');
    bairroAtual.peixes = [];

    peixeItems.forEach(item => {
        const nome = item.querySelector('.nome-peixe').value;
        const quantComprada = parseFloat(item.querySelector('.quantidade-comprada').value);
        const sobra = parseFloat(item.querySelector('.sobra').value);
        const precoVenda = parseFloat(item.querySelector('.preco-venda').value);
        const vendida = quantComprada - sobra;
        const total = vendida * precoVenda;

        if (nome && !isNaN(quantComprada) && !isNaN(sobra) && !isNaN(precoVenda)) {
            bairroAtual.peixes.push({ nome, quantComprada, sobra, precoVenda, vendida, total });
        }
    });

    if (bairroAtual.peixes.length === 0) {
        alert("Adicione ao menos um peixe!");
        return;
    }

    document.getElementById('adicionar-peixes').classList.add('hidden');
    document.getElementById('fechamento').classList.remove('hidden');
}

function finalizarBairro() {
    const trocado = parseFloat(document.getElementById('trocado').value) || 0;
    const despesas = parseFloat(document.getElementById('despesas').value) || 0;
    const especie = parseFloat(document.getElementById('especie').value) || 0;
    const cartao = parseFloat(document.getElementById('cartao').value) || 0;
    const pix = parseFloat(document.getElementById('pix').value) || 0;

    const totalVendas = bairroAtual.peixes.reduce((sum, p) => sum + p.total, 0);
    const totalComTrocado = totalVendas + trocado;
    const totalDeclarado = despesas + especie + cartao + pix;

    bairroAtual.fechamento = { trocado, despesas, especie, cartao, pix, totalVendas, totalComTrocado, totalDeclarado };

    bairrosData.push(bairroAtual);
    mostrarPrestacaoContas();
}

function mostrarPrestacaoContas() {
    document.getElementById('fechamento').classList.add('hidden');
    document.getElementById('prestacao-contas').classList.remove('hidden');

    const rel = document.getElementById('detalhes-prestacao');
    rel.innerHTML = `<h3>Bairro: ${bairroAtual.bairro} - Data: ${bairroAtual.data}</h3>`;

    let htmlPeixes = '<h4>Vendas:</h4><ul>';
    bairroAtual.peixes.forEach(p => {
        htmlPeixes += `<li>${p.nome}: ${p.quantComprada}kg - ${p.sobra}kg = ${p.vendida}kg x R$${p.precoVenda} = R$${p.total.toFixed(2)}</li>`;
    });
    htmlPeixes += '</ul>';

    const f = bairroAtual.fechamento;
    let resultado = '';
    if (f.totalDeclarado === f.totalComTrocado) {
        resultado = '<span style="color:green;">✅ Caixa Bateu Certinho!</span>';
    } else {
        const diff = Math.abs(f.totalDeclarado - f.totalComTrocado).toFixed(2);
        resultado = `<span style="color:red;">❌ Diferença de R$ ${diff}</span>`;
    }

    rel.innerHTML += htmlPeixes;
    rel.innerHTML += `
        <h4>Resumo Financeiro:</h4>
        Total Vendas: R$${f.totalVendas.toFixed(2)}<br>
        Trocado: R$${f.trocado.toFixed(2)}<br>
        Total com Trocado: R$${f.totalComTrocado.toFixed(2)}<br>
        Declarado: R$${f.totalDeclarado.toFixed(2)}<br>
        ${resultado}
    `;
}

function novoBairro() {
    document.getElementById('prestacao-contas').classList.add('hidden');
    document.getElementById('selecao-bairro-dia').classList.remove('hidden');
    document.getElementById('peixes-lista').innerHTML = '';
    document.getElementById('trocado').value = '';
    document.getElementById('despesas').value = '';
    document.getElementById('especie').value = '';
    document.getElementById('cartao').value = '';
    document.getElementById('pix').value = '';
    bairroAtual = null;
}

function mostrarRelatorioFinal() {
    document.getElementById('prestacao-contas').classList.add('hidden');
    document.getElementById('relatorio-final').classList.remove('hidden');

    const resultado = {};
    const totaisPorPonto = {};

    bairrosData.forEach(b => {
        let grupo = b.bairro;
        if (grupo === 'piaui1' || grupo === 'piaui2') grupo = 'piaui';

        if (!resultado[grupo]) resultado[grupo] = {};
        if (!totaisPorPonto[grupo]) totaisPorPonto[grupo] = { vendida: 0, sobra: 0 };

        b.peixes.forEach(p => {
            if (!resultado[grupo][p.nome]) {
                resultado[grupo][p.nome] = { vendida: 0, sobra: 0 };
            }

            resultado[grupo][p.nome].vendida += p.vendida;
            resultado[grupo][p.nome].sobra += p.sobra;

            totaisPorPonto[grupo].vendida += p.vendida;
            totaisPorPonto[grupo].sobra += p.sobra;
        });
    });

    const rel = document.getElementById('relatorio-conteudo');
    rel.innerHTML = '';

    for (let grupo in resultado) {
        const nomeGrupo = grupo === 'piaui' ? 'Parque Piauí (1 + 2)' : grupo;
        rel.innerHTML += `<h3>${nomeGrupo}</h3><ul>`;

        for (let peixe in resultado[grupo]) {
            const dados = resultado[grupo][peixe];
            rel.innerHTML += `<li>${peixe}: ${dados.vendida.toFixed(2)} kg vendidos | ${dados.sobra.toFixed(2)} kg de sobra</li>`;
        }

        rel.innerHTML += `</ul>
            <p><strong>Total Vendido:</strong> ${totaisPorPonto[grupo].vendida.toFixed(2)} kg</p>
            <p><strong>Total de Sobra:</strong> ${totaisPorPonto[grupo].sobra.toFixed(2)} kg</p>
        <hr>`;
    }
}


function voltarParaSelecao() {
    document.getElementById('adicionar-peixes').classList.add('hidden');
    document.getElementById('selecao-bairro-dia').classList.remove('hidden');
}

function voltarParaPeixes() {
    document.getElementById('fechamento').classList.add('hidden');
    document.getElementById('adicionar-peixes').classList.remove('hidden');
}

function voltarParaFechamento() {
    document.getElementById('prestacao-contas').classList.add('hidden');
    document.getElementById('fechamento').classList.remove('hidden');
}

function voltarParaPrestacao() {
    document.getElementById('relatorio-final').classList.add('hidden');
    document.getElementById('prestacao-contas').classList.remove('hidden');
}
