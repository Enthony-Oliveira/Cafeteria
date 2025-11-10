class CalculadoraInterativa {
    constructor() {
        this.resultadosDiv = document.getElementById('calculadoraResultados');
        this.historicoLista = document.getElementById('historicoLista');
        
        this.historico = [];
        
        this.graficoAtual = null;
        
        this.init();
    }

    init() {
        this.configurarSeletorTipo();
        
        this.configurarValidacoes();
        
        console.log('Calculadora inicializada!');
    }

    configurarSeletorTipo() {
        const botoes = document.querySelectorAll('.tipo-btn');
        const secoes = document.querySelectorAll('.calc-section');

        botoes.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover active de todos
                botoes.forEach(b => b.classList.remove('active'));
                secoes.forEach(s => s.classList.remove('active'));

                btn.classList.add('active');
                const tipo = btn.getAttribute('data-tipo');
                const secao = document.querySelector(`[data-section="${tipo}"]`);
                
                if (secao) {
                    secao.classList.add('active');
                }

                this.limparResultados();
            });
        });
    }

    configurarValidacoes() {
        const inputs = document.querySelectorAll('input[type="number"]');
        
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const valor = parseFloat(e.target.value);
                const min = parseFloat(e.target.min);
                const max = parseFloat(e.target.max);

                if (valor < min || valor > max) {
                    e.target.style.borderColor = '#dc3545';
                } else {
                    e.target.style.borderColor = '';
                }
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === '-' && input.min >= 0) {
                    e.preventDefault();
                }
            });
        });
    }

    limparResultados() {
        this.resultadosDiv.innerHTML = `
            <div class="placeholder-resultado">
                <svg viewBox="0 0 24 24" fill="currentColor" class="calc-icon">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <h3>Aguardando Cálculo</h3>
                <p>Preencha os campos e clique em calcular para ver os resultados</p>
            </div>
        `;

        if (this.graficoAtual) {
            this.graficoAtual.destroy();
            this.graficoAtual = null;
        }
    }

    exibirResultado(dados) {
        const { tipo, valor, classificacao, detalhes, grafico } = dados;

        let html = `
            <div class="resultado-visivel">
                <div class="resultado-header">
                    <h3>${this.obterTituloCalculo(tipo)}</h3>
                    <div class="resultado-valor">${valor}</div>
                    ${classificacao ? `<span class="resultado-classificacao ${classificacao.classe}">${classificacao.texto}</span>` : ''}
                </div>
        `;

        if (detalhes && detalhes.length > 0) {
            html += '<div class="resultado-detalhes">';
            detalhes.forEach(detalhe => {
                html += `
                    <div class="detalhe-item">
                        <span class="detalhe-label">${detalhe.label}</span>
                        <span class="detalhe-valor">${detalhe.valor}</span>
                    </div>
                `;
            });
            html += '</div>';
        }

        if (grafico) {
            html += `
                <div class="resultado-grafico">
                    <canvas id="graficoResultado"></canvas>
                </div>
            `;
        }

        html += `
            <div class="resultado-acoes">
                <button class="btn-acao" onclick="calculadora.compartilharResultado()">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                    </svg>
                    Compartilhar
                </button>
                <button class="btn-acao" onclick="calcularIMC(); calcularCalorias(); calcularRacao();">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                    Recalcular
                </button>
            </div>
        `;

        html += '</div>';

        this.resultadosDiv.innerHTML = html;

        if (grafico) {
            setTimeout(() => this.criarGrafico(grafico), 100);
        }

        this.adicionarAoHistorico(dados);
    }

    criarGrafico(dados) {
        const canvas = document.getElementById('graficoResultado');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.graficoAtual) {
            this.graficoAtual.destroy();
        }

        this.graficoAtual = new Chart(ctx, {
            type: dados.tipo || 'bar',
            data: {
                labels: dados.labels,
                datasets: [{
                    label: dados.label,
                    data: dados.valores,
                    backgroundColor: dados.cores || [
                        'rgba(102, 126, 234, 0.2)',
                        'rgba(40, 167, 69, 0.2)',
                        'rgba(255, 193, 7, 0.2)',
                        'rgba(220, 53, 69, 0.2)'
                    ],
                    borderColor: dados.coresBorda || [
                        'rgba(102, 126, 234, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(220, 53, 69, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    adicionarAoHistorico(dados) {
        const item = {
            tipo: dados.tipo,
            valor: dados.valor,
            data: new Date().toLocaleString('pt-BR'),
            detalhes: dados.detalhes
        };

        this.historico.unshift(item); 

        if (this.historico.length > 10) {
            this.historico.pop();
        }

        this.atualizarHistoricoUI();
    }

    atualizarHistoricoUI() {
        if (this.historico.length === 0) {
            this.historicoLista.innerHTML = '<p class="historico-vazio">Nenhum cálculo realizado ainda</p>';
            return;
        }

        let html = '';
        this.historico.forEach((item, index) => {
            html += `
                <div class="historico-item">
                    <div class="historico-info">
                        <div class="historico-tipo">${this.obterTituloCalculo(item.tipo)}</div>
                        <div class="historico-resultado">${item.valor}</div>
                        <div class="historico-data">${item.data}</div>
                    </div>
                    <button class="btn-ver-historico" onclick="calculadora.verDetalheHistorico(${index})">
                        Ver Detalhes
                    </button>
                </div>
            `;
        });

        this.historicoLista.innerHTML = html;
    }

    verDetalheHistorico(index) {
        const item = this.historico[index];
        if (!item) return;

        alert(`Detalhes do Cálculo:\n\nTipo: ${this.obterTituloCalculo(item.tipo)}\nResultado: ${item.valor}\nData: ${item.data}`);
    }

    compartilharResultado() {
        const resultadoTexto = this.resultadosDiv.querySelector('.resultado-valor')?.textContent;
        const tipoCalculo = this.resultadosDiv.querySelector('.resultado-header h3')?.textContent;

        if (!resultadoTexto) return;

        const texto = `Meu resultado de ${tipoCalculo}: ${resultadoTexto}`;

        if (navigator.share) {
            navigator.share({
                title: tipoCalculo,
                text: texto
            }).catch(err => console.log('Erro ao compartilhar:', err));
        } else {
            navigator.clipboard.writeText(texto).then(() => {
                alert('Resultado copiado para área de transferência!');
            });
        }
    }

    obterTituloCalculo(tipo) {
        const titulos = {
            'imc': 'Cálculo de IMC',
            'calorias': 'Gasto Calórico Diário',
            'racao': 'Quantidade de Ração'
        };
        return titulos[tipo] || 'Cálculo';
    }

    validarInputs(ids) {
        for (let id of ids) {
            const elemento = document.getElementById(id);
            if (!elemento) continue;

            const valor = elemento.value.trim();
            
            if (valor === '' || valor === null) {
                elemento.focus();
                elemento.style.borderColor = '#dc3545';
                alert(`Por favor, preencha o campo: ${elemento.previousElementSibling?.textContent || id}`);
                return false;
            }

            if (elemento.type === 'number') {
                const num = parseFloat(valor);
                const min = parseFloat(elemento.min);
                const max = parseFloat(elemento.max);

                if (isNaN(num) || num < min || num > max) {
                    elemento.focus();
                    elemento.style.borderColor = '#dc3545';
                    alert(`Valor inválido no campo: ${elemento.previousElementSibling?.textContent || id}`);
                    return false;
                }
            }
        }
        return true;
    }
}

let calculadora;

document.addEventListener('DOMContentLoaded', () => {
    calculadora = new CalculadoraInterativa();
});

function calcularIMC() {
    if (!calculadora.validarInputs(['peso', 'altura'])) {
        return;
    }

    const peso = parseFloat(document.getElementById('peso').value);
    const alturaEmCm = parseFloat(document.getElementById('altura').value);
    const alturaEmMetros = alturaEmCm / 100;

    const imc = peso / (alturaEmMetros * alturaEmMetros);

    let classificacao = '';
    let classe = '';
    let faixas = [];

    if (imc < 18.5) {
        classificacao = 'Abaixo do peso';
        classe = 'classificacao-alerta';
    } else if (imc >= 18.5 && imc < 25) {
        classificacao = 'Peso normal';
        classe = 'classificacao-normal';
    } else if (imc >= 25 && imc < 30) {
        classificacao = 'Sobrepeso';
        classe = 'classificacao-alerta';
    } else if (imc >= 30 && imc < 35) {
        classificacao = 'Obesidade Grau I';
        classe = 'classificacao-perigo';
    } else if (imc >= 35 && imc < 40) {
        classificacao = 'Obesidade Grau II';
        classe = 'classificacao-perigo';
    } else {
        classificacao = 'Obesidade Grau III';
        classe = 'classificacao-perigo';
    }

    const pesoIdealMin = 18.5 * (alturaEmMetros * alturaEmMetros);
    const pesoIdealMax = 24.9 * (alturaEmMetros * alturaEmMetros);

    const dados = {
        tipo: 'imc',
        valor: imc.toFixed(1),
        classificacao: {
            texto: classificacao,
            classe: classe
        },
        detalhes: [
            { label: 'Peso Atual', valor: `${peso.toFixed(1)} kg` },
            { label: 'Altura', valor: `${alturaEmCm} cm` },
            { label: 'Peso Ideal', valor: `${pesoIdealMin.toFixed(1)} - ${pesoIdealMax.toFixed(1)} kg` }
        ],
        grafico: {
            tipo: 'bar',
            label: 'Classificação IMC',
            labels: ['Abaixo', 'Normal', 'Sobrepeso', 'Obesidade'],
            valores: [18.5, 24.9, 29.9, imc > 30 ? imc : 30],
            cores: [
                imc < 18.5 ? 'rgba(255, 193, 7, 0.6)' : 'rgba(255, 193, 7, 0.2)',
                imc >= 18.5 && imc < 25 ? 'rgba(40, 167, 69, 0.6)' : 'rgba(40, 167, 69, 0.2)',
                imc >= 25 && imc < 30 ? 'rgba(255, 193, 7, 0.6)' : 'rgba(255, 193, 7, 0.2)',
                imc >= 30 ? 'rgba(220, 53, 69, 0.6)' : 'rgba(220, 53, 69, 0.2)'
            ]
        }
    };

    calculadora.exibirResultado(dados);
}

function calcularCalorias() {
    if (!calculadora.validarInputs(['peso-cal', 'altura-cal', 'idade', 'sexo', 'atividade'])) {
        return;
    }

    const peso = parseFloat(document.getElementById('peso-cal').value);
    const altura = parseFloat(document.getElementById('altura-cal').value);
    const idade = parseInt(document.getElementById('idade').value);
    const sexo = document.getElementById('sexo').value;
    const nivelAtividade = parseFloat(document.getElementById('atividade').value);
    let tmb;
    if (sexo === 'masculino') {
        tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * idade);
    } else {
        tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * idade);
    }

    const tdee = tmb * nivelAtividade;

    const manutencao = tdee;
    const perderPeso = tdee - 500;
    const ganharPeso = tdee + 500;

    const nivelAtividadeTexto = document.getElementById('atividade').options[document.getElementById('atividade').selectedIndex].text;

    const dados = {
        tipo: 'calorias',
        valor: `${Math.round(tdee)} kcal/dia`,
        classificacao: {
            texto: 'Gasto Estimado',
            classe: 'classificacao-normal'
        },
        detalhes: [
            { label: 'TMB (repouso)', valor: `${Math.round(tmb)} kcal` },
            { label: 'TDEE (total)', valor: `${Math.round(tdee)} kcal` },
            { label: 'Para perder peso', valor: `${Math.round(perderPeso)} kcal` },
            { label: 'Para ganhar peso', valor: `${Math.round(ganharPeso)} kcal` },
            { label: 'Nível de atividade', valor: nivelAtividadeTexto }
        ],
        grafico: {
            tipo: 'bar',
            label: 'Calorias por Objetivo',
            labels: ['Perder Peso', 'Manutenção', 'Ganhar Peso'],
            valores: [Math.round(perderPeso), Math.round(manutencao), Math.round(ganharPeso)],
            cores: [
                'rgba(220, 53, 69, 0.6)',
                'rgba(40, 167, 69, 0.6)',
                'rgba(102, 126, 234, 0.6)'
            ]
        }
    };

    calculadora.exibirResultado(dados);
}

function calcularRacao() {
    // Validar inputs
    if (!calculadora.validarInputs(['peso-pet', 'idade-pet', 'atividade-pet'])) {
        return;
    }

    const pesoPet = parseFloat(document.getElementById('peso-pet').value);
    const idadePet = document.getElementById('idade-pet').value;
    const atividadePet = document.getElementById('atividade-pet').value;

    let percentualBase = 2.5;

    if (idadePet === 'filhote') {
        percentualBase = 4.0;
    } else if (idadePet === 'senior') {
        percentualBase = 2.0;
    }

    if (atividadePet === 'baixa') {
        percentualBase *= 0.9;
    } else if (atividadePet === 'alta') {
        percentualBase *= 1.2;
    }

    const quantidadeDiaria = (pesoPet * 1000 * percentualBase) / 100;
    const quantidadePorRefeicao = quantidadeDiaria / 2;
    const quantidadeMensal = (quantidadeDiaria * 30) / 1000;

    let classificacaoPeso = '';
    if (pesoPet < 5) {
        classificacaoPeso = 'Porte Pequeno';
    } else if (pesoPet >= 5 && pesoPet < 15) {
        classificacaoPeso = 'Porte Médio';
    } else if (pesoPet >= 15 && pesoPet < 30) {
        classificacaoPeso = 'Porte Grande';
    } else {
        classificacaoPeso = 'Porte Gigante';
    }

    const dados = {
        tipo: 'racao',
        valor: `${Math.round(quantidadeDiaria)}g/dia`,
        classificacao: {
            texto: classificacaoPeso,
            classe: 'classificacao-normal'
        },
        detalhes: [
            { label: 'Peso do Pet', valor: `${pesoPet} kg` },
            { label: 'Por Refeição (2x/dia)', valor: `${Math.round(quantidadePorRefeicao)}g` },
            { label: 'Consumo Mensal', valor: `${quantidadeMensal.toFixed(1)} kg` },
            { label: 'Fase da Vida', valor: idadePet.charAt(0).toUpperCase() + idadePet.slice(1) },
            { label: 'Atividade', valor: atividadePet.charAt(0).toUpperCase() + atividadePet.slice(1) }
        ],
        grafico: {
            tipo: 'doughnut',
            label: 'Distribuição Diária',
            labels: ['Manhã', 'Noite', 'Petiscos (10%)'],
            valores: [
                Math.round(quantidadePorRefeicao),
                Math.round(quantidadePorRefeicao),
                Math.round(quantidadeDiaria * 0.1)
            ],
            cores: [
                'rgba(255, 193, 7, 0.6)',
                'rgba(102, 126, 234, 0.6)',
                'rgba(40, 167, 69, 0.6)'
            ]
        }
    };

    calculadora.exibirResultado(dados);
}

function limparHistorico() {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        calculadora.historico = [];
        calculadora.atualizarHistoricoUI();
    }
}