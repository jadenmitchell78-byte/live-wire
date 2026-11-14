import { getCatalogData } from '../lib/catalog';
import ClientHomePage from './ClientHomePage';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialCatalog = await getCatalogData();

  return <ClientHomePage initialCatalog={initialCatalog} />;
}
