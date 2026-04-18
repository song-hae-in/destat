import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { rabbykit } from "~/root";

export default function Navigation() {
  return (
    <nav className="fixed top-0 right-0 left-0">
      <div className="flex w-screen items-center justify-between px-5 py-5">
        <Link to="/" className="text-lg font-bold">
          Destat
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            {/* Dashboard */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/" className="px-4 py-2 text-sm font-medium">
                  Dashboard
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Survey */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Survey</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1 p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/survey/all"
                        className="block rounded-md p-2 hover:bg-accent"
                      >
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="font-medium leading-none">
                            All Surveys
                          </div>
                          <div className="line-clamp-2 text-muted-foreground text-xs">
                            Browse all available surveys
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/surveys/create"
                        className="block rounded-md p-2 hover:bg-accent"
                      >
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="font-medium leading-none">
                            Create Survey
                          </div>
                          <div className="line-clamp-2 text-muted-foreground text-xs">
                            Build a new survey from scratch
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Archive */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Archive</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1 p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/archive/finish"
                        className="block rounded-md p-2 hover:bg-accent"
                      >
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="font-medium leading-none">
                            Finished Surveys
                          </div>
                          <div className="line-clamp-2 text-muted-foreground text-xs">
                            View completed and closed surveys
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Profile */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Profile</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1 p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/profile/survey"
                        className="block rounded-md p-2 hover:bg-accent"
                      >
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="font-medium leading-none">
                            My Surveys
                          </div>
                          <div className="line-clamp-2 text-muted-foreground text-xs">
                            Surveys you have created
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/profile/response"
                        className="block rounded-md p-2 hover:bg-accent"
                      >
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="font-medium leading-none">
                            My Responses
                          </div>
                          <div className="line-clamp-2 text-muted-foreground text-xs">
                            Surveys you have responded to
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button
          onClick={() => {
            rabbykit.open();
          }}
        >
          Connect
        </Button>
      </div>
    </nav>
  );
}
