import dayjs from "dayjs";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const Post = ({ post, author }: PostWithUser) => {
  return (
    <Card className="rounded-none border-x-0 border-b">
      <CardContent className="flex gap-4 p-4">
        <Link href={`/@${author?.username || "Deleted User"}`}>
          <Avatar className="h-12 w-12">
            <AvatarImage src={author?.profileImageUrl} alt="Profile Image" />
            <AvatarFallback>{author?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/@${author?.username || "Deleted User"}`}
              className="font-semibold hover:underline"
            >
              @{author?.username}
            </Link>
            <Link href={`/post/${post.id}`} className="text-muted-foreground hover:underline">
              {dayjs(post.createdAt).fromNow()}
            </Link>
          </div>
          <p className="text-base">{post.content}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Post;
