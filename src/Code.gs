function getSheetId() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  if (!id) {
    const ss = SpreadsheetApp.create('AppDiary Data');
    id = ss.getId();
    props.setProperty('SHEET_ID', id);
  }
  return id;
}

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === 'list')   return jsonRes(getDiaries());
  if (action === 'delete') return jsonRes(deleteDiary(e.parameter.id));
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('AppDiary')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    const p = e.parameter || {};
    if (p.action === 'save')   return jsonRes(saveDiary({ content: p.content, mood: p.mood || '' }));
    if (p.action === 'update') return jsonRes(updateDiary({ id: p.id, content: p.content, mood: p.mood || '' }));
    return jsonRes({ error: 'unknown action' });
  } catch (err) {
    return jsonRes({ error: err.toString() });
  }
}

function jsonRes(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const ss = SpreadsheetApp.openById(getSheetId());
  let sheet = ss.getSheetByName('Diaries');
  if (!sheet) {
    sheet = ss.insertSheet('Diaries');
    sheet.appendRow(['id', 'วันที่เขียนโพส', 'ข้อมูลโพส', 'mood']);
    sheet.setColumnWidth(1, 220);
    sheet.setColumnWidth(2, 160);
    sheet.setColumnWidth(3, 400);
    sheet.setColumnWidth(4, 80);
    return sheet;
  }
  // migrate: add mood column if missing
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (!headers.includes('mood')) {
    sheet.getRange(1, headers.length + 1).setValue('mood');
  }
  return sheet;
}

function getDiaries() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    return data.slice(1).map(function(row) {
      return { id: String(row[0]), createdAt: String(row[1]), content: String(row[2]), mood: String(row[3] || '') };
    }).reverse();
  } catch (e) { return []; }
}

function saveDiary(diary) {
  try {
    const sheet = getSheet();
    const id = Utilities.getUuid();
    sheet.appendRow([id, new Date(), diary.content, diary.mood]);
    return { success: true, id: id };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function updateDiary(diary) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(diary.id)) {
        sheet.getRange(i + 1, 3).setValue(diary.content);
        sheet.getRange(i + 1, 4).setValue(diary.mood);
        return { success: true };
      }
    }
    return { success: false, error: 'not found' };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function deleteDiary(id) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false };
  } catch (e) { return { success: false, error: e.toString() }; }
}
