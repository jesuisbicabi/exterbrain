// ════════════════════════════════════════════════════════════
//  EXTERN BREIN — Google Apps Script
//  Plak deze code in script.google.com (nieuw project)
//  Koppel het aan een nieuw Google Sheet via:
//  Resources → Cloud Platform Project (of gewoon deployen,
//  dan maakt het script zelf het sheet aan).
// ════════════════════════════════════════════════════════════

const SHEET_NAME = 'Items';
const HEADERS = ['ID','Datum','Type','Inhoud','Categorie','Tijdsduur','Prioriteit','Status','Goedgekeurd'];

// ── Sheet ophalen / aanmaken ─────────────────────────────────
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Kopregel instellen
    const hdrRange = sheet.getRange(1, 1, 1, HEADERS.length);
    hdrRange.setValues([HEADERS]);
    hdrRange.setBackground('#1f2937');
    hdrRange.setFontColor('#f3f4f6');
    hdrRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    // Kolombreedte
    sheet.setColumnWidth(4, 300);  // Inhoud
    sheet.setColumnWidth(1, 140);  // ID
  }
  return sheet;
}

// ── GET: ?action=getAll ──────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'getAll') {
      return jsonOk(getAllItems());
    }
    return jsonErr('Onbekende actie: ' + action);
  } catch (err) {
    return jsonErr(err.toString());
  }
}

// ── POST: { action, ...payload } ────────────────────────────
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'add') {
      const saved = addItem(body.item);
      return jsonOk(saved);
    }
    if (action === 'update') {
      updateItem(body.id, body.updates);
      return jsonOk({ ok: true });
    }
    if (action === 'delete') {
      deleteItem(body.id);
      return jsonOk({ ok: true });
    }
    return jsonErr('Onbekende actie: ' + action);
  } catch (err) {
    return jsonErr(err.toString());
  }
}

// ── getAllItems ──────────────────────────────────────────────
function getAllItems() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  return data.slice(1)
    .filter(row => row[0] !== '')          // sla lege rijen over
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] !== undefined && row[i] !== null ? String(row[i]) : '';
      });
      return obj;
    });
}

// ── addItem ─────────────────────────────────────────────────
function addItem(item) {
  const sheet = getSheet();
  const row = HEADERS.map(h => (item[h] !== undefined ? item[h] : ''));
  sheet.appendRow(row);
  return item;
}

// ── updateItem ───────────────────────────────────────────────
function updateItem(id, updates) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('ID');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      Object.keys(updates).forEach(key => {
        const col = headers.indexOf(key);
        if (col >= 0) {
          sheet.getRange(i + 1, col + 1).setValue(updates[key]);
        }
      });
      return;
    }
  }
}

// ── deleteItem ───────────────────────────────────────────────
function deleteItem(id) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('ID');

  // Van achteren naar voren zodat rijindex klopt na verwijderen
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────
function jsonOk(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonErr(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
