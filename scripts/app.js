const API = 'https://mock-api.driven.com.br/api/v4/buzzquizz';
const GRAD_IMG_QUIZZ = '180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.5) 64.58%, #000000 100%';
const GRAD_IMG_BANNER = '0, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)';
const OPCOES_SCROLL = { block: 'start', behavior: 'smooth' };

let idQuizzUsuario = null;
let nRespostasCorretas = 0;
let elQuizzAtual = null;
let quizzAtual = {};

obterQuizzes();

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
        <div class="imagem" style="
          background: linear-gradient(${GRAD_IMG_QUIZZ}), url(${el.image}); 
          background-position: center; 
          background-size: cover">
        </div>
        <h6>${el.title}</h6>
      </div>
      `;
    } else {
      listaQuizzesUsuario += `
      <div class="quizz" name="${el.id}" onclick="abrirQuizz(this)">
        <div class="imagem" 
          style="
          background: linear-gradient(${GRAD_IMG_QUIZZ}), url(${el.image}); 
          background-position: center; 
          background-size: cover">
        </div>
        <h6>${el.title}</h6>
      </div>
      `;
    }
  });
  renderizarListaQuizzes(listaQuizzesUsuario, listaQuizzesTodos);
}

function renderizarListaQuizzes(quizzesUsuario, quizzesTodos) {
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

function criarQuizz() {
  const elCriacaoQuizz = document.querySelector('.criacao-quizz');
  const elListaQuizzes = document.querySelector('.lista-quizzes');

  elCriacaoQuizz.classList.remove('ocultar');
  elListaQuizzes.classList.add('ocultar');
}

function abrirQuizz(elemento) {
  elQuizzAtual = elemento;
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
  const elListaQuizzes = document.querySelector('.lista-quizzes');
  const elPaginaQuizz = document.querySelector('.pagina-quizz');
  banner.style.background = `linear-gradient(${GRAD_IMG_BANNER}), url(${quizz.image})`;
  banner.style.backgroundPosition = 'center';
  banner.style.backgroundSize = 'cover';
  banner.innerHTML = `<span>${quizz.title}</span>`;

  renderizarPerguntas(quizz.questions);

  elListaQuizzes.classList.add('ocultar');
  elPaginaQuizz.classList.remove('ocultar');
  banner.scrollIntoView(OPCOES_SCROLL);
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
  let elRespostas = '';
  respostasEmbaralhadas.forEach((resposta) => {
    const corretaOuIncorreta = resposta.isCorrectAnswer ? 'correta' : 'incorreta';
    elRespostas += `
    <li class="resposta ${corretaOuIncorreta}" onclick="selecionarResposta(this)">
        <img src="${resposta.image}">
        <span>${resposta.text}</span>
    </li>`;
  });
  return elRespostas;
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
    proximaPergunta.scrollIntoView(OPCOES_SCROLL);
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
  const elResultado = document.querySelector('.pagina-quizz main .finalizacao');
  elResultado.innerHTML = `
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
  elResultado.scrollIntoView(OPCOES_SCROLL);
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
  document.querySelector('.pagina-quizz main .pergunta').scrollIntoView(OPCOES_SCROLL);
  nRespostasCorretas = 0;
  abrirQuizz(elQuizzAtual);
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

function coletarInformacoesIniciais() {
  const informacoesBasicas = document.querySelector('.informacoes-basicas-quizz');
  const tituloQuizz = informacoesBasicas.querySelector('.titulo-quizz').value;
  const urlImagem = informacoesBasicas.querySelector('.url-imagem').value;
  const perguntasQuizz = informacoesBasicas.querySelector('.perguntas-quizz').value;
  const niveisQuizz = informacoesBasicas.querySelector('.niveis-quizz').value;

  let novoQuizz = {
    title: '',
    image: '',
    questions: [
      {
        title: '',
        color: '',
        answers: [
          {
            text: '',
            image: '',
            isCorrectAnswer: true,
          },
          {
            text: '',
            image: '',
            isCorrectAnswer: false,
          },
        ],
      },
    ],
    levels: [
      {
        title: '',
        image: '',
        text: '',
        minValue: 0,
      },
    ],
  };

  if (validarInformacoesIniciais(tituloQuizz, urlImagem, perguntasQuizz, niveisQuizz)) {
    novoQuizz.title = tituloQuizz;
    novoQuizz.image = urlImagem;
    renderizarFormPerguntas(parseInt(perguntasQuizz));
    renderizarFormNiveis(parseInt(niveisQuizz));
    informacoesBasicas.classList.add('ocultar');
    abrirCriacaoPerguntas(novoQuizz);
  } else {
    alert('Entrada(s) inválida(s)! Por favor, preencha os dados corretamente.');
  }
}

function validarInformacoesIniciais(titulo, url, qtdPerguntas, qtdNiveis) {
  const condicaoTitulo = titulo.length !== '' && titulo.length >= 20 && titulo.length <= 65 && isNaN(titulo) === true;
  const condicaoURL = url !== '' && urlValida(url) && validaURLInicioEFim(url);
  const condicaoPerguntas = qtdPerguntas !== '' && parseInt(qtdPerguntas) >= 3 && Number(qtdPerguntas) % 1 === 0;
  const condicaoNiveis = qtdNiveis !== '' && parseInt(qtdNiveis) >= 2 && Number(qtdNiveis) % 1 === 0;

  return condicaoTitulo && condicaoURL && condicaoPerguntas && condicaoNiveis;
}

function urlValida(strURL) {
  let res = strURL.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );

  return res !== null;
}

function validaURLInicioEFim(stringURL) {
  const condicaoStartsWith = stringURL.startsWith('http://') || stringURL.startsWith('https://');
  const condicaoEndsWith =
    stringURL.endsWith('.jpg') ||
    stringURL.endsWith('.jpeg') ||
    stringURL.endsWith('.png') ||
    stringURL.endsWith('.gif');

  return condicaoStartsWith && condicaoEndsWith;
}

function abrirCriacaoPerguntas(objeto) {
  const criacaoPerguntasQuizz = document.querySelector('.criacao-perguntas-quizz');
  criacaoPerguntasQuizz.classList.remove('ocultar');
}

function renderizarFormPerguntas(nPerguntas) {
  document.querySelector('.criacao-perguntas-quizz div').innerHTML = '';

  for (let i = 0; i < nPerguntas; i++) {
    document.querySelector('.criacao-perguntas-quizz div').innerHTML += `
    <div>
      <h4>Pergunta ${i + 1}</h4>
      <ion-icon name="create-outline" onclick="expandirFormPerguntas(this)"></ion-icon>
    </div>
    `;
  }
}

function expandirFormPerguntas(element) {
  const form = element.parentElement;
  alterarFlexDirection(form, 'column');
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
    <li><input type="text" placeholder="URL da imagem 1"></li>
    <li><input type="text" placeholder="Resposta incorreta 2">
    <li><input type="text" placeholder="URL da imagem 2"></li>
    <li><input type="text" placeholder="Resposta incorreta 3">
    <li><input type="text" placeholder="URL da imagem 3"></li>
  </ul>
  `;
}

function alterarFlexDirection(element, flexDirection) {
  element.style.flexDirection = flexDirection;
  element.style.alignItems = 'flex-start';
}

function renderizarFormNiveis(nNiveis) {
  document.querySelector('.criacao-niveis-quizz div').innerHTML = '';

  for (let i = 0; i < nNiveis; i++) {
    document.querySelector('.criacao-niveis-quizz div').innerHTML += `
    <div>
      <h4>Nível ${i + 1}</h4>
      <ion-icon name="create-outline" onclick="expandirFormNiveis(this)"></ion-icon>
    </div>
    `;
  }
}

function expandirFormNiveis(element) {
  const form = element.parentElement;
  alterarFlexDirection(form, 'column');
  form.innerHTML = `
  <h4>${form.querySelector('h4').innerText}</h4>
  <ul>
    <li><input type="text" placeholder="Título do nível"></li>
    <li><input type="text" placeholder="% de acerto mínima"></li>
    <li><input type="text" placeholder="URL da imagem do nível">
    <li><input type="text" class="descricao-nivel" placeholder="Descrição do nível"></li>
  </ul>
  `;
}

// renderizarSucessoQuizz();

// function renderizarSucessoQuizz() {
//   const sucessoQuizz = document.querySelector('.sucesso-quizz');
//   sucessoQuizz.innerHTML = `
//   <h5>Seu quizz está pronto!</h5>
//   <div></div>
//   <button class="reiniciar-btn" onclick="acessarQuizz()">Acessar Quizz</button>
//   <button class="home-btn" onclick="voltarParaHome()">Voltar para home</button>
//   `;
// }
