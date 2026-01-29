import type { GetStaticProps } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingPage, { PostSkeleton } from "~/components/Loading";
import Layout from "~/components/Layout";
import Post from "~/components/Post";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";

dayjs.extend(relativeTime);

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading, isError } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading)
    return (
      <div className="flex flex-col">
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  if (isError) return <div className="p-6 text-destructive">Something went Wrong!</div>;
  if (!data || data.length === 0) return <div className="p-6 text-muted-foreground">No Posts</div>;

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
  if (isError) return <div className="p-6 text-destructive">Oops</div>;
  return (
    <>
      <Head>
        <title>Tweemoji - {data.username}</title>
        <meta name="description" content="💭" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="relative h-32 bg-muted">
          <Avatar className="absolute -bottom-12 left-4 h-24 w-24 border-4 border-background">
            <AvatarImage
              src={data.profileImageUrl}
              alt={`Profile pic of ${data?.username || "Deleted User"}`}
            />
            <AvatarFallback className="text-3xl">{data?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
        </div>
        <div className="border-b px-4 pb-4 pt-14">
          <p className="text-xl font-semibold">{`@${
            data?.username || "Deleted User"
          }`}</p>
        </div>
        {data.id && <ProfileFeed userId={data?.id} />}
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
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
