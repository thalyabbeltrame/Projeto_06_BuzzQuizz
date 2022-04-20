// Tela 1 - Lista de quizzes

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
    <li class="resposta ${corretaOuIncorreta}">
        <img src="${resposta.image}">
        <span>${resposta.text}</span>
    </li>`;
  });
  return respostasHtml;
}

function embaralhaRespostas(respostas) {
  return respostas.sort(() => Math.random() - 0.5);
}
