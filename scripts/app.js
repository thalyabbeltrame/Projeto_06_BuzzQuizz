const API = 'https://mock-api.driven.com.br/api/v6/buzzquizz';
const GRAD_IMG_QUIZZ = '180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.5) 64.58%, #000000 100%';
const GRAD_IMG_BANNER = '0, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)';
const OPCOES_SCROLL = { block: 'center', behavior: 'smooth' };

let listaQuizzesUsuario = '';
let listaQuizzesTodos = '';

let elQuizzAberto = null;
let idQuizzAberto = '';
let objQuizzAberto = {};
let qtyPerguntasRespondidas = 0;
let qtyRespostasCorretas = 0;

let novoQuizz = {
  title: '',
  image: '',
  questions: [],
  levels: [],
};

let infoNovoQuizz = {
  qtyPerguntas: 0,
  qtyNiveis: 0,
};

let modoEdicao = false;
let quizzEditar = {};
let quizzEditar_localStorage = {};

// Tela 1 - Lista de Quizzes
obterQuizzes();

function mostrarEsconderLoading() {
  const elLoading = document.querySelector('.loading');
  elLoading.classList.toggle('ocultar');
}

function obterQuizzes() {
  mostrarEsconderLoading();
  obterQuizzesUsuario();
  obterQuizzesTodos();
}

function obterQuizzesUsuario() {
  const quizzesUsuario_localStorage = JSON.parse(localStorage.getItem('listaQuizzes'));
  listaQuizzesUsuario = '';
  quizzesUsuario_localStorage?.forEach((el) => obterQuizz(el.id));
}

function obterQuizz(id) {
  axios
    .get(`${API}/quizzes/${id}`)
    .then((resposta) => {
      adicionarQuizzUsuario(resposta.data);
    })
    .catch((erro) => {
      console.log(erro);
    });
}

function adicionarQuizzUsuario(quizz) {
  listaQuizzesUsuario += `
  <div class="quizz" name="${quizz.id}" onclick="abrirQuizz(this)">
    <div class="imagem" 
      style="
      background: linear-gradient(${GRAD_IMG_QUIZZ}), url(${quizz.image}); 
      background-position: center; 
      background-size: cover">
    </div>
    <h6>${quizz.title}</h6>
    <div class="botoes">
      <button class="editar-quizz-btn" onclick="editarQuizz(this, event)">
        <ion-icon name="create-outline"></ion-icon>
      </button>
      <button class="excluir-quizz-btn" onclick="excluirQuizz(this, event)">
        <ion-icon name="trash-outline"></ion-icon>
      </button>
    </div>
  </div>
  `;
}

function obterQuizzesTodos() {
  listaQuizzesTodos = '';
  axios
    .get(`${API}/quizzes`)
    .then((response) => {
      adicionarQuizzesTodos(response.data);
      renderizarListaQuizzes(listaQuizzesUsuario, listaQuizzesTodos);
      setTimeout(mostrarEsconderLoading, 3000);
    })
    .catch(() => {
      console.log('Não consegui obter os quizzes da API!');
    });
}

function adicionarQuizzesTodos(quizzes) {
  const quizzesUsuario_localStorage = JSON.parse(localStorage.getItem('listaQuizzes'));

  quizzes.forEach((quizz) => {
    if (!quizzesUsuario_localStorage?.some((el) => el.id === quizz.id)) {
      listaQuizzesTodos += `
      <div class="quizz" name="${quizz.id}" onclick="abrirQuizz(this)">
        <div class="imagem" style="
          background: linear-gradient(${GRAD_IMG_QUIZZ}), url(${quizz.image}); 
          background-position: center; 
          background-size: cover">
        </div>
        <h6>${quizz.title}</h6>
      </div>
      `;
    }
  });
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
  } else if (quizzesUsuario === '' && elUsuarioVazio.classList.contains('ocultar')) {
    elUsuarioVazio.classList.remove('ocultar');
    elQuizzesUsuario.classList.add('ocultar');
    elCabecalhoUsuario.classList.add('ocultar');
  }
}

function abrirQuizz(elemento) {
  mostrarEsconderLoading();
  elQuizzAberto = elemento;
  idQuizzAberto = elemento.getAttribute('name');
  axios
    .get(`${API}/quizzes/${idQuizzAberto}`)
    .then((resposta) => {
      objQuizzAberto = resposta.data;
      renderizarQuizz(objQuizzAberto);
      setTimeout(mostrarEsconderLoading, 3000);
    })
    .catch((erro) => {
      console.log(erro);
    });
}

// Tela 2 - Quizz
function renderizarQuizz(quizz) {
  const elBanner = document.querySelector('.pagina-quizz main .banner');
  const elListaQuizzes = document.querySelector('.lista-quizzes');
  const elPaginaQuizz = document.querySelector('.pagina-quizz');
  elBanner.style.background = `linear-gradient(${GRAD_IMG_BANNER}), url(${quizz.image})`;
  elBanner.style.backgroundPosition = 'center';
  elBanner.style.backgroundSize = 'cover';
  elBanner.innerHTML = `<span>${quizz.title}</span>`;

  renderizarPerguntas(quizz.questions);

  elListaQuizzes.classList.add('ocultar');
  elPaginaQuizz.classList.remove('ocultar');
  elBanner.scrollIntoView(OPCOES_SCROLL);
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
  qtyPerguntasRespondidas++;
  element.parentElement.parentElement.classList.add('selecionada');
  const listaDeRespostas = element.parentElement.querySelectorAll('.resposta');
  listaDeRespostas.forEach((resposta) => {
    resposta.removeAttribute('onclick');
    resposta.classList.add('mostrar');
    if (resposta !== element) resposta.classList.add('opaca');
  });
  if (element.classList.contains('correta')) qtyRespostasCorretas++;
  setTimeout(rolarParaProximaPergunta, 2000);
}

function rolarParaProximaPergunta() {
  const perguntaAtual = document.querySelector('.pergunta.selecionada');
  const proximaPergunta = perguntaAtual.nextElementSibling;

  if (qtyPerguntasRespondidas === objQuizzAberto.questions.length) {
    renderizarResultado();
    renderizarBotoesDeNavegacao();
  } else if (proximaPergunta !== null) {
    proximaPergunta.scrollIntoView(OPCOES_SCROLL);
  }
  perguntaAtual.classList.remove('selecionada');
}

function renderizarResultado() {
  const qtyPerguntas = objQuizzAberto.questions.length;
  const percentualAcerto = Math.round((qtyRespostasCorretas / qtyPerguntas) * 100);
  const nivel = definirNivelResultado(percentualAcerto);
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

function definirNivelResultado(percentual) {
  const niveisOrdenados = objQuizzAberto.levels.sort((a, b) => a.minValue - b.minValue);
  const indiceNivelAcima = niveisOrdenados.findIndex((nivel) => percentual < nivel.minValue);
  if (indiceNivelAcima === -1) {
    return niveisOrdenados[niveisOrdenados.length - 1];
  }
  return niveisOrdenados[indiceNivelAcima - 1];
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
  document.querySelector('.pagina-quizz').scrollIntoView({ block: 'start', behavior: 'smooth' });
  qtyPerguntasRespondidas = 0;
  qtyRespostasCorretas = 0;
  abrirQuizz(elQuizzAberto);
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
  qtyPerguntasRespondidas = 0;
  qtyRespostasCorretas = 0;
  limparResultado();
  limparNavegacao();
  document.querySelector('.pagina-quizz').classList.add('ocultar');
  document.querySelector('.criacao-quizz').classList.add('ocultar');
  document.querySelector('.sucesso-quizz').classList.add('ocultar');
  document.querySelector('.informacoes-basicas-quizz').classList.remove('ocultar');
  document.querySelector('.lista-quizzes').classList.remove('ocultar');
  document.querySelector('.lista-quizzes').scrollIntoView({ block: 'start', behavior: 'smooth' });
  obterQuizzes();
}

// Tela 3 - Criação de Quizzes
function criarOuEditarQuizz() {
  if (modoEdicao) {
    document.querySelector('.titulo-quizz').value = quizzEditar.title;
    document.querySelector('.url-imagem').value = quizzEditar.image;
    document.querySelector('.perguntas-quizz').value = quizzEditar.questions.length;
    document.querySelector('.niveis-quizz').value = quizzEditar.levels.length;
  }

  const elCriacaoQuizz = document.querySelector('.criacao-quizz');
  const elListaQuizzes = document.querySelector('.lista-quizzes');
  elCriacaoQuizz.classList.remove('ocultar');
  elListaQuizzes.classList.add('ocultar');
}

// Tela 3.1 - Informaçõess gerais do Quizz
function coletarInformacoesIniciais() {
  const informacoesBasicas = document.querySelector('.informacoes-basicas-quizz');
  const criacaoPerguntasQuizz = document.querySelector('.criacao-perguntas-quizz');

  const tituloQuizz = informacoesBasicas.querySelector('.titulo-quizz').value;
  const urlImagem = informacoesBasicas.querySelector('.url-imagem').value;
  const qtyPerguntasQuizz = informacoesBasicas.querySelector('.perguntas-quizz').value;
  const qtyNiveisQuizz = informacoesBasicas.querySelector('.niveis-quizz').value;

  if (validarInformacoesIniciais(tituloQuizz, urlImagem, qtyPerguntasQuizz, qtyNiveisQuizz)) {
    novoQuizz.title = tituloQuizz;
    novoQuizz.image = urlImagem;
    infoNovoQuizz.qtyPerguntas = parseInt(qtyPerguntasQuizz);
    infoNovoQuizz.qtyNiveis = parseInt(qtyNiveisQuizz);
    renderizarFormPerguntas(infoNovoQuizz.qtyPerguntas);
    informacoesBasicas.classList.add('ocultar');
    criacaoPerguntasQuizz.classList.remove('ocultar');
  } else {
    alert('Entrada(s) inválida(s)! Por favor, preencha os dados corretamente.');
  }
}

function validarInformacoesIniciais(titulo, url, qtyPerguntas, qtyNiveis) {
  const tituloValido = titulo.length !== '' && titulo.length >= 20 && titulo.length <= 65 && isNaN(titulo) === true;
  const qtyPerguntasValida = qtyPerguntas !== '' && parseInt(qtyPerguntas) >= 3 && Number(qtyPerguntas) % 1 === 0;
  const qtyNiveisValida = qtyNiveis !== '' && parseInt(qtyNiveis) >= 2 && Number(qtyNiveis) % 1 === 0;

  if (tituloValido && validarURLImagem(url) && qtyPerguntasValida && qtyNiveisValida) {
    return true;
  }
  return false;
}

function renderizarFormPerguntas(qtyPerguntas) {
  document.querySelector('.criacao-perguntas-quizz div').innerHTML = '';

  for (let i = 0; i < qtyPerguntas; i++) {
    document.querySelector('.criacao-perguntas-quizz div').innerHTML += `
      <div class="colapse-form">
        <h4>Pergunta ${i + 1}</h4>
        <ion-icon name="create-outline" onclick="expandirFormPerguntas(this)"></ion-icon>
      </div>
      <div class="expand-form ocultar">
        <h4>Pergunta ${i + 1}</h4>
        <ul>
          <li><input type="text" class="texto-pergunta" placeholder="Texto da pergunta"></li>
          <li><input type="text" class="cor-fundo" placeholder="Cor de fundo da pergunta"></li>
        </ul>
        <h4>Resposta correta</h4>
        <ul>
          <li><input type="text" class="resposta-correta" placeholder="Resposta correta"></li>
          <li><input type="text" class="img-correta" placeholder="URL da imagem"></li>
        </ul>
        <h4>Respostas incorretas</h4>
        <ul>
          <li><input type="text" class="resposta-incorreta" placeholder="Resposta incorreta 1"></li>
          <li><input type="text" class="img-incorreta" placeholder="URL da imagem 1"></li>
          <li><input type="text" class="resposta-incorreta" placeholder="Resposta incorreta 2">
          <li><input type="text" class="img-incorreta"placeholder="URL da imagem 2"></li>
          <li><input type="text" class="resposta-incorreta" placeholder="Resposta incorreta 3">
          <li><input type="text" class="img-incorreta" placeholder="URL da imagem 3"></li>
        </ul>
      </div>
    `;
  }
  if (modoEdicao) {
    for (let i = 0; i < qtyPerguntas; i++) {
      const form = document.querySelectorAll(`.criacao-perguntas-quizz div .expand-form`)[i];
      renderizarPerguntasValues(form);
    }
  }
}

function renderizarFormNiveis(qtyNiveis) {
  document.querySelector('.criacao-niveis-quizz div').innerHTML = '';

  for (let i = 0; i < qtyNiveis; i++) {
    document.querySelector('.criacao-niveis-quizz div').innerHTML += `
      <div class="colapse-form">
        <h4>Nível ${i + 1}</h4>
        <ion-icon name="create-outline" onclick="expandirFormNiveis(this)"></ion-icon>
      </div>
      <div class="expand-form ocultar">
        <h4>Nível ${i + 1}</h4>
        <ul>
          <li><input type="text" class="titulo-nivel" placeholder="Título do nível"></li>
          <li><input type="text" class="percentual" placeholder="% de acerto mínima"></li>
          <li><input type="text" class="img-nivel" placeholder="URL da imagem do nível">
          <li><input type="text" class="descricao-nivel" placeholder="Descrição do nível"></li>
        </ul>
      </div>
    `;
  }
  if (modoEdicao) {
    for (let i = 0; i < qtyNiveis; i++) {
      const form = document.querySelectorAll(`.criacao-niveis-quizz div .expand-form`)[i];
      renderizarNiveisValues(form);
    }
  }
}

// Tela 3.2 - Criação de Perguntas
function expandirFormPerguntas(element) {
  const elColapseForm = element.parentElement;
  const elExpandForm = elColapseForm.nextElementSibling;
  const todosExpandForm = document.querySelectorAll('.criacao-perguntas-quizz .expand-form');
  const todosColapseForm = document.querySelectorAll('.criacao-perguntas-quizz .colapse-form');
  todosExpandForm.forEach((el) => el.classList.add('ocultar'));
  todosColapseForm.forEach((el) => el.classList.remove('ocultar'));
  elExpandForm.classList.remove('ocultar');
  elColapseForm.classList.add('ocultar');
  alterarFlexDirection(elExpandForm, 'column');
}

function alterarFlexDirection(element, flexDirection) {
  element.style.flexDirection = flexDirection;
  element.style.alignItems = 'flex-start';
}

function renderizarPerguntasValues(elemento) {
  const indicePergunta = elemento.querySelector('h4').innerText.split(' ')[1] - 1;
  const pergunta = quizzEditar.questions[indicePergunta];
  elemento.querySelector('.texto-pergunta').value = pergunta.title;
  elemento.querySelector('.cor-fundo').value = pergunta.color;
  elemento.querySelector('.resposta-correta').value = pergunta.answers[0].text;
  elemento.querySelector('.img-correta').value = pergunta.answers[0].image;

  pergunta.answers.forEach((resposta, index) => {
    if (index > 0) {
      elemento.querySelectorAll('.resposta-incorreta')[index - 1].value = resposta.text;
      elemento.querySelectorAll('.img-incorreta')[index - 1].value = resposta.image;
    }
  });
}

function coletarPerguntasQuizz() {
  const blocoPerguntas = document.querySelectorAll('.bloco-perguntas .expand-form');
  for (let i = 0; i < infoNovoQuizz.qtyPerguntas; i++) {
    const bloco = blocoPerguntas[i];
    const textoPergunta = bloco.querySelector('.texto-pergunta').value;
    const corPergunta = bloco.querySelector('.cor-fundo').value;
    const respostaCorreta = bloco.querySelector('.resposta-correta').value;
    const urlImagemCorreta = bloco.querySelector('.img-correta').value;
    novoQuizz.questions.push({
      title: textoPergunta,
      color: corPergunta,
      answers: [{ text: respostaCorreta, image: urlImagemCorreta, isCorrectAnswer: true }],
    });

    const respostasIncorretas = Array.from(bloco.querySelectorAll('.resposta-incorreta')).map((el) => el.value);
    const imgIncorretas = Array.from(bloco.querySelectorAll('.img-incorreta')).map((el) => el.value);

    for (let j = 0; j < respostasIncorretas.length; j++) {
      novoQuizz.questions[i].answers.push({
        text: respostasIncorretas[j],
        image: imgIncorretas[j],
        isCorrectAnswer: false,
      });
    }
  }
  if (!validarPerguntasQuizz()) {
    removerRespostasVazias();
    renderizarFormNiveis(infoNovoQuizz.qtyNiveis);
    abrirCriacaoNiveis();
  } else {
    alert('Entrada(s) inválida(s)! Por favor, preencha os dados corretamente.');
    novoQuizz.questions = [];
  }
}

function validarPerguntasQuizz() {
  const temTituloInvalido = novoQuizz.questions.some((questao) => questao.title === '' || questao.title.length < 20);
  const temCorInvalida = novoQuizz.questions.some((questao) => !validaHexadecimal(questao.color));
  const temRespostaCorretaInvalida = novoQuizz.questions.some(
    (questao) =>
      !questao.answers[0].isCorrectAnswer ||
      questao.answers[0].text === '' ||
      !validarURLImagem(questao.answers[0].image)
  );
  const temRespostaIncorretaInvalida = checarSeTemRespostaIncorretaInvalida();

  return temTituloInvalido || temCorInvalida || temRespostaCorretaInvalida || temRespostaIncorretaInvalida;
}

function checarSeTemRespostaIncorretaInvalida() {
  let contador = 0;
  novoQuizz.questions.forEach((questao) => {
    const respostasIncorretasCompletas = questao.answers.filter(
      (resposta) => !resposta.isCorrectAnswer && resposta.text !== '' && validarURLImagem(resposta.image)
    );
    const respostasIncorretasIncompletas = questao.answers.filter(
      (resposta) =>
        !resposta.isCorrectAnswer &&
        ((resposta.text === '' && validarURLImagem(resposta.image)) ||
          (resposta.text !== '' && !validarURLImagem(resposta.image)))
    );
    if (respostasIncorretasCompletas.length >= 1 && respostasIncorretasIncompletas.length === 0) contador++;
  });
  return contador < infoNovoQuizz.qtyPerguntas;
}

function removerRespostasVazias() {
  novoQuizz.questions.forEach((questao) => {
    questao.answers = questao.answers.filter((resposta) => resposta.text !== '' && resposta.image !== '');
  });
}

function abrirCriacaoNiveis() {
  document.querySelector('.criacao-niveis-quizz').classList.remove('ocultar');
  document.querySelector('.criacao-perguntas-quizz').classList.add('ocultar');
}

// Tela 3.3 - Criar níveis
function expandirFormNiveis(element) {
  const elColapseForm = element.parentElement;
  const elExpandForm = elColapseForm.nextElementSibling;
  const todosExpandForm = document.querySelectorAll('.criacao-niveis-quizz .expand-form');
  const todosColapseForm = document.querySelectorAll('.criacao-niveis-quizz .colapse-form');
  todosExpandForm.forEach((el) => el.classList.add('ocultar'));
  todosColapseForm.forEach((el) => el.classList.remove('ocultar'));
  elExpandForm.classList.remove('ocultar');
  elColapseForm.classList.add('ocultar');
  alterarFlexDirection(elExpandForm, 'column');
}

function renderizarNiveisValues(elemento) {
  const indiceNivel = elemento.querySelector('h4').innerText.split(' ')[1] - 1;
  const nivel = quizzEditar.levels[indiceNivel];
  elemento.querySelector('.titulo-nivel').value = nivel.title;
  elemento.querySelector('.percentual').value = nivel.minValue;
  elemento.querySelector('.img-nivel').value = nivel.image;
  elemento.querySelector('.descricao-nivel').value = nivel.text;
}

function coletarNiveisQuizz() {
  const blocoNiveis = document.querySelectorAll('.bloco-niveis .expand-form');
  for (let i = 0; i < infoNovoQuizz.qtyNiveis; i++) {
    const bloco = blocoNiveis[i];
    const textoNivel = bloco.querySelector('.titulo-nivel').value;
    const percentualMinimoAcerto = bloco.querySelector('.percentual').value;
    const urlImagemNivel = bloco.querySelector('.img-nivel').value;
    const descricaoNivel = bloco.querySelector('.descricao-nivel').value;
    novoQuizz.levels.push({
      title: textoNivel,
      image: urlImagemNivel,
      text: descricaoNivel,
      minValue: parseFloat(percentualMinimoAcerto),
    });
  }
  if (!validarNiveisQuizz()) {
    abrirSucessoCriacaoOuEdicaoQuizz();
  } else {
    alert('Entrada(s) inválida(s)! Por favor, preencha os dados corretamente.');
    novoQuizz.levels = [];
  }
}

function validarNiveisQuizz() {
  const temTituloInvalido = novoQuizz.levels.some((nivel) => nivel.title === '' || nivel.title.length < 10);
  const temURLImagemInvalida = novoQuizz.levels.some((nivel) => !validarURLImagem(nivel.image));
  const temDescricaoInvalida = novoQuizz.levels.some((nivel) => nivel.text === '' || nivel.text.length < 30);
  const temPorcentagemMinimaInvalida = novoQuizz.levels.some(
    (nivel) => nivel.minValue === '' || isNaN(nivel.minValue) || nivel.minValue < 0 || nivel.minValue > 100
  );
  const temMinValueDuplicado = !validaNiveisDuplicados(novoQuizz.levels);
  const naoTemNivelZero = novoQuizz.levels.every((nivel) => nivel.minValue !== 0);
  return (
    temTituloInvalido ||
    temURLImagemInvalida ||
    temDescricaoInvalida ||
    temPorcentagemMinimaInvalida ||
    naoTemNivelZero ||
    temMinValueDuplicado
  );
}

function abrirSucessoCriacaoOuEdicaoQuizz() {
  document.querySelector('.criacao-niveis-quizz').classList.add('ocultar');
  document.querySelector('.sucesso-quizz').classList.remove('ocultar');
  if (modoEdicao) {
    enviarQuizzEditadoProServidor();
  } else {
    enviarQuizzProServidor();
  }
}

function enviarQuizzProServidor() {
  const quizz = novoQuizz;
  axios
    .post(`${API}/quizzes`, quizz)
    .then((response) => {
      const idNovoQuizz = response.data.id;
      const keyNovoQuizz = response.data.key;
      armazenarQuizzUsuario(idNovoQuizz, keyNovoQuizz);
      renderizarSucessoQuizz(idNovoQuizz);
      limparNovoQuizz();
    })
    .catch(() => {
      console.log('Não consegui enviar o quizz pra API!');
      limparNovoQuizz();
    });
}

function enviarQuizzEditadoProServidor() {
  const quizz = novoQuizz;
  axios
    .put(`${API}/quizzes/${quizzEditar_localStorage.id}`, quizz, {
      headers: {
        'Secret-Key': `${quizzEditar_localStorage.key}`,
      },
    })
    .then(() => {
      renderizarSucessoQuizz(quizzEditar_localStorage.id);
      modoEdicao = false;
      quizzEditar_localStorage = {};
      limparNovoQuizz();
    })
    .catch(() => {
      console.log('Não consegui enviar o quizz editado pra API!');
      modoEdicao = false;
      quizzEditar_localStorage = {};
      limparNovoQuizz();
    });
}

function limparNovoQuizz() {
  novoQuizz = {
    title: '',
    image: '',
    questions: [],
    levels: [],
  };
}

function armazenarQuizzUsuario(idQuizz, keyQuizz) {
  const listaQuizzes = JSON.parse(localStorage.getItem('listaQuizzes')) || [];
  if (listaQuizzes.length > 0) {
    listaQuizzes.push({ id: idQuizz, key: keyQuizz });
    localStorage.setItem('listaQuizzes', JSON.stringify(listaQuizzes));
  } else {
    localStorage.setItem('listaQuizzes', JSON.stringify([{ id: idQuizz, key: keyQuizz }]));
  }
}

// Tela 3.4 - Sucesso

function renderizarSucessoQuizz(idQuizzCriado) {
  const sucessoQuizz = document.querySelector('.sucesso-quizz');
  sucessoQuizz.innerHTML = `
  <h5>Seu quizz está pronto!</h5>
  <div class="quizz-criado" name="${idQuizzCriado}" onclick="abrirQuizz(this)">
    <div class="imagem" 
      style="
      background: linear-gradient(${GRAD_IMG_QUIZZ}), url(${novoQuizz.image}); 
      background-position: center; 
      background-size: cover">
    </div>
    <h6>${novoQuizz.title}</h6>
  </div>
  <button class="reiniciar-btn" onclick="acessarQuizz()">Acessar Quizz</button>
  <button class="home-btn" onclick="voltarParaHome()">Voltar para home</button>
  `;
}

function acessarQuizz() {
  document.querySelector('.criacao-quizz').classList.add('ocultar');
  const elSucessoQuizz = document.querySelector('.sucesso-quizz');
  const elQuizzCriado = elSucessoQuizz.querySelector('.quizz-criado');
  abrirQuizz(elQuizzCriado);
}

// Bônus

function editarQuizz(elemento, evento) {
  mostrarEsconderLoading();
  evento.stopPropagation();
  modoEdicao = true;
  const idQuizzEditar = elemento.parentElement.parentElement.getAttribute('name');
  const listaQuizzes = JSON.parse(localStorage.getItem('listaQuizzes'));
  const keyQuizzEditar = listaQuizzes.find((quiz) => quiz.id === parseInt(idQuizzEditar)).key;
  quizzEditar_localStorage = { id: idQuizzEditar, key: keyQuizzEditar };
  axios
    .get(`${API}/quizzes/${idQuizzEditar}`)
    .then((response) => {
      quizzEditar = response.data;
      criarOuEditarQuizz();
      setTimeout(mostrarEsconderLoading, 3000);
    })
    .catch(() => {
      console.log('Não consegui obter o quizz para editar!');
    });
}

function excluirQuizz(elemento, evento) {
  mostrarEsconderLoading();
  evento.stopPropagation();
  if (confirm('Tem certeza que deseja excluir o quizz?')) {
    const idQuizzDeletar = elemento.parentElement.parentElement.getAttribute('name');
    const listaQuizzes = JSON.parse(localStorage.getItem('listaQuizzes'));
    const keyQuizzDeletar = listaQuizzes.find((quiz) => quiz.id === parseInt(idQuizzDeletar)).key;
    const listaQuizzesAtualizada = listaQuizzes.filter((quizz) => quizz.id !== parseInt(idQuizzDeletar));
    localStorage.setItem('listaQuizzes', JSON.stringify(listaQuizzesAtualizada));

    axios
      .delete(`${API}/quizzes/${idQuizzDeletar}`, {
        headers: {
          'Secret-Key': `${keyQuizzDeletar}`,
        },
      })
      .then(() => {
        obterQuizzes();
        setTimeout(mostrarEsconderLoading, 3000);
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    setTimeout(mostrarEsconderLoading, 3000);
  }
}

//  Validadores
function validarURLImagem(url) {
  if (url !== '' && urlValida(url) && validaURLInicio(url)) {
    return true;
  }
  return false;
}

function urlValida(strURL) {
  let res = strURL?.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

function validaURLInicio(stringURL) {
  const condicaoStartsWith = stringURL.startsWith('http://') || stringURL.startsWith('https://');
  return condicaoStartsWith;
}

function validaHexadecimal(str) {
  const reg = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return reg.test(str);
}

function validaNiveisDuplicados(niveis) {
  const niveisMinValue = niveis.map((nivel) => nivel.minValue);
  const niveisMinValueDiferentes = niveisMinValue.filter((nivel, index) => niveisMinValue.indexOf(nivel) === index);
  return niveisMinValueDiferentes.length === niveisMinValue.length;
}
