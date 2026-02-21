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
            เปิด <code>/ai-bridge</code> เพื่อ initialize <code>window.DevPulseAI</code>
          </li>
          <li>เรียก <code>window.DevPulseAI.catalog()</code> เพื่อดูความสามารถ</li>
          <li>ส่ง query หรือใช้ <code>window.DevPulseAI.run(request)</code></li>
          <li>
            ใช้ <code>window.DevPulseAI.runBatch(requests)</code> และ{' '}
            <code>window.DevPulseAI.getSnapshot()</code> สำหรับงาน automation ต่อเนื่อง
          </li>
        </ol>
      </CardContent>
    </Card>
  );
};

export default QuickstartCard;
