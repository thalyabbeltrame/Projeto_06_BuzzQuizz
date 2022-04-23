const API = "https://mock-api.driven.com.br/api/v4/buzzquizz";

// Variáveis globais - Tela 1
let idQuizzUsuario = 0000;

// Variáveis globais - Tela 2
let nRespostasCorretas = 0;
let quizzAtualHtml = null;
let quizzAtual = {};

// Variáveis globais - Tela 3
let novoQuizz = {
  title: "",
  image: "",
  questions: [
    {
      title: "",
      color: "",
      answers: [
        {
          text: "",
          image: "",
          isCorrectAnswer: true,
        },
        {
          text: "",
          image: "",
          isCorrectAnswer: false,
        },
      ],
    },
  ],
  levels: [
    {
      title: "",
      image: "",
      text: "",
      minValue: 0,
    },
  ],
};
let infoQuizz = {
  qtdPerguntas: 0,
  qtdNiveis: 0,
};

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
  console.log("Entrei em renderizar!");
  const elUsuarioVazio = document.querySelector(".quizzes-usuario-vazio");
  const elCabecalhoUsuario = document.querySelector(".cabecalho-quizzes-usuario");
  const elQuizzesUsuario = document.querySelector(".quizzes-usuario");
  const elQuizzesTodos = document.querySelector(".quizzes-todos");

  elQuizzesTodos.innerHTML = quizzesTodos;

  if (quizzesUsuario !== "") {
    elUsuarioVazio.classList.add("ocultar");
    elQuizzesUsuario.innerHTML = quizzesUsuario;
    elQuizzesUsuario.classList.remove("ocultar");
    elCabecalhoUsuario.classList.remove("ocultar");
  } else if (quizzesUsuario === "" && elUsuarioVazio.classList.contains("ocultar") === true) {
    elUsuarioVazio.classList.remove("ocultar");
    elQuizzesUsuario.classList.add("ocultar");
    elCabecalhoUsuario.classList.add("ocultar");
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

function abrirQuizz(elemento) {
  quizzAtualHtml = elemento;
  idQuizzAtual = elemento.getAttribute("name");
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
  const banner = document.querySelector(".pagina-quizz main .banner");
  banner.style.background = `linear-gradient(0, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${quizz.image})`;
  banner.style.backgroundPosition = "center";
  banner.style.backgroundSize = "cover";
  banner.innerHTML = `<span>${quizz.title}</span>`;

  renderizarPerguntas(quizz.questions);

  document.querySelector(".lista-quizzes").classList.add("ocultar");
  document.querySelector(".pagina-quizz").classList.remove("ocultar");
  banner.scrollIntoView({ block: "start", behavior: "smooth" });
}

function renderizarPerguntas(questoes) {
  let perguntas = document.querySelector(".pagina-quizz main .perguntas");
  perguntas.innerHTML = "";
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
  let respostasHtml = "";
  respostasEmbaralhadas.forEach((resposta) => {
    const corretaOuIncorreta = resposta.isCorrectAnswer ? "correta" : "incorreta";
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
  element.parentElement.parentElement.classList.add("selecionada");
  const listaDeRespostas = element.parentElement.querySelectorAll(".resposta");
  listaDeRespostas.forEach((resposta) => {
    resposta.removeAttribute("onclick");
    resposta.classList.add("mostrar");
    if (resposta !== element) resposta.classList.add("opaca");
  });
  checarSeRespostaEhCorreta(element);
  setTimeout(rolarParaProximaPergunta, 2000);
}

function checarSeRespostaEhCorreta(element) {
  if (element.classList.contains("correta")) nRespostasCorretas++;
}

function rolarParaProximaPergunta() {
  const perguntaAtual = document.querySelector(".pergunta.selecionada");
  const proximaPergunta = perguntaAtual.nextElementSibling;
  if (proximaPergunta !== null) {
    proximaPergunta.scrollIntoView({ block: "center", behavior: "smooth" });
  } else {
    renderizarResultado();
    renderizarBotoesDeNavegacao();
  }
  perguntaAtual.classList.remove("selecionada");
}

function renderizarResultado() {
  const nPerguntas = quizzAtual.questions.length;
  const percentualAcerto = Math.round((nRespostasCorretas / nPerguntas) * 100);
  const nivel = definirNivel(percentualAcerto);
  const resultadoHtml = document.querySelector(".pagina-quizz main .finalizacao");
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
  resultadoHtml.scrollIntoView({ block: "center", behavior: "smooth" });
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
  const navegacao = document.querySelector(".pagina-quizz main .navegacao");
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
  document.querySelector(".pagina-quizz main .pergunta").scrollIntoView({
    block: "center",
    behavior: "smooth",
  });
  nRespostasCorretas = 0;
  abrirQuizz(quizzAtualHtml);
  limparResultado();
  limparNavegacao();
}

function limparResultado() {
  document.querySelector(".pagina-quizz main .finalizacao").innerHTML = "";
}

function limparNavegacao() {
  document.querySelector(".pagina-quizz main .navegacao").innerHTML = "";
}

function voltarParaHome() {
  nRespostasCorretas = 0;
  limparResultado();
  limparNavegacao();
  document.querySelector(".pagina-quizz").classList.add("ocultar");
  document.querySelector(".lista-quizzes").classList.remove("ocultar");
}

// Tela 3 - Criar um quizz

function coletarInformacoesIniciais() {
  const informacoesBasicas = document.querySelector(".informacoes-basicas-quizz");
  const criacaoPerguntasQuizz = document.querySelector(".criacao-perguntas-quizz");

  const tituloQuizz = informacoesBasicas.querySelector(".titulo-quizz").value;
  const urlImagem = informacoesBasicas.querySelector(".url-imagem").value;
  const perguntasQuizz = informacoesBasicas.querySelector(".perguntas-quizz").value;
  const niveisQuizz = informacoesBasicas.querySelector(".niveis-quizz").value;

  if (validarInformacoesIniciais(tituloQuizz, urlImagem, perguntasQuizz, niveisQuizz)) {
    novoQuizz.title = tituloQuizz;
    novoQuizz.image = urlImagem;
    infoQuizz.qtdPerguntas = parseInt(perguntasQuizz);
    infoQuizz.qtdNiveis = parseInt(niveisQuizz);
    renderizarFormPerguntas(infoQuizz.qtdPerguntas);
    renderizarFormNiveis(infoQuizz.qtdNiveis);
    informacoesBasicas.classList.add("ocultar");
    criacaoPerguntasQuizz.classList.remove("ocultar");
  } else {
    alert("Entrada(s) inválida(s)! Por favor, preencha os dados corretamente.");
  }
}

function validarInformacoesIniciais(titulo, url, qtdPerguntas, qtdNiveis) {
  const condicaoTitulo = titulo.length !== "" && titulo.length >= 20 && titulo.length <= 65 && isNaN(titulo) === true;
  //const condicaoURL = url !== "" && urlValida(url) && validaURLInicioEFim(url);
  const condicaoPerguntas = qtdPerguntas !== "" && parseInt(qtdPerguntas) >= 3 && Number(qtdPerguntas) % 1 === 0;
  const condicaoNiveis = qtdNiveis !== "" && parseInt(qtdNiveis) >= 2 && Number(qtdNiveis) % 1 === 0;

  if (condicaoTitulo && validarURLImagem(url) && condicaoPerguntas && condicaoNiveis) {
    return true;
    //alert("Dados preenchidos corretamente");
  }
  return false;
}

function validarURLImagem(url) {
  if (url !== "" && urlValida(url) && validaURLInicioEFim(url)) {
    return true;
  }
  return false;
}

function urlValida(strURL) {
  console.log("Entrei em urlValida!");
  let res = strURL.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

function validaURLInicioEFim(stringURL) {
  console.log("Entrei em urlHTTP!");
  const condicaoStartsWith = stringURL.startsWith("http://") || stringURL.startsWith("https://");
  return condicaoStartsWith;
}

function coletarPerguntasQuizz() {
  const blocoPerguntas = document.querySelector(".bloco-perguntas");
  let objetoVerificacao = {
    textosPerguntas: [],
    coresPerguntas: [],
    respostasCorretas: [],
    urlImagensCorretas: [],
    urlImagensIncorretas: [],
    respostasIncorretas: [],
  };

  for (let i = 1; i <= infoQuizz.qtdPerguntas; i++) {
    let bloco = blocoPerguntas.querySelector(`div:nth-child(${i})`);

    let textoPergunta = bloco.querySelector(`input[placeholder="Texto da pergunta"]`).value;
    let corPergunta = bloco.querySelector(`input[placeholder="Cor de fundo da pergunta"]`).value;
    let respostaCorreta = bloco.querySelector(`input[placeholder="Resposta correta"]`).value;
    let urlImagemCorreta = bloco.querySelector(`input[placeholder="URL da imagem"]`).value;
    objetoVerificacao.textosPerguntas.push(textoPergunta);
    objetoVerificacao.coresPerguntas.push(corPergunta);
    objetoVerificacao.respostasCorretas.push(respostaCorreta);
    objetoVerificacao.urlImagensCorretas.push(urlImagemCorreta);

    const objImagemIncorreta = {
      url_1: "",
      url_2: "",
      url_3: "",
    };

    const objRespostaIncorreta = {
      resp_1: "",
      resp_2: "",
      resp_3: "",
    };

    for (let k = 0; k < 3; k++) {
      objImagemIncorreta[`url_${k + 1}`] = bloco.querySelector(
        `input[placeholder="Resposta incorreta ${k + 1}"]`
      ).value;
      objRespostaIncorreta[`resp_${k + 1}`] = bloco.querySelector(`input[placeholder="URL da imagem ${k + 1}"]`).value;
    }
    objetoVerificacao.respostasIncorretas.push(objRespostaIncorreta);
    objetoVerificacao.urlImagensIncorretas.push(objImagemIncorreta);
  }

  if (validarPerguntasQuizz(objetoVerificacao)) {
    inserirPerguntasNovoQuizz(objetoVerificacao);
    abrirCriacaoNiveis(blocoPerguntas);
  } else {
    alert("Entrada(s) inválida(s)! Por favor, preencha os dados corretamente.");
  }
}

function validarPerguntasQuizz(objeto) {
  const novoTextosPerguntas = objeto.textosPerguntas.filter((el) => el !== "" && el.length >= 20);
  const novoCoresPerguntas = objeto.coresPerguntas.filter(validaHexadecimal);
  const novoRespostasCorretas = objeto.respostasCorretas.filter((el) => el !== "");
  const novoURLImagensCorretas = objeto.urlImagensCorretas.filter(validarURLImagem);

  const condicaoTextoPerguntas = novoTextosPerguntas.length === objeto.textosPerguntas.length;
  const condicaoCoresPerguntas = novoCoresPerguntas.length === objeto.coresPerguntas.length;
  const condicaoRespostasCorretas = novoRespostasCorretas.length === objeto.respostasCorretas.length;
  const condicaoURLImagensCorretas = novoURLImagensCorretas.length === objeto.urlImagensCorretas.length;

  // const novoURLImagensIncorretas = objeto.urlImagensIncorretas.filter(validarURLImagem);
  // const novoRespostasIncorretas = objeto.respostasIncorretas.filter(el => el !== "");
  // const condicaoURLImagensIncorretas = novoURLImagensIncorretas.length >= 1;
  // const condicaoURLImagensCorretas = novoURLImagensCorretas.length >= 1;

  const novoRespostasIncorretas = objeto.respostasIncorretas.filter((obj) => obj.resp_1 !== "");
  const novoURLImagensIncorretas = objeto.urlImagensIncorretas.filter((obj) => validarURLImagem(obj.url_1));
  const condicaoRespostasIncorretas = novoRespostasIncorretas.length === objeto.respostasIncorretas.length;
  const condicaoURLImagensIncorretas = novoURLImagensIncorretas.length === objeto.urlImagensIncorretas.length;

  return (
    condicaoTextoPerguntas &&
    condicaoCoresPerguntas &&
    condicaoRespostasCorretas &&
    condicaoURLImagensCorretas &&
    condicaoRespostasIncorretas &&
    condicaoURLImagensIncorretas
  );
}

function inserirPerguntasNovoQuizz(objeto) {
  for (let j = 0; j < infoQuizz.qtdPerguntas; j++) {
    const question = {
      title: "",
      color: "",
      answers: [
        {
          text: "",
          image: "",
          isCorrectAnswer: true,
        },
        {
          text: "",
          image: "",
          isCorrectAnswer: false,
        },
      ],
    };

    const answerCorrect = {
      text: "",
      image: "",
      isCorrectAnswer: true,
    };

    const answerIncorrect = {
      text: "",
      image: "",
      isCorrectAnswer: false,
    };

    question.title = objeto.textosPerguntas[j];
    question.color = objeto.coresPerguntas[j];
    answerCorrect.text = objeto.respostasCorretas[j];
    answerCorrect.image = objeto.urlImagensCorretas[j];
    question.answers.push(answerCorrect);

    for (let k = 1; k <= 3; k++) {
      let condRespIncorreta = objeto.respostasIncorretas[j][`resp_${k}`] !== "";
      let condImgIncorreta = objeto.urlImagensIncorretas[j][`url_${k}`] !== "";

      if (condRespIncorreta && condImgIncorreta) {
        answerIncorrect.text = objeto.respostasIncorretas[j][`resp_${k}`];
        answerIncorrect.image = objeto.urlImagensIncorretas[j][`url_${k}`];
        question.answers.push(answerIncorrect);
      }
    }

    novoQuizz.questions.push(question);
  }
}

function abrirCriacaoNiveis(elBlocoPerguntas) {
  const elCriacaoNiveis = document.querySelector(".criacao-niveis-quizz");
  elBlocoPerguntas.parentNode.classList.add("ocultar");
  elCriacaoNiveis.classList.remove("ocultar");
}

function validaHexadecimal(str) {
  const reg = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return reg.test(str);
}

//renderizarFormPerguntas(3); //exemplo de como renderizar 3 perguntas

function renderizarFormPerguntas(nPerguntas) {
  document.querySelector(".criacao-perguntas-quizz div").innerHTML = "";

  for (let i = 0; i < nPerguntas; i++) {
    document.querySelector(".criacao-perguntas-quizz div").innerHTML += `
    <div>
      <h4>Pergunta ${i + 1}</h4>
      <ion-icon name="create-outline" onclick="expandirFormPerguntas(this)"></ion-icon>
    </div>
    `;
  }
}

function expandirFormPerguntas(element) {
  const form = element.parentElement;
  alterarFlexDirection(form, "column");
  form.innerHTML = `
  <h4>${form.querySelector("h4").innerText}</h4>
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
  element.style.alignItems = "flex-start";
}

//renderizarFormNiveis(3); //exemplo de como renderizar 3 níveis

function renderizarFormNiveis(nNiveis) {
  document.querySelector(".criacao-niveis-quizz div").innerHTML = "";

  for (let i = 0; i < nNiveis; i++) {
    document.querySelector(".criacao-niveis-quizz div").innerHTML += `
    <div>
      <h4>Nível ${i + 1}</h4>
      <ion-icon name="create-outline" onclick="expandirFormNiveis(this)"></ion-icon>
    </div>
    `;
  }
}

function expandirFormNiveis(element) {
  const form = element.parentElement;
  alterarFlexDirection(form, "column");
  form.innerHTML = `
  <h4>${form.querySelector("h4").innerText}</h4>
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
