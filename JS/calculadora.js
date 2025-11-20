class CalculadoraInterativa {
    constructor() {
        this.resultadosDiv = document.getElementById('calculadoraResultados');
        this.historicoLista = document.getElementById('historicoLista');
        this.historico = JSON.parse(localStorage.getItem('historicoCafe')) || [];
        
        this.graficoAtual = null;
        
        this.init();
    }

    init() {
        this.configurarValidacoes();
        this.atualizarHistoricoUI();
        window.calcularProporcaoCafe = this.calcularProporcaoCafe.bind(this);
        window.limparHistorico = this.limparHistorico.bind(this);
        window.calculadora = this;
        
        console.log('Calculadora de Proporção de Café inicializada!');
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
                
                this.limparResultados();
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
                    <path
                        d="M18.86 5.86c-1.39-1.39-3.22-2.14-5.14-2.14H9V2c0-.55-.45-1-1-1S7 1.45 7 2v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9.14c0-1.92-.75-3.75-2.14-5.14zM10 5h2.14c1.47 0 2.87.57 3.92 1.62.77.77 1.28 1.7 1.5 2.76H10V5zm9 14H5V5h3v4c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V5.17c.56.24 1.07.61 1.5 1.05V19z" />
                </svg>
                <h3>Aguardando Cálculo</h3>
                <p>Preencha os campos e clique em calcular para ver a proporção ideal</p>
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
                <button class="btn-acao" onclick="calculadora.limparResultados()">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                    Novo Cálculo
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

        localStorage.setItem('historicoCafe', JSON.stringify(this.historico));
        this.atualizarHistoricoUI();
    }

    atualizarHistoricoUI() {
        if (this.historico.length === 0) {
            this.historicoLista.innerHTML = '<p class="historico-vazio">Nenhum cálculo de café realizado ainda</p>';
            return;
        }

        let html = '';
        this.historico.forEach((item, index) => {
            // Detalhe principal para exibição no histórico
            const cafe = item.detalhes.find(d => d.label.includes('Café')).valor;
            const agua = item.detalhes.find(d => d.label.includes('Água')).valor;
            
            html += `
                <div class="historico-item">
                    <div class="historico-info">
                        <div class="historico-tipo">${this.obterTituloCalculo(item.tipo)}</div>
                        <div class="historico-resultado">☕ ${cafe} : 💧 ${agua}</div>
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

        let detalhes = item.detalhes.map(d => `${d.label}: ${d.valor}`).join('\n');

        alert(`Detalhes do Cálculo de Café:\n\nProporção: ${item.valor}\n\n${detalhes}\n\nData: ${item.data}`);
    }

    compartilharResultado() {
        const proporcao = this.resultadosDiv.querySelector('.resultado-valor')?.textContent;
        const cafeG = this.resultadosDiv.querySelector('.detalhe-item:nth-child(1) .detalhe-valor')?.textContent;
        const aguaML = this.resultadosDiv.querySelector('.detalhe-item:nth-child(2) .detalhe-valor')?.textContent;

        if (!proporcao || !cafeG || !aguaML) {
            alert('Calcule a proporção antes de compartilhar!');
            return;
        }

        const texto = `Minha Proporção de Café na Bean Scene:\nProporção: 1:${proporcao}\n- Café: ${cafeG}\n- Água: ${aguaML}\n#BeanSceneCoffee`;

        if (navigator.share) {
            navigator.share({
                title: 'Calculadora de Proporção de Café',
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
            'cafe': 'Resultado da Proporção de Café'
        };
        return titulos[tipo] || 'Cálculo';
    }

    validarInputs(ids) {
        let isValid = true;
        for (let id of ids) {
            const elemento = document.getElementById(id);
            if (!elemento) continue;

            const valor = elemento.value.trim();
            
            if (valor === '' || valor === null || parseFloat(valor) <= 0) {
                elemento.focus();
                elemento.style.borderColor = '#dc3545';
                alert(`Por favor, preencha o campo: ${elemento.previousElementSibling?.textContent || id} com um valor válido.`);
                isValid = false;
                break; 
            }

            if (elemento.type === 'number') {
                const num = parseFloat(valor);
                const min = parseFloat(elemento.min);
                const max = parseFloat(elemento.max);

                if (isNaN(num) || num < min || num > max) {
                    elemento.focus();
                    elemento.style.borderColor = '#dc3545';
                    alert(`Valor inválido no campo: ${elemento.previousElementSibling?.textContent || id}`);
                    isValid = false;
                    break;
                }
            }
            elemento.style.borderColor = '';
        }
        return isValid;
    }

    calcularProporcaoCafe() {
        if (!this.validarInputs(['proporcao-cafe'])) {
            return;
        }

        const proporcaoDesejada = parseFloat(document.getElementById('proporcao-cafe').value);
        const cafeGInput = document.getElementById('cafe-g');
        const aguaMLInput = document.getElementById('agua-ml');
        
        let cafeG = parseFloat(cafeGInput.value) || 0;
        let aguaML = parseFloat(aguaMLInput.value) || 0;
        
        let resultadoProporcao;
        let cafeCalculado = 0;
        let aguaCalculada = 0;
        
        if (cafeG > 0 && aguaML === 0) {
            aguaCalculada = cafeG * proporcaoDesejada;
            cafeCalculado = cafeG;
            resultadoProporcao = proporcaoDesejada;
            
        } else if (aguaML > 0 && cafeG === 0) {
            cafeCalculado = aguaML / proporcaoDesejada;
            aguaCalculada = aguaML;
            resultadoProporcao = proporcaoDesejada;
            
        } else if (cafeG > 0 && aguaML > 0) {
            resultadoProporcao = aguaML / cafeG;
            cafeCalculado = cafeG;
            aguaCalculada = aguaML;
        } else {
            alert('Por favor, preencha a quantidade de Café (g) ou Água (ml) para calcular a proporção.');
            return;
        }

        // Determinar classificação
        let classificacao = '';
        let classe = '';
        
        if (resultadoProporcao >= 14 && resultadoProporcao <= 18) {
            classificacao = 'Proporção Ideal (Golden Ratio)';
            classe = 'classificacao-normal';
        } else if ((resultadoProporcao > 18 && resultadoProporcao <= 20) || (resultadoProporcao >= 12 && resultadoProporcao < 14)) {
            classificacao = 'Proporção Aceitável';
            classe = 'classificacao-alerta';
        } else {
            classificacao = 'Proporção Extrema';
            classe = 'classificacao-perigo';
        }

        const cafeFinal = cafeCalculado.toFixed(1);
        const aguaFinal = aguaCalculada.toFixed(0);

        const dados = {
            tipo: 'cafe',
            valor: `1:${resultadoProporcao.toFixed(1)}`,
            classificacao: {
                texto: classificacao,
                classe: classe
            },
            detalhes: [
                { label: 'Café (g)', valor: `${cafeFinal} g` },
                { label: 'Água (ml)', valor: `${aguaFinal} ml` },
                { label: 'Proporção Desejada', valor: `1:${proporcaoDesejada}` }
            ],
            grafico: {
                tipo: 'pie',
                label: 'Distribuição de Café e Água',
                labels: ['Café (g)', 'Água (ml)'],
                valores: [cafeCalculado, aguaCalculada],
                cores: [
                    'rgba(139, 69, 19, 0.7)',
                    'rgba(102, 126, 234, 0.7)'
                ],
                coresBorda: [
                    'rgba(139, 69, 19, 1)',
                    'rgba(102, 126, 234, 1)'
                ]
            }
        };

        this.exibirResultado(dados);
    }

    limparHistorico() {
        if (confirm('Tem certeza que deseja limpar todo o histórico de cálculos de café?')) {
            this.historico = [];
            localStorage.removeItem('historicoCafe');
            this.atualizarHistoricoUI();
            alert('Histórico de cálculos limpo!');
        }
    }
}

let calculadora;

document.addEventListener('DOMContentLoaded', () => {
    calculadora = new CalculadoraInterativa();
});