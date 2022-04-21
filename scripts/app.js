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
      <div class="quizz">
        <img src="${el.image}"/>
        <h6>${el.title}</h6>
      </div>
      `;
    } else {
      listaQuizzesUsuario += `
      <div class="quizz">
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
  const elCriacaoQuizz = document.querySelector(".criacao-quizz");
  const elListaQuizzes = document.querySelector(".lista-quizzes");
  
  elCriacaoQuizz.classList.remove("ocultar");
  elListaQuizzes.classList.add("ocultar");
}

// Tela 2 - Página de um quizz

let nRespostasCorretas = 0;

let exemploQuizz = {
  id: 8103,
  title: 'Título do quizz',
  image: 'https://http.cat/411.jpg',
  questions: [
    {
      title: 'Título da pergunta 1',
      color: '#123456',
      answers: [
        {
          text: 'Texto da resposta 1',
          image: 'https://http.cat/411.jpg',
          isCorrectAnswer: true,
        },
        {
          text: 'Texto da resposta 2',
          image: 'https://http.cat/412.jpg',
          isCorrectAnswer: false,
        },
      ],
    },
    {
      title: 'Título da pergunta 2',
      color: '#123456',
      answers: [
        {
          text: 'Texto da resposta 1',
          image: 'https://http.cat/411.jpg',
          isCorrectAnswer: true,
        },
        {
          text: 'Texto da resposta 2',
          image: 'https://http.cat/412.jpg',
          isCorrectAnswer: false,
        },
      ],
    },
    {
      title: 'Título da pergunta 3',
      color: '#123456',
      answers: [
        {
          text: 'Texto da resposta 1',
          image: 'https://http.cat/411.jpg',
          isCorrectAnswer: true,
        },
        {
          text: 'Texto da resposta 2',
          image: 'https://http.cat/412.jpg',
          isCorrectAnswer: false,
        },
      ],
    },
  ],
  levels: [
    {
      title: 'Título do nível 1',
      image: 'https://http.cat/411.jpg',
      text: 'Descrição do nível 1',
      minValue: 0,
    },
    {
      title: 'Título do nível 2',
      image: 'https://http.cat/412.jpg',
      text: 'Descrição do nível 2',
      minValue: 50,
    },
  ],
};

abrirQuizz();

function abrirQuizz() {
  document.querySelector(
    '.pagina-quizz main .banner'
  ).style.background = `linear-gradient(0, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${exemploQuizz.image})`;
  document.querySelector('.pagina-quizz main .banner').style.backgroundPosition = 'center';
  document.querySelector('.pagina-quizz main .banner').style.backgroundSize = 'cover';
  document.querySelector('.pagina-quizz main .banner').innerHTML = `<span>${exemploQuizz.title}</span>`;

  renderizarPerguntas(exemploQuizz.questions);
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
  }
  perguntaAtual.classList.remove('selecionada');
}

function renderizarResultado() {
  const nPerguntas = exemploQuizz.questions.length;
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
  const indiceNivel = exemploQuizz.levels.findIndex((nivel) => percentual < nivel.minValue);
  let nivelCorreto;
  if (indiceNivel === -1) {
    nivelCorreto = exemploQuizz.levels[exemploQuizz.levels.length - 1];
  } else {
    nivelCorreto = exemploQuizz.levels[indiceNivel - 1];
  }
  return nivelCorreto;
}

// Tela 3 - Criar um quizz

// function validarInformacoesIniciais() {
//   const informacoesBasicas = document.querySelector(".informacoes-basicas-quizz");

//   const tituloQuizz = informacoesBasicas.querySelector("input:first-child");
//   const urlImagem = informacoesBasicas.querySelector("input:nth-child(2)");

// }
