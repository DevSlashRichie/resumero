import * as React from "react";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { Outlet, createRootRoute, Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <div className="flex justify-center p-4 hidden">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>
              <Link to="/">Create Resume</Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Link to="/tailor">Tailor Resume</Link>
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>
              <Link to="/about">About</Link>
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      </div>
      <Outlet />
    </React.Fragment>
  );
}
