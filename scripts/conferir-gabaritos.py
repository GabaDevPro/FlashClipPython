"""Confere os gabaritos e exemplos dos slides.

Lê os blocos de código de conteudo/secoes/ (via scripts/exportar-conteudo.js),
roda cada bloco que tem `testes` com as entradas do roteiro e compara a saída.
O texto das perguntas do input() não entra na saída conferida.
Testes com `erro` precisam falhar com o erro indicado.

Uso: python scripts/conferir-gabaritos.py [pasta-das-secoes]
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
EXPORTADOR = RAIZ / "scripts" / "exportar-conteudo.js"
TEMPO_LIMITE_S = 5

# Roda o arquivo do slide com um input() que lê a entrada sem imprimir a pergunta.
EXECUTOR = (
    "import sys, builtins\n"
    "builtins.input = lambda pergunta='': sys.stdin.readline().rstrip('\\n')\n"
    "codigo = open(sys.argv[1], encoding='utf-8').read()\n"
    "exec(compile(codigo, 'slide', 'exec'), {'__name__': '__main__'})\n"
)


def carregar_blocos(pasta: str | None = None) -> dict:
    comando = ["node", str(EXPORTADOR)] + ([pasta] if pasta else [])
    resultado = subprocess.run(
        comando,
        capture_output=True, text=True, encoding="utf-8", check=False,
    )
    if resultado.returncode != 0:
        raise RuntimeError(f"exportar-conteudo.js falhou:\n{resultado.stderr}")
    return json.loads(resultado.stdout)


def rodar_python(codigo: str, entradas: list[str]) -> tuple[str, str]:
    """Roda o código num processo isolado e devolve (stdout, stderr)."""
    with tempfile.TemporaryDirectory() as pasta:
        arquivo = Path(pasta) / "slide.py"
        arquivo.write_text(codigo, encoding="utf-8")
        resultado = subprocess.run(
            [sys.executable, "-I", "-X", "utf8", "-c", EXECUTOR, str(arquivo)],
            input="".join(e + "\n" for e in entradas),
            capture_output=True, text=True, encoding="utf-8",
            timeout=TEMPO_LIMITE_S, check=False,
        )
    return resultado.stdout, resultado.stderr


def normalizar(texto: str | None) -> str:
    linhas = [linha.rstrip() for linha in (texto or "").replace("\r\n", "\n").split("\n")]
    while linhas and not linhas[-1]:
        linhas.pop()
    return "\n".join(linhas)


def nome_do_erro(stderr: str) -> str:
    linhas = [linha for linha in stderr.strip().splitlines() if linha.strip()]
    return linhas[-1].split(":")[0].strip() if linhas else ""


def conferir_erro(bloco: dict, teste: dict) -> str | None:
    """`erro` é um nome ou, com `porLinha`, uma lista com o erro de cada linha."""
    if teste.get("porLinha"):
        trechos = [linha for linha in bloco["texto"].splitlines() if linha.strip()]
    else:
        trechos = [bloco["texto"]]
    erros = teste["erro"] if isinstance(teste["erro"], list) else [teste["erro"]] * len(trechos)
    if len(erros) != len(trechos):
        return f"{len(erros)} erros esperados para {len(trechos)} linhas"
    for trecho, esperado in zip(trechos, erros):
        _, stderr = rodar_python(trecho, teste.get("entradas", []))
        obtido = nome_do_erro(stderr)
        if obtido != esperado:
            return f"esperava {esperado}, veio {obtido or 'nenhum erro'} em: {trecho!r}"
    return None


def conferir_saida(bloco: dict, teste: dict) -> str | None:
    esperado = teste.get("saida", bloco.get("saida"))
    if esperado is None:
        return "teste sem saída esperada (nem no teste nem no bloco)"
    saida, stderr = rodar_python(bloco["texto"], teste.get("entradas", []))
    if stderr.strip():
        return f"erro ao rodar:\n{stderr.strip()}"
    if normalizar(saida) != normalizar(esperado):
        return (
            f"saída diferente\n--- esperada\n{normalizar(esperado)}"
            f"\n--- obtida\n{normalizar(saida)}"
        )
    return None


def conferir_teste(bloco: dict, teste: dict) -> str | None:
    """Devolve None se passou ou a mensagem de falha."""
    if teste.get("erro"):
        return conferir_erro(bloco, teste)
    return conferir_saida(bloco, teste)


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    dados = carregar_blocos(sys.argv[1] if len(sys.argv) > 1 else None)
    blocos = [b for b in dados["blocos"] if b["testes"]]
    if not blocos:
        print(f"Nenhum bloco com testes ({dados['secoes']} seções carregadas).")
        return 1

    falhas = 0
    for bloco in blocos:
        for i, teste in enumerate(bloco["testes"], start=1):
            falha = conferir_teste(bloco, teste)
            if falha:
                falhas += 1
                print(f"FALHOU slide {bloco['slide']} ({bloco['rotulo']}) teste {i}: {falha}")
    total = sum(len(b["testes"]) for b in blocos)
    print(f"{total - falhas}/{total} testes passaram em {len(blocos)} blocos.")
    return 1 if falhas else 0


if __name__ == "__main__":
    sys.exit(main())
