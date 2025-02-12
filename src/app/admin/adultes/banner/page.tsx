import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BannerPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="Bannière"
        description="Gérez la bannière de la section adultes"
      />
      <Card>
        <CardHeader>
          <CardTitle>Configuration de la bannière</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Configurez ici la bannière de la section adultes</p>
        </CardContent>
      </Card>
    </div>
  );
} 