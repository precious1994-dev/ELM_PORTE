import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VisionPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="Vision"
        description="Gérez la vision de la section adultes"
      />
      <Card>
        <CardHeader>
          <CardTitle>Notre vision</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Configurez ici la vision de la section adultes</p>
        </CardContent>
      </Card>
    </div>
  );
} 