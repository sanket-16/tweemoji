import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const Post = ({ post, author }: PostWithUser) => {
  return (
    <div key={post.id} className="flex gap-4  p-8">
      <Link href={`/@${author?.username || "Deleted User"}`}>
        <Image
          src={author?.profileImageUrl}
          alt="Profile Image"
          className="rounded-full border-2 border-white"
          width={56}
          height={56}
        />
      </Link>

      <div className="flex flex-col">
        <p className=" text-slate-400">
          <Link
            href={`/@${author?.username || "Deleted User"}`}
            className="hover:underline"
          >
            <span className="font-bold">@{author?.username} </span>
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

export default Post;
