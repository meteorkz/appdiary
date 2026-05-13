# AppDiary — CLAUDE.md

## โปรเจคนี้คืออะไร
Web App บันทึก Diary ส่วนตัว ใช้ Google Apps Script เป็น backend + Google Sheet เป็น database

## Tech Stack
- **Google Apps Script** — backend (doGet, doPost, logic)
- **HtmlService** — frontend (HTML + CSS + JS)
- **Google Sheet** — database เก็บ Diary entries
- **CLASP** — deploy จาก local

## โครงสร้างไฟล์
```
src/
  Code.gs          → backend (doGet, doPost, CRUD logic)
  Index.html       → หน้า Web App หลัก
  Style.html       → CSS
  JavaScript.html  → Client-side JS
appsscript.json    → manifest
.clasp.json        → scriptId (ใส่หลัง clasp create)
```

## Commands
```bash
clasp login          # ล็อกอิน Google ครั้งแรก
clasp create         # สร้างโปรเจคใหม่
clasp push           # อัพโหลดโค้ด
clasp open           # เปิด Apps Script editor
clasp deploy         # สร้าง deployment
clasp deploy --deploymentId <id>   # deploy ทับ URL เดิม
```

## วิธีตอบ
- ตอบสั้น กระชับ ไม่ยืดเยื้อ
- ไม่ให้ตัวเลือก — ลงมือทำเลย หรือบอกตรงๆ
- ถามได้แค่ 1 คำถามต่อครั้ง และต้องถามกระชับ

## Memory
- เมื่อเริ่มเซสชันใหม่ ให้อ่านไฟล์ตามลำดับนี้ก่อนเสมอ:
  1. `/Users/hockie/Desktop/Co-work/Webapp/shared-knowledge/KNOWLEDGE.md` — กองความรู้กลาง
  2. `memory.md` ในโฟลเดอร์นี้ — ประวัติโปรเจกต์นี้โดยเฉพาะ
- ทุกครั้งที่ผู้ใช้พิมพ์ "จบ" ให้ append สรุปลงใน `memory.md` โดยมี:
  - วันที่
  - สิ่งที่ทำในเซสชันนี้
  - ข้อผิดพลาดที่พบ และวิธีแก้
  - ความรู้/pattern ใหม่ที่เรียนรู้
- ถ้าเจอข้อผิดพลาดใหม่ที่ไม่อยู่ใน shared-knowledge → append ลง `/Users/hockie/Desktop/Co-work/Webapp/shared-knowledge/errors-and-fixes.md` ด้วย

## Deployment
- **Script ID:** `1l8W3eaQTo_DqhnMR7MTuT9qRAHdd4NGk4pd2U_CJLsQSxPn-13BeBxiM`
- **Deployment ID:** `AKfycbxVB-NO3oX8_2tqqfvxMIs08AmN4z5tmx-6ARrDcLiSZNMmXuygl0kraEkCX-tWxm9htw`
- **URL:** `https://script.google.com/macros/s/AKfycbxVB-NO3oX8_2tqqfvxMIs08AmN4z5tmx-6ARrDcLiSZNMmXuygl0kraEkCX-tWxm9htw/exec`
- **Auto-deploy hook:** ทุกครั้งที่ Claude แก้ไขไฟล์จะรัน `clasp push --force && clasp deploy --deploymentId <id>` อัตโนมัติ

## Conventions
- ฟังก์ชัน backend ชื่อ camelCase เช่น `getDiaries()`
- ใช้ `google.script.run` หรือ `fetch()` เชื่อม frontend ↔ backend
- secrets (API keys) เก็บใน PropertiesService ไม่ใส่ในโค้ด
- Web App ตั้งเป็น `ANYONE_ANONYMOUS` (ป้องกันด้วย lock screen แทน)
