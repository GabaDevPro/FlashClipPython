PI.config = {
  titulo: "Python Imobiliário",
  atividades: {
    "1":    { nome: "Atividade 1",  minutos: 5,  premios: [300, 200, 100], premio: "chocolate" },
    "2":    { nome: "Atividade 2",  minutos: 7,  premios: [300, 200, 100], premio: "chocolate" },
    "3":    { nome: "Atividade 3",  minutos: 9,  premios: [300, 200, 100], premio: "chocolate" },
    "4a":   { nome: "Atividade 4a", minutos: 5,  premios: [300, 200, 100], premio: "chocolate" },
    "4b":   { nome: "Atividade 4b", minutos: 7,  premios: [300, 200, 100], premio: "chocolate" },
    "5a":   { nome: "Atividade 5a", minutos: 6,  premios: [300, 200, 100], premio: "chocolate" },
    "5b":   { nome: "Atividade 5b", minutos: 7,  premios: [300, 200, 100], premio: "chocolate" },
    "boss": { nome: "Boss",         minutos: 15, premios: [500, 300, 100], premio: "chocolate" }
  },
  tempos: { intervalo: 5 },
  cronograma: [
    { bloco: 1, inicioMin: 0,  fimMin: 7,  etapa: "Abertura" },
    { bloco: 1, inicioMin: 7,  fimMin: 17, etapa: "print e comentários" },
    { bloco: 1, inicioMin: 17, fimMin: 31, etapa: "Variáveis e tipos" },
    { bloco: 1, inicioMin: 31, fimMin: 47, etapa: "input e operações" },
    { bloco: 1, inicioMin: 47, fimMin: 75, etapa: "if / elif / else" },
    { bloco: 1, inicioMin: 75, fimMin: 80, etapa: "Recap e ranking parcial" },
    { bloco: 1, inicioMin: 80, fimMin: 85, etapa: "Intervalo" },
    { bloco: 2, inicioMin: 0,  fimMin: 23, etapa: "Laços for e while" },
    { bloco: 2, inicioMin: 23, fimMin: 46, etapa: "Boss: o banqueiro final" },
    { bloco: 2, inicioMin: 46, fimMin: 50, etapa: "Premiação final" }
  ],
  links: { envio: "", forms: "" },
  ministrantes: [
    { nome: "Enzo Kauê Batista Ferreira", secao: "", foto: "assets/fotos/enzo.jpg", cor: "#D7322B" },
    { nome: "Carlos Antonio Pessoa Neto", secao: "", foto: "assets/fotos/carlos.jpg", cor: "#1F4FA8" },
    { nome: "João Pedro Silva Sousa", secao: "", foto: "assets/fotos/joao.jpg", cor: "#2E9E5B" },
    { nome: "Walter Lucas Barros da Conceição", secao: "", foto: "assets/fotos/walter.jpg", cor: "#EE8A2C" },
    { nome: "Gabriel Rodrigues Costa Ferreira", secao: "", foto: "assets/fotos/gabriel.jpg", cor: "#D9447C" }
  ],
  aula: { inicio: "19:10" }
};
