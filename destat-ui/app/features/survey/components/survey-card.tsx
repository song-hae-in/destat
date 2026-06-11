import { EyeIcon, UsersIcon } from "lucide-react";
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

export default function SurveyCard({
  title,
  description,
  img,
  view,
  participantNum,
  address,
}: {
  title: string;
  description: string;
  img: string;
  view: number;
  participantNum: number;
  address: string;
}) {
  return (
    <Link to={`/surveys/${address}`} className="block w-full">
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <div className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="line-clamp-1 flex-1">{title}</CardTitle>
            <div className="flex flex-row gap-0.5 text-xs">
              <EyeIcon size={16} />
              {view}
            </div>
            <div className="flex flex-row gap-0.5 text-xs">
              <UsersIcon size={16} />
              {participantNum}
            </div>
          </div>
          <CardDescription className="line-clamp-2 min-h-10">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {img ? (
            <img
              className="w-full rounded-2xl"
              src={img}
              alt={title}
              loading="lazy"
            />
          ) : (
            <div className="h-32 w-full rounded-2xl bg-muted" />
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <Link to={`/surveys/${address}`}>Join</Link>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
