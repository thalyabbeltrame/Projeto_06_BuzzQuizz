// Tela 1 - Lista de quizzes
const API = 'https://mock-api.driven.com.br/api/v4/buzzquizz';
let idQuizzUsuario = 0000;

obterQuizzes();
//const idObterQuizzes = setInterval(obterQuizzes, 10000);

function obterQuizzes() {
  const promise = axios.get(`${API}/quizzes`);
  promise.then((response) => {
    console.log('Consegui obter os quizzes da API!');
    separarQuizzesUsuario(response.data);
  });
  promise.catch(() => {
    console.log('Não consegui obter os quizzes da API!');
  });
}

function separarQuizzesUsuario(quizzes) {
  let listaQuizzesTodos = '';
  let listaQuizzesUsuario = '';

  quizzes.forEach((el) => {
    if (el.id !== idQuizzUsuario) {
      listaQuizzesTodos += `
      <div class="quizz" name="${el.id}" onclick="abrirQuizz(this)">
        <img src="${el.image}"/>
        <h6>${el.title}</h6>
      </div>
      `;
    } else {
      listaQuizzesUsuario += `
      <div class="quizz" name="${el.id}" onclick="abrirQuizz(this)">
        <img src="${el.image}"/>
        <h6>${el.title}</h6>
      </div>
      `;
    }
  });
  renderizarListaQuizzes(listaQuizzesUsuario, listaQuizzesTodos);
}

function renderizarListaQuizzes(quizzesUsuario, quizzesTodos) {
  console.log('Entrei em renderizar!');
  const elUsuarioVazio = document.querySelector('.quizzes-usuario-vazio');
  const elCabecalhoUsuario = document.querySelector('.cabecalho-quizzes-usuario');
  const elQuizzesUsuario = document.querySelector('.quizzes-usuario');
  const elQuizzesTodos = document.querySelector('.quizzes-todos');

  elQuizzesTodos.innerHTML = quizzesTodos;

  if (quizzesUsuario !== '') {
    elUsuarioVazio.classList.add('ocultar');
    elQuizzesUsuario.innerHTML = quizzesUsuario;
    elQuizzesUsuario.classList.remove('ocultar');
    elCabecalhoUsuario.classList.remove('ocultar');
  } else if (quizzesUsuario === '' && elUsuarioVazio.classList.contains('ocultar') === true) {
    elUsuarioVazio.classList.remove('ocultar');
    elQuizzesUsuario.classList.add('ocultar');
    elCabecalhoUsuario.classList.add('ocultar');
  }
}

// function abrirPaginaQuizz(el){

// }

function criarQuizz() {
  const elCriacaoQuizz = document.querySelector('.criacao-quizz');
  const elListaQuizzes = document.querySelector('.lista-quizzes');

  elCriacaoQuizz.classList.remove('ocultar');
  elListaQuizzes.classList.add('ocultar');
}

// Tela 2 - Página de um quizz

let nRespostasCorretas = 0;
let quizzAtualHtml = null;
let quizzAtual = {};

function abrirQuizz(elemento) {
  quizzAtualHtml = elemento;
  idQuizzAtual = elemento.getAttribute('name');
  axios
    .get(`${API}/quizzes/${idQuizzAtual}`)
    .then((resposta) => {
      quizzAtual = resposta.data;
      renderizarQuizz(quizzAtual);
    })
    .catch((erro) => {
      console.log(erro);
    });
}

function renderizarQuizz(quizz) {
  const banner = document.querySelector('.pagina-quizz main .banner');
  banner.style.background = `linear-gradient(0, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${quizz.image})`;
  banner.style.backgroundPosition = 'center';
  banner.style.backgroundSize = 'cover';
  banner.innerHTML = `<span>${quizz.title}</span>`;

  renderizarPerguntas(quizz.questions);

  document.querySelector('.lista-quizzes').classList.add('ocultar');
  document.querySelector('.pagina-quizz').classList.remove('ocultar');
}

function renderizarPerguntas(questoes) {
  let perguntas = document.querySelector('.pagina-quizz main .perguntas');
  perguntas.innerHTML = '';
  questoes.forEach((questao) => {
    perguntas.innerHTML += `
    <li class="pergunta">
        <div class="titulo" style="background-color: ${questao.color}">
            <span>${questao.title}</span>
        </div>
        <ul class="respostas">${renderizarRespostas(questao.answers)}</ul>
    </li>`;
  });
}

function renderizarRespostas(respostas) {
  const respostasEmbaralhadas = embaralharRespostas(respostas);
  let respostasHtml = '';
  respostasEmbaralhadas.forEach((resposta) => {
    const corretaOuIncorreta = resposta.isCorrectAnswer ? 'correta' : 'incorreta';
    respostasHtml += `
    <li class="resposta ${corretaOuIncorreta}" onclick="selecionarResposta(this)">
        <img src="${resposta.image}">
        <span>${resposta.text}</span>
    </li>`;
  });
  return respostasHtml;
}

function embaralharRespostas(respostas) {
  return respostas.sort(() => Math.random() - 0.5);
}

function selecionarResposta(element) {
  element.parentElement.parentElement.classList.add('selecionada');
  const listaDeRespostas = element.parentElement.querySelectorAll('.resposta');
  listaDeRespostas.forEach((resposta) => {
    resposta.removeAttribute('onclick');
    resposta.classList.add('mostrar');
    if (resposta !== element) resposta.classList.add('opaca');
  });
  checarSeRespostaEhCorreta(element);
  setTimeout(rolarParaProximaPergunta, 2000);
}

function checarSeRespostaEhCorreta(element) {
  if (element.classList.contains('correta')) nRespostasCorretas++;
}

function rolarParaProximaPergunta() {
  const perguntaAtual = document.querySelector('.pergunta.selecionada');
  const proximaPergunta = perguntaAtual.nextElementSibling;
  if (proximaPergunta !== null) {
    proximaPergunta.scrollIntoView({ block: 'center', behavior: 'smooth' });
  } else {
    renderizarResultado();
    renderizarBotoesDeNavegacao();
  }
  perguntaAtual.classList.remove('selecionada');
}

function renderizarResultado() {
  const nPerguntas = quizzAtual.questions.length;
  const percentualAcerto = Math.round((nRespostasCorretas / nPerguntas) * 100);
  const nivel = definirNivel(percentualAcerto);
  const resultadoHtml = document.querySelector('.pagina-quizz main .finalizacao');
  resultadoHtml.innerHTML = `
  <div class="titulo">
    <span>${percentualAcerto}% de acerto: ${nivel.title}</span>
  </div>
  <div>
    <img src="${nivel.image}">
    <div class="texto">
      <span>${nivel.text}</span>
    </div>
  </div>
  `;
  resultadoHtml.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function definirNivel(percentual) {
  const niveisOrdenados = quizzAtual.levels.sort((a, b) => a.minValue - b.minValue);
  const indiceNivel = niveisOrdenados.findIndex((nivel) => percentual < nivel.minValue);
  let nivelCorreto;
  if (indiceNivel === -1) {
    nivelCorreto = niveisOrdenados[niveisOrdenados.length - 1];
  } else {
    nivelCorreto = niveisOrdenados[indiceNivel - 1];
  }
  return nivelCorreto;
}

// Tela 3 - Criar um quizz

// function validarInformacoesIniciais() {
//   const informacoesBasicas = document.querySelector(".informacoes-basicas-quizz");

//   const tituloQuizz = informacoesBasicas.querySelector("input:first-child");
//   const urlImagem = informacoesBasicas.querySelector("input:nth-child(2)");

// }
function renderizarBotoesDeNavegacao() {
  const navegacao = document.querySelector('.pagina-quizz main .navegacao');
  navegacao.innerHTML = `
  <button class="reiniciar-btn" onclick="reiniciarQuizz()">
    <span>Reiniciar Quizz</span>
  </button>
  <button class="home-btn" onclick="voltarParaHome()">
    <span>Voltar para home</span>
  </button>
  `;
}

function reiniciarQuizz() {
  document.querySelector('.pagina-quizz main .pergunta').scrollIntoView({
    block: 'center',
    behavior: 'smooth',
  });
  nRespostasCorretas = 0;
  abrirQuizz(quizzAtualHtml);
  limparResultado();
  limparNavegacao();
}

function limparResultado() {
  document.querySelector('.pagina-quizz main .finalizacao').innerHTML = '';
}

function limparNavegacao() {
  document.querySelector('.pagina-quizz main .navegacao').innerHTML = '';
}

function voltarParaHome() {
  nRespostasCorretas = 0;
  limparResultado();
  limparNavegacao();
  document.querySelector('.pagina-quizz').classList.add('ocultar');
  document.querySelector('.lista-quizzes').classList.remove('ocultar');
}

renderizarFormPerguntas(3); //exemplo de como renderizar 3 perguntas

function renderizarFormPerguntas(nPerguntas) {
  for (let i = 0; i < nPerguntas; i++) {
    document.querySelector('.criacao-perguntas-quizz div').innerHTML += `
    <div>
      <h4>Pergunta ${i + 1}</h4>
      <ion-icon name="create-outline" onclick="expandirForm(this)"></ion-icon>
    </div>
    `;
  }
}

function expandirForm(element) {
  const form = element.parentElement;
  form.style.flexDirection = 'column';
  form.style.alignItems = 'flex-start';
  form.innerHTML = `
  <h4>${form.querySelector('h4').innerText}</h4>
  <ul>
    <li><input type="text" placeholder="Texto da pergunta"></li>
    <li><input type="text" placeholder="Cor de fundo da pergunta"></li>
  </ul>
  <h4>Resposta correta</h4>
  <ul>
    <li><input type="text" placeholder="Resposta correta"></li>
    <li><input type="text" placeholder="URL da imagem"></li>
  </ul>
  <h4>Respostas incorretas</h4>
  <ul>
    <li><input type="text" placeholder="Resposta incorreta 1"></li>
    <li><input type="text" class="url" placeholder="URL da imagem 1"></li>
    <li><input type="text" placeholder="Resposta incorreta 2">
    <li><input type="text" class="url" placeholder="URL da imagem 2"></li>
    <li><input type="text" placeholder="Resposta incorreta 3">
    <li><input type="text" class="url" placeholder="URL da imagem 3"></li>
  </ul>
  `;
}
