import Head from "next/head";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PostSkeleton } from "~/components/Loading";
import Layout from "~/components/Layout";
import type { GetStaticProps } from "next";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import Post from "~/components/Post";

dayjs.extend(relativeTime);

const PostPage = ({ id }: { id: string }) => {
  const { data, isLoading, isError } = api.posts.getPostById.useQuery({
    id,
  });
  if (isLoading)
    return (
      <Layout>
        <PostSkeleton />
      </Layout>
    );
  if (isError) return <div className="p-6 text-destructive">Something went Wrong!</div>;
  if (!data) return <div className="p-6 text-muted-foreground">No Posts</div>;
  return (
    <>
      <Head>
        <title>Tweemoji - @{data.author.username}</title>
        <meta name="description" content="💭" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Post {...data} />
      </Layout>
    </>
  );
};
export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const id = context.params?.id;
  if (typeof id != "string") throw new Error("no id");

  await ssg.posts.getPostById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};
export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default PostPage;
