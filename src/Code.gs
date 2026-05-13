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
    .evaluate().setTitle('AppDiary')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    const p = e.parameter || {};
    if (p.action === 'save')   return jsonRes(saveDiary(p));
    if (p.action === 'update') return jsonRes(updateDiary(p));
    return jsonRes({ error: 'unknown action' });
  } catch (err) { return jsonRes({ error: err.toString() }); }
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
    sheet.appendRow(['id','วันที่เขียนโพส','ข้อมูลโพส','mood','imageUrl','tags']);
    [1,2,3,4,5,6].forEach(function(c,i){ sheet.setColumnWidth(c,[220,160,400,60,300,200][i]); });
    return sheet;
  }
  const needed = ['mood','imageUrl','tags'];
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  needed.forEach(function(col){
    if (!headers.includes(col)) sheet.getRange(1, sheet.getLastColumn()+1).setValue(col);
  });
  return sheet;
}

function getDiaries() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    const h = data[0];
    const idx = function(name){ return h.indexOf(name); };
    return data.slice(1).map(function(r){
      return {
        id: String(r[0]), createdAt: String(r[1]),
        content: String(r[2]), mood: String(r[idx('mood')]||''),
        imageUrl: String(r[idx('imageUrl')]||''), tags: String(r[idx('tags')]||'')
      };
    }).reverse();
  } catch(e){ return []; }
}

function saveDiary(p) {
  try {
    const sheet = getSheet();
    const h = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    const row = new Array(h.length).fill('');
    row[0] = Utilities.getUuid(); row[1] = new Date();
    row[2] = p.content||''; row[h.indexOf('mood')] = p.mood||'';
    row[h.indexOf('imageUrl')] = p.imageUrl||''; row[h.indexOf('tags')] = p.tags||'';
    sheet.appendRow(row);
    return { success:true, id:row[0] };
  } catch(e){ return { success:false, error:e.toString() }; }
}

function updateDiary(p) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    const h = data[0];
    for (let i=1;i<data.length;i++) {
      if (String(data[i][0])===String(p.id)) {
        sheet.getRange(i+1,3).setValue(p.content||'');
        sheet.getRange(i+1,h.indexOf('mood')+1).setValue(p.mood||'');
        sheet.getRange(i+1,h.indexOf('imageUrl')+1).setValue(p.imageUrl||'');
        sheet.getRange(i+1,h.indexOf('tags')+1).setValue(p.tags||'');
        return { success:true };
      }
    }
    return { success:false, error:'not found' };
  } catch(e){ return { success:false, error:e.toString() }; }
}

function deleteDiary(id) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    for (let i=1;i<data.length;i++) {
      if (String(data[i][0])===String(id)) { sheet.deleteRow(i+1); return { success:true }; }
    }
    return { success:false };
  } catch(e){ return { success:false, error:e.toString() }; }
}
