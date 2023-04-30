import { GSSPC, GSSPR } from "@lib/index";

export default function HomePage() {
  return <div />;
}

export async function getServerSideProps(cxt: GSSPC): Promise<GSSPR> {
  return { redirect: { destination: "/mods", permanent: false } };
}