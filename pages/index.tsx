import { Head } from "@site/components/Common";
import MainLayout from "@site/components/MainLayout";

export default function HomePage() {
  return (
    <MainLayout>
      <Head path="/" title="RogueLibs Web" description="The mod-sharing platform." />
      <div>RogueLibs website works!</div>
    </MainLayout>
  );
}
