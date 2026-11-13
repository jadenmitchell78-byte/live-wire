import { getCatalogData } from '../lib/catalog';
import ClientHomePage from './ClientHomePage';

export const revalidate = 30;

export default async function Page() {
  const initialCatalog = await getCatalogData();

  return <ClientHomePage initialCatalog={initialCatalog} />;
}
