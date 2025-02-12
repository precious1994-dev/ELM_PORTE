import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MinisteresPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="Ministères"
        description="Découvrez nos différents ministères"
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ministère des Adultes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Découvrez notre ministère pour les adultes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ministère des Jeunes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Découvrez notre ministère pour les jeunes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ministère des Enfants</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Découvrez notre ministère pour les enfants</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
