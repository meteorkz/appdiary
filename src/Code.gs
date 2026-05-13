function getSheetId() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  if (!id) { const ss = SpreadsheetApp.create('AppDiary Data'); id = ss.getId(); props.setProperty('SHEET_ID', id); }
  return id;
}
function doGet(e) {
  const a = e && e.parameter && e.parameter.action;
  if (a === 'list')    return jsonRes(getDiaries());
  if (a === 'delete')  return jsonRes(deleteDiary(e.parameter.id));
  if (a === 'pin')     return jsonRes(setField(e.parameter.id,'pinned',e.parameter.val));
  if (a === 'private') return jsonRes(setField(e.parameter.id,'private',e.parameter.val));
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('AppDiary').addMetaTag('viewport','width=device-width,initial-scale=1');
}
function doPost(e) {
  try { const p=e.parameter||{}; if(p.action==='save') return jsonRes(saveDiary(p)); if(p.action==='update') return jsonRes(updateDiary(p)); return jsonRes({error:'unknown'}); }
  catch(err) { return jsonRes({error:err.toString()}); }
}
function jsonRes(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function getSheet() {
  const ss = SpreadsheetApp.openById(getSheetId());
  let sheet = ss.getSheetByName('Diaries');
  if (!sheet) { sheet = ss.insertSheet('Diaries'); sheet.appendRow(['id','วันที่เขียนโพส','ข้อมูลโพส','mood','imageUrl','tags','pinned','private']); return sheet; }
  ['mood','imageUrl','tags','pinned','private'].forEach(col => {
    const h = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    if (!h.includes(col)) sheet.getRange(1,sheet.getLastColumn()+1).setValue(col);
  });
  return sheet;
}
function getDiaries() {
  try {
    const sheet = getSheet(); const data = sheet.getDataRange().getValues(); if (data.length<=1) return [];
    const h = data[0]; const gi = n => h.indexOf(n);
    return data.slice(1).map(r=>({ id:String(r[0]), createdAt:String(r[1]), content:String(r[2]),
      mood:String(r[gi('mood')]||''), imageUrl:String(r[gi('imageUrl')]||''),
      tags:String(r[gi('tags')]||''), pinned:String(r[gi('pinned')]||''), private:String(r[gi('private')]||'') })).reverse();
  } catch(e) { return []; }
}
function saveDiary(p) {
  try {
    const sheet = getSheet(); const h = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    const row = new Array(h.length).fill('');
    row[0]=Utilities.getUuid(); row[1]=new Date(); row[2]=p.content||'';
    ['mood','imageUrl','tags','pinned','private'].forEach(k=>{ const i=h.indexOf(k); if(i>=0) row[i]=p[k]||''; });
    sheet.appendRow(row); return {success:true,id:row[0]};
  } catch(e) { return {success:false,error:e.toString()}; }
}
function updateDiary(p) {
  try {
    const sheet = getSheet(); const data = sheet.getDataRange().getValues(); const h = data[0];
    for (let i=1;i<data.length;i++) {
      if (String(data[i][0])===String(p.id)) {
        sheet.getRange(i+1,3).setValue(p.content||'');
        ['mood','imageUrl','tags'].forEach(k=>{ const idx=h.indexOf(k); if(idx>=0) sheet.getRange(i+1,idx+1).setValue(p[k]||''); });
        return {success:true};
      }
    }
    return {success:false,error:'not found'};
  } catch(e) { return {success:false,error:e.toString()}; }
}
function setField(id, field, val) {
  try {
    const sheet = getSheet(); const data = sheet.getDataRange().getValues(); const h = data[0];
    const col = h.indexOf(field);
    for (let i=1;i<data.length;i++) { if (String(data[i][0])===String(id)) { sheet.getRange(i+1,col+1).setValue(val||''); return {success:true}; } }
    return {success:false};
  } catch(e) { return {success:false,error:e.toString()}; }
}
function deleteDiary(id) {
  try {
    const sheet = getSheet(); const data = sheet.getDataRange().getValues();
    for (let i=1;i<data.length;i++) { if (String(data[i][0])===String(id)) { sheet.deleteRow(i+1); return {success:true}; } }
    return {success:false};
  } catch(e) { return {success:false,error:e.toString()}; }
}
