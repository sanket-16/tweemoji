import { type NextPage } from "next";
import Image from "next/image";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingPage, { Loading } from "~/components/Loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Layout from "~/components/Layout";

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
      ctx.posts.getAll.invalidate();
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

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const Post = ({ post, author }: PostWithUser) => {
  return (
    <div key={post.id} className="flex gap-4 border p-8">
      <Link href={`/@${author.username}`}>
        <Image
          src={author.profileImageUrl}
          alt="Profile Image"
          className="rounded-full"
          width={56}
          height={56}
        />
      </Link>

      <div className="flex flex-col">
        <p className=" text-slate-400">
          <Link href={`/@${author.username}`} className="hover:underline">
            <span className="font-bold">@{author.username} </span>
          </Link>
          <Link href={`/post/${post.id}`} className="hover:underline">
            <span> · {dayjs(post.createdAt).fromNow()} </span>
          </Link>
        </p>
        <p className="text-lg">{post.content}</p>
      </div>
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
                src={user!.profileImageUrl!}
                alt={`${user!.username} Profile Image`}
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
