import type { PropsWithChildren } from "react";

const Layout = (props: PropsWithChildren<{}>) => {
  return (
    <div>
      <main className="flex h-screen justify-center">
        <div className="w-full border md:max-w-2xl ">{props.children}</div>
      </main>
    </div>
  );
};

export default Layout;
