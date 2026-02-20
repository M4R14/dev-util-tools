---
id: 2026-02-20-blog-markdown-html-styling
title: Blog Markdown to HTML Styling Update / อัปเดตการแสดงผล Blog Markdown เป็น HTML
date: 2026-02-20
category: improvement
summary: ปรับระบบแสดงผลบทความให้แปลง markdown เป็น HTML โดยตรง และเพิ่ม markdown styling ใน BlogPostCard ให้รองรับ heading, list, code, quote และ table ชัดเจนขึ้น / Updated blog rendering to use direct markdown-to-HTML output with richer markdown styling in BlogPostCard for headings, lists, code, quotes, and tables.
---

## TH

อัปเดตวันที่ 20 กุมภาพันธ์ 2026 โฟกัสที่ประสบการณ์การอ่านหน้า Blog โดยทำให้ markdown ถูกแปลงเป็น HTML แล้วแสดงผลด้วย style ที่สม่ำเสมอมากขึ้นในแต่ละโพสต์

### สิ่งที่เปลี่ยน

- ปรับโฟลว์ข้อมูลใน blog posts ให้ใช้งาน `summaryHtml` และ `contentHtml` ที่ได้จาก markdown parser โดยตรง
- เพิ่ม markdown presentation styles ใน `BlogPostCard` สำหรับ `h1-h3`, `p`, `ul/ol/li`, `a`, `code`, `pre`, `blockquote`, `hr`, และ `table`
- ปรับลิงก์และโค้ดให้อ่านง่ายขึ้น ทั้ง inline code และ code block
- รักษาความเข้ากันได้กับโพสต์เดิมใน `src/content/blog/*.md` โดยไม่ต้องแก้ไฟล์เก่า

## EN

This update on February 20, 2026 focused on blog reading experience by rendering markdown as HTML directly with more consistent visual styling across posts.

### What Changed

- Updated blog post flow to use parser-generated `summaryHtml` and `contentHtml` directly.
- Added markdown presentation styles in `BlogPostCard` for `h1-h3`, `p`, `ul/ol/li`, `a`, `code`, `pre`, `blockquote`, `hr`, and `table`.
- Improved readability for links and code, including both inline code and code blocks.
- Kept backward compatibility with existing posts in `src/content/blog/*.md` without requiring content rewrites.
