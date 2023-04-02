import { createServerApi } from "@lib/API";
import { GSSPC, GSSPR } from "@lib/index";

export default function NoPage() {
  return null;
}

export async function getServerSideProps(cxt: GSSPC<{ mod_id: string }>): Promise<GSSPR> {
  const api = createServerApi(cxt);
  const { mod_id } = cxt.params!;

  const mod = await api.fetchModById(+mod_id);

  return {
    redirect: {
      destination: `/mods/${mod.slug ?? mod.id}`,
      permanent: false,
    },
  };
}
