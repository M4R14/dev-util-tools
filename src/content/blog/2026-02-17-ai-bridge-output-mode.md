---
id: 2026-02-17-ai-bridge-output-mode
title: โหมดผลลัพธ์อย่างเดียวของ AI Bridge / AI Bridge Result-Only Mode
date: 2026-02-17
category: fix
summary: ปรับเอาต์พุต AI Bridge ให้เหมาะกับงานอัตโนมัติและ machine-readable มากขึ้น / Made AI Bridge output friendlier for browser automation and machine-readable integrations.
---

## TH

อัปเดตวันที่ 17 กุมภาพันธ์ 2026 เน้นให้ AI Bridge ส่งผลลัพธ์ที่อ่านง่ายสำหรับระบบอัตโนมัติและใช้งานในสคริปต์ได้ตรงขึ้น

### สิ่งที่เปลี่ยน

- เพิ่มโหมด `result-only` สำหรับเคสที่ต้องการดึงเฉพาะ payload หลักโดยไม่ต้องมี UI chrome เพิ่มเติม
- เพิ่มการสร้างไฟล์ static `catalog.json` และ `spec.json` ระหว่าง build เพื่อให้ fetch ผ่าน static hosting ได้ตรงไปตรงมา
- ปรับรูปแบบข้อความ result/error ให้สม่ำเสมอ เพื่อให้จัดการสถานะสำเร็จและผิดพลาดในฝั่ง client ได้ง่ายขึ้น

## EN

This update on February 17, 2026 focused on making AI Bridge responses easier to consume in automation workflows and scripts.

### What Changed

- Added `result-only` mode for cases that need only the core payload without extra UI chrome.
- Added static `catalog.json` and `spec.json` generation at build time for straightforward fetch usage on static hosting.
- Standardized result/error messaging to simplify success and failure handling on client side.
