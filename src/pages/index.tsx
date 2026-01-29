import { type NextPage } from "next";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Loading, PostSkeleton } from "~/components/Loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Layout from "~/components/Layout";
import Post from "~/components/Post";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { ThemeToggle } from "~/components/ThemeToggle";

dayjs.extend(relativeTime);

const CreatePost = () => {
  const [input, setInput] = useState<string>("");
  const { user , isSignedIn} = useUser();
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      toast.dismiss();
      setInput("");
      void ctx.posts.getAll.invalidate();
      toast.success("Posted!");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      toast.dismiss();
      setInput("");
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Heh, try again");
      }
    },
  });

  if (!isSignedIn) return null;
  return (
    <div className="flex w-full items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.imageUrl} alt="Profile Image" />
        <AvatarFallback>{user.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
      </Avatar>
      <Input
        disabled={isPosting}
        placeholder="Type some emojis"
        type="text"
        value={input}
        className="flex-1"
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            e.preventDefault();
            toast.loading("Uploading your post!");
            mutate({ content: input });
          }
        }}
      />
      {input !== "" && (
        <Button
          disabled={isPosting}
          onClick={() => {
            toast.loading("Uploading your post!");
            mutate({ content: input });
          }}
        >
          {isPosting ? <Loading size={20} /> : "Post"}
        </Button>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsloading } = api.posts.getAll.useQuery();
  if (postsloading)
    return (
      <div className="flex flex-col">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  if (!data)
    return <div className="p-6 text-xl font-bold text-destructive">Something went Wrong</div>;
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
        <Link href="/">
          <h1 className="text-lg font-semibold">Tweemoji</h1>
        </Link>
        {!isSignedIn ? (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm">
              <SignInButton />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.imageUrl}
                alt={`${user?.username || "Deleted User"} Profile Image`}
              />
              <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <SignOutButton />
            </Button>
          </div>
        )}
      </div>
      <div className="border-b p-4">
        {isSignedIn && <CreatePost />}
      </div>
      <Feed />
    </Layout>
  );
};

export default Home;
