PI.config = {
  titulo: "Python Imobiliário",
  atividades: {
    "1":    { nome: "Atividade 1",  minutos: 5,  premios: [300, 200, 100], premio: "" },
    "2":    { nome: "Atividade 2",  minutos: 7,  premios: [300, 200, 100], premio: "" },
    "3":    { nome: "Atividade 3",  minutos: 9,  premios: [300, 200, 100], premio: "" },
    "4a":   { nome: "Atividade 4a", minutos: 5,  premios: [300, 200, 100], premio: "" },
    "4b":   { nome: "Atividade 4b", minutos: 7,  premios: [300, 200, 100], premio: "" },
    "5a":   { nome: "Atividade 5a", minutos: 6,  premios: [300, 200, 100], premio: "" },
    "5b":   { nome: "Atividade 5b", minutos: 7,  premios: [300, 200, 100], premio: "" },
    "boss": { nome: "Boss",         minutos: 15, premios: [500, 300, 100], premio: "" }
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
    { nome: "Ministrante 1", secao: "", foto: "", cor: "#D7322B" },
    { nome: "Ministrante 2", secao: "", foto: "", cor: "#1F4FA8" },
    { nome: "Ministrante 3", secao: "", foto: "", cor: "#2E9E5B" },
    { nome: "Ministrante 4", secao: "", foto: "", cor: "#EE8A2C" },
    { nome: "Ministrante 5", secao: "", foto: "", cor: "#D9447C" }
  ],
  aula: { inicio: "19:10" }
};
