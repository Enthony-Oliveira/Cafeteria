const hamburgerBtn = document.querySelector('.hamburger-btn');
const navLinks = document.querySelector('.nav-links');

hamburgerBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    hamburgerBtn.classList.toggle('is-open');
});

const filtros = document.querySelectorAll('.filtro-btn');
const itens = document.querySelectorAll('.galeria-item');

filtros.forEach(btn => {
    btn.addEventListener('click', function () {
        filtros.forEach(f => f.classList.remove('ativo'));
        this.classList.add('ativo');

        const filtro = this.getAttribute('data-filtro');

        itens.forEach(item => {
            if (filtro === 'todos' || item.getAttribute('data-categoria') === filtro) {
                item.style.display = 'block';
                item.style.animation = 'fadeIn 0.5s';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

const modal = document.getElementById('modalGaleria');
const modalImg = document.getElementById('modalImagem');
const modalCaption = document.getElementById('modalCaption');
const verMaisBtns = document.querySelectorAll('.btn-ver-mais');
const fecharModal = document.querySelector('.fechar-modal');

verMaisBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const item = this.closest('.galeria-item');
        const img = item.querySelector('img');
        const titulo = item.querySelector('h3').textContent;
        const descricao = item.querySelector('p').textContent;

        modal.style.display = 'block';
        modalImg.src = img.src;
        modalCaption.innerHTML = `<h3>${titulo}</h3><p>${descricao}</p>`;
    });
});

fecharModal.onclick = function () {
    modal.style.display = 'none';
}

modal.onclick = function (e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
}

const contadores = document.querySelectorAll('.stat-numero');
const velocidade = 200;

function iniciarContador(contador) {
    const alvo = +contador.getAttribute('data-target');
    const incremento = alvo / velocidade;

    function atualizarContador() {
        const atual = +contador.innerText;

        if (atual < alvo) {
            contador.innerText = Math.ceil(atual + incremento);
            setTimeout(atualizarContador, 1);
        } else {
            contador.innerText = alvo;
        }
    }

    atualizarContador();
}

const observador = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const contador = entry.target;
            if (contador.innerText === '0') {
                iniciarContador(contador);
            }
        }
    });
});

contadores.forEach(contador => {
    observador.observe(contador);
});

const style = document.createElement('style');
style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
document.head.appendChild(style);

const filtrosBlog = document.querySelectorAll('.filtro-blog');
const artigos = document.querySelectorAll('.artigo-card, .artigo-destaque');

filtrosBlog.forEach(btn => {
    btn.addEventListener('click', function () {
        filtrosBlog.forEach(f => f.classList.remove('ativo'));
        this.classList.add('ativo');

        const categoria = this.getAttribute('data-categoria');

        artigos.forEach(artigo => {
            if (categoria === 'todas' || artigo.getAttribute('data-categoria') === categoria) {
                artigo.style.display = 'block';
                artigo.style.animation = 'fadeIn 0.5s';
            } else {
                artigo.style.display = 'none';
            }
        });
    });
});

const searchInput = document.getElementById('searchInput');
const searchBtn = document.querySelector('.search-btn');

function pesquisarArtigos() {
    const termo = searchInput.value.toLowerCase();

    artigos.forEach(artigo => {
        const titulo = artigo.querySelector('h2, h3').textContent.toLowerCase();
        const resumo = artigo.querySelector('p').textContent.toLowerCase();

        if (titulo.includes(termo) || resumo.includes(termo) || termo === '') {
            artigo.style.display = 'block';
        } else {
            artigo.style.display = 'none';
        }
    });
}

searchInput.addEventListener('input', pesquisarArtigos);
searchBtn.addEventListener('click', pesquisarArtigos);

const pageBtns = document.querySelectorAll('.page-btn');

pageBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        if (!this.classList.contains('active')) {
            pageBtns.forEach(p => p.classList.remove('active'));
            if (this.getAttribute('data-page') !== 'prev' && this.getAttribute('data-page') !== 'next') {
                this.classList.add('active');
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});

const newsletterForm = document.querySelector('.newsletter-form');
newsletterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = this.querySelector('input').value;
    alert('Obrigado! Email ' + email + ' cadastrado com sucesso!');
    this.reset();
});

// const observador = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//         if (entry.isIntersecting) {
//             entry.target.style.animation = 'slideInUp 0.6s ease forwards';
//         }
//     });
// });

document.querySelectorAll('.artigo-card').forEach(card => {
    observador.observe(card);
});