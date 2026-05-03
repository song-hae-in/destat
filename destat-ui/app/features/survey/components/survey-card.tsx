import { EyeIcon, Users, UsersIcon, ViewIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";

//survey card component, used in survey list page
export default function SurveyCard() {
  return (
    <Link to="/surveys/surveyId">
      <Card className="min-w-44 max-w-96">
        <CardHeader>
          <div className="flex flex-row justify-between items-center">
            <CardTitle>Sample Survey</CardTitle>
            <div className="flex flex-row text-xs gap-0.5">
              <EyeIcon size={16} />
              1600
            </div>
            <div className="flex flex-row text-xs gap-0.5">
              <UsersIcon size={16} />
              58
            </div>
          </div>
          <CardDescription className="line-clamp-2 min-h-10">
            This is a sample survey. let's join to get Rewards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img
            className="rounded-2xl"
            src="https://picsum.photos/seed/picsum/600/400"
            alt="Random"
          />
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <Link to="/surveys/surveyId">Join</Link>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
