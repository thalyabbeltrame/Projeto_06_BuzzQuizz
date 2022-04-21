// Tela 1 - Lista de quizzes
const API = "https://mock-api.driven.com.br/api/v4/buzzquizz";
let idQuizzUsuario = 8107;

obterQuizzes();
//const idObterQuizzes = setInterval(obterQuizzes, 10000);

function obterQuizzes() {
  const promise = axios.get(`${API}/quizzes`);
  promise.then((response) => {
    console.log("Consegui obter os quizzes da API!");
    separarQuizzesUsuario(response.data);
  });
  promise.catch(() => {
    console.log("Não consegui obter os quizzes da API!");
  });
}

function separarQuizzesUsuario(quizzes) {
  let listaQuizzesTodos = "";
  let listaQuizzesUsuario = "";

  quizzes.forEach((el) => {
    if(el.id !== idQuizzUsuario) {
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
  console.log("Entrei em renderizar!");
  const elUsuarioVazio = document.querySelector(".quizzes-usuario-vazio");
  const elCabecalhoUsuario = document.querySelector(".cabecalho-quizzes-usuario");
  const elQuizzesUsuario = document.querySelector(".quizzes-usuario");
  const elQuizzesTodos = document.querySelector(".quizzes-todos");

  elQuizzesTodos.innerHTML = quizzesTodos;

  if(quizzesUsuario !== "") {
    elUsuarioVazio.classList.add("ocultar");
    elQuizzesUsuario.innerHTML = quizzesUsuario;
    elQuizzesUsuario.classList.remove("ocultar");
    elCabecalhoUsuario.classList.remove("ocultar");  
  } else if ((quizzesUsuario === "") && (elUsuarioVazio.classList.contains("ocultar") === true)) {
    elUsuarioVazio.classList.remove("ocultar");
    elQuizzesUsuario.classList.add("ocultar");
    elCabecalhoUsuario.classList.add("ocultar");
  }
}

// function abrirPaginaQuizz(el){

// }

// function criarQuizz(el) {

// } 

// Tela 2 - Página de um quizz

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

abreQuizz();

function abreQuizz() {
  document.querySelector(
    '.pagina-quizz main .banner'
  ).style.background = `linear-gradient(0, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${exemploQuizz.image})`;
  document.querySelector('.pagina-quizz main .banner').style.backgroundPosition = 'center';
  document.querySelector('.pagina-quizz main .banner').style.backgroundSize = 'cover';
  document.querySelector('.pagina-quizz main .banner').innerHTML = `<span>${exemploQuizz.title}</span>`;

  renderizaAsPerguntas(exemploQuizz.questions);
}

function renderizaAsPerguntas(questoes) {
  let perguntas = document.querySelector('.pagina-quizz main .perguntas');
  perguntas.innerHTML = '';
  questoes.forEach((questao) => {
    perguntas.innerHTML += `
    <li class="pergunta">
        <div class="titulo" style="background-color: ${questao.color}">
            <span>${questao.title}</span>
        </div>
        <ul class="respostas">${renderizaAsRespostas(questao.answers)}</ul>
    </li>`;
  });
}

function renderizaAsRespostas(respostas) {
  const respostasEmbaralhadas = embaralhaRespostas(respostas);
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

function embaralhaRespostas(respostas) {
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
  rolarParaProximaPergunta();
}

function rolarParaProximaPergunta() {
  setTimeout(() => {
    const perguntaAtual = document.querySelector('.pergunta.selecionada');
    const proximaPergunta = perguntaAtual.nextElementSibling;
    if (proximaPergunta !== null) proximaPergunta.scrollIntoView({ block: 'center', behavior: 'smooth' });
    perguntaAtual.classList.remove('selecionada');
  }, 2000);
}
