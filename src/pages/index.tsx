import { type NextPage } from "next";
import Image from "next/image";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingPage, { Loading } from "~/components/Loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Layout from "~/components/Layout";
import Post from "~/components/Post";
import Link from "next/link";

dayjs.extend(relativeTime);

const CreatePost = () => {
  let toastId: string;
  const [input, setInput] = useState<string>("");
  const { user } = useUser();
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      toast.remove(toastId);
      setInput("");
      void ctx.posts.getAll.invalidate();
      toast.success("Posted!", { id: toastId });
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      toast.remove(toastId);
      setInput("");
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0], { id: toastId });
      } else {
        toast.error("Heh, try again", { id: toastId });
      }
    },
  });

  if (!user) return null;
  return (
    <div className="flex w-full items-center gap-4">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="rounded-full border-2 border-white"
        width={56}
        height={56}
      />
      <input
        disabled={isPosting}
        placeholder="Type some emojis"
        type="text"
        value={input}
        className="grow bg-transparent p-4 outline-none"
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            e.preventDefault();
            toast.loading("Uploading your post!", { id: toastId });
            mutate({ content: input });
          }
        }}
      />
      {input !== "" && (
        <button
          disabled={isPosting}
          onClick={() => {
            toast.loading("Uploading your post!", { id: toastId });
            mutate({ content: input });
          }}
        >
          {isPosting ? <Loading /> : "Post"}
        </button>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsloading } = api.posts.getAll.useQuery();
  if (postsloading) return <LoadingPage />;
  if (!data)
    return <div className="text-xl font-bold">Something went Wrong</div>;
  return (
    <div className="flex flex-col divide-y  divide-slate-400">
      {data?.map((fullPost) => (
        <Post key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <Layout>
      <div className="flex items-center justify-between p-4">
        <Link href="/">
          <h1 className="text-xl font-bold">Tweemoji</h1>
        </Link>
        {!isSignedIn ? (
          <div className="flex justify-center rounded-md bg-blue-700 py-2 px-4  transition-all hover:bg-blue-400">
            <SignInButton />
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex  gap-4 rounded-md bg-slate-700 p-2  transition-all hover:bg-slate-400">
              <Image
                src={user?.profileImageUrl}
                alt={`${user?.username || "Deleted User"} Profile Image`}
                className="rounded-full border-2 border-white"
                width={48}
                height={48}
              />
              <SignOutButton />
            </div>
          </div>
        )}
      </div>
      <div className="border-b border-slate-400 p-8">
        {isSignedIn && <CreatePost />}
      </div>
      <Feed />
    </Layout>
  );
};

export default Home;
