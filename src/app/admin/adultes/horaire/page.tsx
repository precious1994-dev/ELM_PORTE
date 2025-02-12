import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HorairePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="Horaire"
        description="Gérez les horaires des activités pour adultes"
      />
      <Card>
        <CardHeader>
          <CardTitle>Horaires des activités</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Configurez ici les horaires des activités pour adultes</p>
        </CardContent>
      </Card>
    </div>
  );
} 