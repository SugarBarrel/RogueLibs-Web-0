import { Head } from "@components/Common";
import MainLayout from "@components/MainLayout";
import UserPage from "@components/UserPage";
import { createServerApi, RestUser } from "@lib/API";
import { GSSPC, GSSPR, PageProps } from "@lib/index";

export interface ModPageProps extends PageProps {
  user: RestUser;
}
export default function ModPageIndex({ user }: ModPageProps) {
  return (
    <MainLayout>
      <Head path={`/user/${user.id}`} title={user.username} description="" type="article" />
      <UserPage key={user.id} user={user} />
    </MainLayout>
  );
}

export async function getServerSideProps(cxt: GSSPC<{ user_slug: string }>): Promise<GSSPR<ModPageProps>> {
  const api = createServerApi(cxt);

  const { user_slug } = cxt.params!;

  const [session, user] = await Promise.all([api.getSupabaseSession(), api.fetchUserBySlug(user_slug)]);

  if (user.slug !== null && user_slug !== user.slug) {
    return {
      redirect: { destination: `/user/${user.slug}`, permanent: false },
    };
  }

  return {
    props: {
      user,
      initialState: {
        session,
        users: [user],
      },
    },
  };
}
