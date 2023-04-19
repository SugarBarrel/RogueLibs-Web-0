import { useReleasePageContext } from "..";

export default function ReleasePageDetails() {
  const { release } = useReleasePageContext();

  return (
    <>
      <div>{`The release is ${release.is_public ? "public" : "private"}`}</div>
    </>
  );
}
