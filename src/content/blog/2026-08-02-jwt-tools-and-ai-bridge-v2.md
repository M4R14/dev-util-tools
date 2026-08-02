---
id: 2026-08-02-jwt-tools-and-ai-bridge-v2
title: JWT Encoder/Decoder และ AI Bridge v2 / JWT Encoder/Decoder and AI Bridge v2
date: 2026-08-02
category: release
summary: เพิ่มเครื่องมือ JWT Decoder และ JWT Encoder ที่ทำงานในเบราว์เซอร์ทั้งหมด พร้อมยก AI Bridge เป็น v2 — ติดตั้ง window.DevPulseAI ทั้งแอป รองรับ 12 เครื่องมือ และเพิ่ม describe() กับ batch / Added browser-only JWT Decoder and JWT Encoder tools, and shipped AI Bridge v2 — window.DevPulseAI installed app-wide, 12 supported tools, plus describe() and batch execution.
---

## TH

อัปเดตวันที่ 2 สิงหาคม 2026 รอบนี้มีสองส่วนหลัก คือเครื่องมือ JWT ชุดใหม่ และการยกเครื่อง AI Bridge ให้ agent ใช้งานได้จริงทั้งแอป

### เครื่องมือใหม่: JWT Decoder และ JWT Encoder

- **JWT Decoder** — ถอด header และ payload ออกมาอ่าน แปลง `exp` / `iat` / `nbf` ที่เป็น NumericDate ให้เป็นวันเวลาที่อ่านออก และมีแผง verify สำหรับตรวจลายเซ็นด้วย shared secret แยกต่างหาก
- **JWT Encoder** — สร้าง token จาก JSON payload ถ้าไม่ใส่ secret จะได้ token แบบ **ไม่มีลายเซ็น** (`alg: none`) ซึ่งเหมาะกับการทำ fixture ส่วนถ้าใส่ secret จะเซ็นด้วย HS256/HS384/HS512
- ทั้งสองตัวทำงานในเบราว์เซอร์ล้วน ไม่มีการส่ง token ออกไปที่ไหน การถอดรหัสใช้ `jwt-decode` ส่วนการเซ็นและตรวจลายเซ็นใช้ `jose` บน Web Crypto — สองส่วนนี้เป็นจุดที่เราตั้งใจไม่เขียนเอง

### ข้อจำกัดที่ควรรู้ก่อนใช้

- **secret ไม่เคยถูกใส่ลงใน URL** ทั้งฝั่ง encoder และ decoder จะ sync เฉพาะ payload หรือ token เท่านั้น เพราะกุญแจที่อยู่ในลิงก์จะติดไปกับ history, bookmark และภาพหน้าจอ
- การเซ็นและตรวจลายเซ็นต้องใช้ `crypto.subtle` ซึ่งเบราว์เซอร์เปิดให้เฉพาะ **secure context** (https หรือ localhost) ถ้าเปิดผ่าน HTTP ธรรมดา เช่น IP ในวง LAN ระบบจะแจ้ง error ตรง ๆ แทนที่จะคืนผลลัพธ์ที่ยังไม่ได้ตรวจ ส่วนการสร้าง token แบบไม่มีลายเซ็นยังใช้ได้ปกติเพราะไม่ต้องพึ่ง crypto
- รองรับเฉพาะอัลกอริทึมแบบ symmetric การตรวจ RS256/ES256 ต้องใช้ public key ในรูป JWK/PEM ซึ่งเป็นโจทย์เรื่อง input คนละเรื่อง ยังไม่รองรับในตอนนี้
- การถอดรหัส **ไม่ใช่** การตรวจสอบ ผลลัพธ์จาก decoder จึงระบุเสมอว่ายังไม่ได้ verify จนกว่าจะกดตรวจด้วย secret

### AI Bridge v2

- `window.DevPulseAI` ถูกติดตั้ง **ทั้งแอป** แล้ว จากเดิมที่อยู่เฉพาะหน้า `/ai-bridge` และถูกลบทิ้งเมื่อออกจากหน้า ทำให้ agent ที่เปลี่ยนหน้าระหว่างทำงานสูญเสีย API กลางคัน
- เมธอดทั้งหมดเป็น async และโหลด runner ตอนเรียกครั้งแรก ผู้ใช้ทั่วไปจึงไม่ต้องดาวน์โหลดโค้ดส่วนที่มีแต่ agent ใช้
- เพิ่ม `describe(tool)` สำหรับอ่าน catalog ทีละตัว และ `runBatch()` ที่คืน `index` กำกับทุกผลลัพธ์ พร้อมตัวเลือก `stopOnError`
- ขยายจำนวนเครื่องมือที่เรียกผ่าน bridge ได้เป็น 12 ตัว
- โหมด `mode=result-only` เรนเดอร์โดยไม่มี app shell ทำให้ `JSON.parse(document.body.innerText)` ใช้ได้จริง — เนื้อหาที่ไม่เกี่ยวข้องลดจาก 673 เหลือ 56 ตัวอักษร

### ข้อจำกัดของ AI Bridge

DevPulse เป็น static site บน GitHub Pages ทั้งหมด agent ที่เรียกผ่าน HTTP อย่างเดียวจะเห็น catalog ได้ แต่ **สั่งรันไม่ได้** เพราะการรันต้องมี JavaScript ทำงานในเบราว์เซอร์ และด้วยเหตุผลเดียวกันจึงยังไม่มี MCP server — แบบ remote ต้องมีเซิร์ฟเวอร์ที่ GitHub Pages โฮสต์ให้ไม่ได้ ส่วนแบบ stdio เป็นการแจกจ่ายผ่าน npm ซึ่งเป็นคนละช่องทางกัน รายละเอียดทั้งหมดอยู่ในเอกสาร AI Bridge

## EN

Update for August 2, 2026. This release has two parts: a new set of JWT tools, and an AI Bridge overhaul that makes the agent API usable across the whole app.

### New tools: JWT Decoder and JWT Encoder

- **JWT Decoder** — reads the header and payload, renders NumericDate claims (`exp` / `iat` / `nbf`) as human-readable timestamps, and offers a separate verify panel for checking the signature against a shared secret.
- **JWT Encoder** — builds a token from a JSON payload. With no secret it produces an **unsigned** `alg: none` token, which is handy for fixtures; with a secret it signs using HS256/HS384/HS512.
- Both run entirely in the browser — no token ever leaves the page. Decoding goes through `jwt-decode`; signing and verification go through `jose` on top of Web Crypto. Those are the parts we deliberately do not hand-roll.

### Limits worth knowing up front

- **The secret is never placed in the URL.** Both tools sync only the payload or token. A signing key in a link would end up in history, bookmarks and screenshots.
- Signing and verification need `crypto.subtle`, which browsers expose **only in secure contexts** (https or localhost). On a plain-HTTP origin — a LAN IP during development, say — the tools throw an explicit error rather than returning an unchecked result. Building an unsigned token still works, since it needs no crypto.
- Symmetric algorithms only. Verifying RS256/ES256 requires a public key in JWK/PEM form, which is a separate input problem and is not supported yet.
- Decoding is **not** verification. Decoder output always states that the signature is unverified until you check it with a secret.

### AI Bridge v2

- `window.DevPulseAI` is now installed **app-wide**. It previously lived in the `/ai-bridge` route and was deleted on unmount, so an agent that navigated elsewhere lost the API mid-task.
- Every method is async and loads the runner on first call, so ordinary visitors don't download code only agents use.
- Added `describe(tool)` for reading a single catalog entry, and `runBatch()` which tags every result with its `index` and accepts a `stopOnError` option.
- The bridge now covers 12 tools.
- `mode=result-only` renders without the app shell, so `JSON.parse(document.body.innerText)` actually works — surrounding noise dropped from 673 characters to 56.

### AI Bridge constraints

DevPulse is a fully static site on GitHub Pages. An agent that only speaks HTTP can read the catalog but **cannot execute anything**, because execution requires JavaScript running in a browser. For the same reason there is no MCP server: a remote one needs a server GitHub Pages cannot host, and a stdio one is a separate npm distribution channel. The AI Bridge documentation covers this in full.
