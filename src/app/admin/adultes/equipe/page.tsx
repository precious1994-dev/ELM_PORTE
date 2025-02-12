import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EquipePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="Équipe"
        description="Gérez l'équipe de la section adultes"
      />
      <Card>
        <CardHeader>
          <CardTitle>Membres de l'équipe</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Gérez ici les membres de l'équipe de la section adultes</p>
        </CardContent>
      </Card>
    </div>
  );
} 