'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const CAMINHO_FEATURES = path.join(__dirname, '..', 'docs', 'features.json');
const PRIORIDADES = ['P0', 'P1', 'P2'];

test('features.json tem os campos do harness em cada funcionalidade', () => {
  const features = JSON.parse(fs.readFileSync(CAMINHO_FEATURES, 'utf8'));
  assert.ok(Array.isArray(features) && features.length > 0);
  for (const f of features) {
    assert.match(f.id, /^F\d{2}$/);
    assert.equal(typeof f.descricao, 'string');
    assert.ok(PRIORIDADES.includes(f.prioridade), `${f.id}: prioridade inválida`);
    assert.ok(Array.isArray(f.passos_de_teste) && f.passos_de_teste.length > 0);
    assert.equal(typeof f.passa, 'boolean');
  }
});

test('ids de features.json não se repetem', () => {
  const features = JSON.parse(fs.readFileSync(CAMINHO_FEATURES, 'utf8'));
  const ids = features.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});
