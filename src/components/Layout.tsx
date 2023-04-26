import type { PropsWithChildren } from "react";

const Layout = (props: PropsWithChildren) => {
  return (
    <div>
      <main className="flex min-h-screen justify-center">
        <div className="w-full  md:max-w-2xl ">{props.children}</div>
      </main>
    </div>
  );
};

export default Layout;
