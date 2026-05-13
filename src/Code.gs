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
    if (p.action === 'save')   return jsonRes(saveDiary(p));
    if (p.action === 'update') return jsonRes(updateDiary(p));
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
    sheet.appendRow(['id', 'วันที่เขียนโพส', 'ข้อมูลโพส', 'mood', 'imageUrl']);
    sheet.setColumnWidth(1, 220); sheet.setColumnWidth(2, 160);
    sheet.setColumnWidth(3, 400); sheet.setColumnWidth(4, 60);
    sheet.setColumnWidth(5, 300);
    return sheet;
  }
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (!headers.includes('mood')) sheet.getRange(1, headers.length + 1).setValue('mood');
  const headers2 = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (!headers2.includes('imageUrl')) sheet.getRange(1, headers2.length + 1).setValue('imageUrl');
  return sheet;
}

function getDiaries() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    return data.slice(1).map(function(row) {
      return { id: String(row[0]), createdAt: String(row[1]), content: String(row[2]), mood: String(row[3] || ''), imageUrl: String(row[4] || '') };
    }).reverse();
  } catch (e) { return []; }
}

function saveDiary(p) {
  try {
    const sheet = getSheet();
    const id = Utilities.getUuid();
    sheet.appendRow([id, new Date(), p.content || '', p.mood || '', p.imageUrl || '']);
    return { success: true, id: id };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function updateDiary(p) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(p.id)) {
        sheet.getRange(i + 1, 3).setValue(p.content || '');
        sheet.getRange(i + 1, 4).setValue(p.mood || '');
        sheet.getRange(i + 1, 5).setValue(p.imageUrl || '');
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
