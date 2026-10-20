// Fuoriclasse — Strumento di validazione dati curriculum e schema (1000+ domande)
const fs = require('fs');
const path = require('path');

const curriculumPath = path.join(__dirname, '..', 'data', 'curriculum.json');

console.log('🔍 Avvio validazione curriculum Fuoriclasse (1000+ domande)...');

if (!fs.existsSync(curriculumPath)) {
  console.error('❌ Errore: data/curriculum.json non trovato!');
  process.exit(1);
}

let curriculum;
try {
  curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
  console.log('✓ File data/curriculum.json analizzato con successo (JSON valido).');
} catch (e) {
  console.error('❌ Errore di parsing JSON in data/curriculum.json:', e.message);
  process.exit(1);
}

const errors = [];
const allQuestionIds = new Set();
let totalQuestions = 0;

// Validazione metadata
if (!curriculum.metadata || !curriculum.metadata.version) {
  errors.push('Metadata mancante o privo di version.');
}

function validateQuestion(q, context) {
  totalQuestions++;
  if (!q.id) {
    errors.push(`${context}: id mancante.`);
    return;
  }
  if (allQuestionIds.has(q.id)) {
    errors.push(`${context}: ID duplicato '${q.id}'.`);
  }
  allQuestionIds.add(q.id);

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(`${context} (${q.id}): deve avere esattamente 4 opzioni di risposta.`);
  } else {
    const uniqueOpts = new Set(q.options);
    if (uniqueOpts.size !== 4) {
      errors.push(`${context} (${q.id}): le 4 opzioni non sono distinte: ${JSON.stringify(q.options)}`);
    }
    const rightAnswer = q.correct || q.name;
    if (!q.options.includes(rightAnswer)) {
      errors.push(`${context} (${q.id}): la risposta esatta ('${rightAnswer}') non è inclusa tra le opzioni.`);
    }
  }

  // Verifica tipo domanda: o player career o quiz domanda
  const isPlayer = Array.isArray(q.clubs);
  const isQuiz = typeof q.question === 'string' && Array.isArray(q.route);

  if (!isPlayer && !isQuiz) {
    errors.push(`${context} (${q.id}): formato non riconosciuto (deve contenere 'clubs' o 'question'+'route').`);
  }

  if (isPlayer) {
    if (!q.name) errors.push(`${context} (${q.id}): name mancante.`);
    if (typeof q.number !== 'number') errors.push(`${context} (${q.id}): number deve essere un intero.`);
    q.clubs.forEach((c, idx) => {
      if (!Array.isArray(c) || c.length < 4) {
        errors.push(`${context} (${q.id}): club[${idx}] deve essere [nome, sigla, kit, anno].`);
      }
    });
  }

  if (isQuiz) {
    if (!q.question.trim()) errors.push(`${context} (${q.id}): question vuota.`);
    if (!q.route.length) errors.push(`${context} (${q.id}): route deve avere almeno uno stop.`);
  }

  if (!q.sourceType || !['curated', 'official'].includes(q.sourceType)) {
    errors.push(`${context} (${q.id}): sourceType non valido (${q.sourceType}).`);
  }
  if (!q.sourceTitle || !q.sourceUrl) {
    errors.push(`${context} (${q.id}): sourceTitle e sourceUrl sono obbligatori.`);
  }
  if (!q.check) {
    errors.push(`${context} (${q.id}): check editoriale mancante.`);
  }
}

// Validazione Unità
if (!Array.isArray(curriculum.units) || curriculum.units.length === 0) {
  errors.push('Il catalogo deve contenere almeno una unità didattica.');
} else {
  curriculum.units.forEach((unit, uIdx) => {
    if (!unit.id || !unit.title || !Array.isArray(unit.lessons)) {
      errors.push(`Unità [${uIdx}]: mancano campi obbligatori (id, title, lessons).`);
      return;
    }

    unit.lessons.forEach((lesson, lIdx) => {
      if (!lesson.id || !lesson.title || !Array.isArray(lesson.questions)) {
        errors.push(`Unità ${unit.id}, Lezione [${lIdx}]: campi mancanti.`);
        return;
      }

      if (lesson.questions.length !== 5) {
        errors.push(`Unità ${unit.id}, Lezione ${lesson.id}: deve contenere esattamente 5 domande (trovate: ${lesson.questions.length}).`);
      }

      lesson.questions.forEach((q, qIdx) => {
        validateQuestion(q, `Unità ${unit.id} > ${lesson.id} > D${qIdx + 1}`);
      });
    });
  });
}

// Validazione Extra Modes
if (!curriculum.extraModes) {
  errors.push('extraModes mancante nel curriculum.');
} else {
  ['goals', 'scorers', 'derby', 'champions'].forEach((modeKey) => {
    if (curriculum.extraModes[modeKey]) {
      curriculum.extraModes[modeKey].forEach((q, idx) => {
        validateQuestion(q, `ExtraMode [${modeKey}] > D${idx + 1}`);
      });
    }
  });
}

console.log(`📊 Domande totali censite nel curriculum: ${totalQuestions}`);
console.log(`📋 Unità didattiche: ${curriculum.units ? curriculum.units.length : 0}`);

if (totalQuestions < 1000) {
  errors.push(`Il catalogo contiene ${totalQuestions} domande, ma l'obiettivo del progetto è di almeno 1000 domande.`);
}

if (errors.length > 0) {
  console.error(`\n❌ Rilevati ${errors.length} errori nel curriculum:`);
  errors.slice(0, 15).forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
  if (errors.length > 15) {
    console.error(`  ... e altri ${errors.length - 15} errori.`);
  }
  process.exit(1);
}

console.log('\n✅ SUCCESSO: Tutti i controlli di integrità e schema sono stati superati al 100%!');
