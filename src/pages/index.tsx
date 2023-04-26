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
        className="rounded-full"
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
    <div className="flex flex-col">
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
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-bold">Tweemoji</h1>
        {!isSignedIn ? (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex  gap-4">
              <Image
                src={user?.profileImageUrl}
                alt={`${user?.username || "Deleted User"} Profile Image`}
                className="rounded-full"
                width={56}
                height={56}
              />
              <SignOutButton />
            </div>
          </div>
        )}
      </div>
      <div className="p-8">{isSignedIn && <CreatePost />}</div>
      <Feed />
    </Layout>
  );
};

export default Home;
