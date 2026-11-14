import { getCachedCatalog } from '../lib/catalog';
import ClientHomePage from './ClientHomePage';

// ISR: serve cached HTML instantly, rebuild in the background at most once a minute.
export const revalidate = 60;

export default async function Page() {
  const initialCatalog = await getCachedCatalog(null);

  return <ClientHomePage initialCatalog={initialCatalog} />;
}
