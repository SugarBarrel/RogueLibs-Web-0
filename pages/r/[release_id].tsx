import { createServerApi } from "@lib/API";
import { GSSPC, GSSPR } from "@lib/index";

export default function NoPage() {
  return null;
}

export async function getServerSideProps(cxt: GSSPC<{ release_id: string }>): Promise<GSSPR> {
  const api = createServerApi(cxt);
  const { release_id } = cxt.params!;

  const release = await api.fetchReleaseById(+release_id);

  return {
    redirect: {
      destination: `/mods/${release.mod.slug ?? release.mod_id}/${release.slug ?? release.id}`,
      permanent: false,
    },
  };
}
