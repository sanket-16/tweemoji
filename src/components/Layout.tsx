import type { PropsWithChildren } from "react";
import { cn } from "~/lib/utils";

const Layout = (props: PropsWithChildren<{ className?: string }>) => {
  return (
    <div>
      <main className="flex min-h-screen justify-center">
        <div className={cn("w-full md:max-w-2xl border-x border-border", props.className)}>
          {props.children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
