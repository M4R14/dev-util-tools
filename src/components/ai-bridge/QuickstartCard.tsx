import React from 'react';
import { Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const QuickstartCard: React.FC = () => {
  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          Quickstart
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
          <li>
            <code>window.DevPulseAI</code> พร้อมใช้ทุกหน้า ไม่ต้องอยู่ที่ <code>/ai-bridge</code>{' '}
            และไม่หายเมื่อเปลี่ยนหน้า (รอ event <code>devpulse-ai-ready</code> ได้ถ้าต้องการ)
          </li>
          <li>
            <code>await window.DevPulseAI.catalog()</code> เพื่อดูความสามารถ
          </li>
          <li>
            ส่ง query ทาง URL หรือ <code>await window.DevPulseAI.run(request)</code> — ทุก method
            เป็น async เพราะ runner โหลดตอนเรียกครั้งแรก
          </li>
          <li>
            <code>describe(toolId)</code> ดูทีละตัวประหยัด context ·{' '}
            <code>{'runBatch(requests, { stopOnError: true })'}</code> สำหรับงานต่อเนื่อง — ทุก
            response มี <code>index</code> กำกับ
          </li>
          <li>
            ต้องการผลลัพธ์ล้วน ๆ ต่อ <code>&amp;mode=result-only</code> — จะ render เฉพาะ{' '}
            <code>#ai-bridge-output</code> ไม่มี sidebar/header
          </li>
        </ol>
      </CardContent>
    </Card>
  );
};

export default QuickstartCard;
