// ============================================================
// Backend Google Apps Script - Generator Nomor BAUT/BAPP/BAST
// ============================================================

const SHEET_COUNTERS = 'Counters';
const SHEET_HISTORY = 'History';
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

function doGet(e) {
  // Support untuk Web App Apps Script (Index.html) maupun API check
  if (e && e.parameter && e.parameter.api === 'getState') {
    return ContentService.createTextOutput(JSON.stringify(getState()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Generator Nomor Dokumen ISM')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Handler HTTP POST agar bisa dipanggil dari GitHub Pages maupun cURL
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || body.fn;
    const payload = body.payload || body.data || body;

    let result;
    if (action === 'getState') result = getState();
    else if (action === 'generateNumbers') result = generateNumbers(payload);
    else if (action === 'updateActId') result = updateActId(payload);
    else if (action === 'setCounter') result = setCounter(payload);
    else if (action === 'deleteHistory') result = deleteHistory(payload);
    else throw new Error('Action tidak dikenal: ' + action);

    return ContentService.createTextOutput(JSON.stringify({ ok: true, result: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#E4E9F1');
  }
  return sh;
}

function getCountersSheet() { return getSheet(SHEET_COUNTERS, ['Stage', 'Year', 'LastSeq']); }

function getHistorySheet() {
  const sh = getSheet(SHEET_HISTORY, ['ID', 'Stage', 'PO', 'Seq', 'Month', 'Year', 'Formatted', 'Timestamp', 'ActId']);
  if (sh.getLastColumn() < 9 || sh.getRange(1, 9).getValue() !== 'ActId') {
    sh.getRange(1, 9).setValue('ActId');
  }
  return sh;
}

function getState() {
  const cData = getCountersSheet().getDataRange().getValues();
  const counters = {};
  for (let i = 1; i < cData.length; i++) {
    const [stage, year, seq] = cData[i];
    if (!stage) continue;
    if (!counters[stage]) counters[stage] = {};
    counters[stage][String(year)] = seq;
  }
  const hData = getHistorySheet().getDataRange().getValues();
  const history = [];
  for (let i = 1; i < hData.length; i++) {
    const [id, stage, po, seq, month, year, formatted, ts, actId] = hData[i];
    if (!id) continue;
    history.push({ 
      id: String(id), 
      stage, 
      po: String(po), 
      seq, 
      month, 
      year: String(year), 
      formatted, 
      ts: Number(ts), 
      actId: actId ? String(actId) : '' 
    });
  }
  return { counters, history };
}

function getNextSeq(cSheet, stage, year) {
  const data = cSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === stage && String(data[i][1]) === String(year)) {
      const next = data[i][2] + 1;
      cSheet.getRange(i + 1, 3).setValue(next);
      return next;
    }
  }
  cSheet.appendRow([stage, year, 1]);
  return 1;
}

function generateNumbers(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const stage = payload.stage;
    const po = String(payload.po);
    const month = parseInt(payload.month, 10);
    const year = String(payload.year);
    let actIds = (payload.actIds || []).map(a => String(a).trim()).filter(Boolean);
    if (actIds.length === 0) actIds = [''];
    if (actIds.length > 50) {
      throw new Error('Maksimal 50 ACT ID sekaligus.');
    }

    const cSheet = getCountersSheet();
    const hSheet = getHistorySheet();
    const entries = [];
    actIds.forEach(actId => {
      const seq = getNextSeq(cSheet, stage, year);
      const formatted = String(seq).padStart(3, '0') + '/ISM-' + stage + '/' + po + '/' + ROMAN[month - 1] + '/' + year;
      const id = new Date().getTime() + '-' + Math.floor(Math.random() * 10000);
      const ts = new Date().getTime();
      hSheet.appendRow([id, stage, po, seq, month, year, formatted, ts, actId]);
      entries.push({ id, stage, po, seq, month, year, formatted, ts, actId });
    });
    return { entries };
  } finally {
    lock.releaseLock();
  }
}

function updateActId(payload) {
  const id = String(payload.id);
  const actId = String(payload.actId || '').trim();
  const hSheet = getHistorySheet();
  const data = hSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === id) {
      hSheet.getRange(i + 1, 9).setValue(actId);
      return { ok: true };
    }
  }
  return { ok: false };
}

function setCounter(payload) {
  const stage = payload.stage;
  const year = String(payload.year);
  const value = parseInt(payload.value, 10) || 0;
  const cSheet = getCountersSheet();
  const data = cSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === stage && String(data[i][1]) === year) {
      cSheet.getRange(i + 1, 3).setValue(value);
      return { ok: true };
    }
  }
  cSheet.appendRow([stage, year, value]);
  return { ok: true };
}

function deleteHistory(payload) {
  const id = String(payload.id);
  const hSheet = getHistorySheet();
  const data = hSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === id) {
      hSheet.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { ok: false };
}
