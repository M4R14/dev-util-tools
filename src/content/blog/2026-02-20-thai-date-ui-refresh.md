---
id: 2026-02-20-thai-date-ui-refresh
title: ปรับปรุง UI ของ Thai Date Converter / Thai Date Converter UI Refresh
date: 2026-02-20
category: improvement
summary: ปรับ UX ของ Thai Date Converter ให้โครง input/output ชัดขึ้น การแสดงผลรูปแบบวันที่กระชับขึ้น และเพิ่มยูทิลิตีเวลาใช้งานจริง / Refined Thai Date Converter UX with clearer input/output layout, compact format presentation, and richer time utilities.
---

## TH

อัปเดตวันที่ 20 กุมภาพันธ์ 2026 เราเน้นปรับ interaction flow ของ Thai Date Converter เพื่อให้ผู้ใช้ไปจาก input ถึงผลลัพธ์ได้เร็วขึ้นและลด visual noise ระหว่างใช้งาน

### สิ่งที่เปลี่ยน

- ปรับ date formats ให้เป็นการ์ดที่ใช้ซ้ำได้ เพื่อให้ UI และ copy actions สม่ำเสมอ
- ปรับ Date Converter section ให้เป็น 2 คอลัมน์บน desktop (controls และ summary ซ้าย, formats ขวา)
- ปรับ parser workspace ให้แยก input และ output ชัดขึ้นตามลำดับการใช้งาน
- ปรับ parser result เป็น compact multi-column grid และสื่อ conversion direction ชัดขึ้น
- ปรับ current time panel ด้วย live status badge, การแสดงเวลาไทยที่อ่านง่ายขึ้น และ quick-copy Unix timestamps (seconds และ milliseconds)
- อัปเดตเอกสารเครื่องมือภายในให้สอดคล้องกับพฤติกรรม UI ล่าสุด

## EN

On February 20, 2026, we focused on improving the Thai Date Converter interaction flow so users can move from input to result faster with less visual noise.

### What Changed

- Refactored shared date format rendering into reusable cards to keep format UI and copy actions consistent.
- Updated Date Converter section to a clearer two-column desktop layout (controls and summary on the left, formats on the right).
- Improved parser workspace to separate input and output panels with better visual hierarchy.
- Updated parser result presentation with a compact multi-column format grid and clearer conversion direction.
- Refreshed current time panel with live status badge, improved Thai date-time readability, and quick-copy Unix timestamps (seconds and milliseconds).
- Synced internal tool documentation to match the updated Thai Date Converter UI behavior.
