import type { GetStaticProps } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingPage, { Loading } from "~/components/Loading";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import Layout from "~/components/Layout";
import Image from "next/image";
import Post from "~/components/Post";

dayjs.extend(relativeTime);

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading, isError } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading)
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loading />
      </div>
    );
  if (isError) return <div>Something went Wrong!</div>;
  if (!data || data.length === 0) return <div>No Posts</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <Post key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

const ProfilePage = ({ username }: { username: string }) => {
  const { data, isLoading, isError } = api.profile.getUserByUsername.useQuery({
    username,
  });
  if (isLoading)
    return (
      <div className="h-screen">
        <LoadingPage />
      </div>
    );
  if (isError) return <div>Oops</div>;
  return (
    <>
      <Head>
        <title>Tweemoji - {data.username}</title>
        <meta name="description" content="💭" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`Profile pic of ${data?.username || "Deleted User"}`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4  rounded-full border-8 border-black"
          />
        </div>
        <div className="border-b border-slate-400 p-4">
          <div className="h-16"></div>
          <p className="px-4 text-2xl font-bold">{`@${
            data?.username || "Deleted User"
          }`}</p>
        </div>
        {data.id && <ProfileFeed userId={data?.id} />}
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });
  const slug = context.params?.slug;
  if (typeof slug != "string") throw new Error("no slug");
  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
