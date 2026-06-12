import { useReadContract } from "wagmi";
import { SURVEY_FACTORY, SURVEY_ABI, SURVEY_FACTORY_ABI } from "../constant";
import SurveyCard from "../components/survey-card";
import {
  chunkIntoRows,
  getColumnCount,
  GRID_COLS_CLASS,
} from "../utils/survey-grid";
import { useEffect, useMemo, useState } from "react";
import { createPublicClient, getContract, http } from "viem";
import { kairos, kairosRpcUrl } from "~/lib/chain";
import type { Route } from "./+types/all-survey";
import { supabase } from "~/postgres/supaclient";

interface SurveyMeta {
  title: string;
  description: string;
  participantNum: number;
  view: number | null;
  img: string | null;
  address: string;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { data, error } = await supabase
    .from("all_survey_overview")
    .select("*");
  if (error) {
    console.error("Error fetching survey data:", error);
    return { error: error.message };
  }
  console.log("Fetched survey data:", data);

  return data.map((s) => {
    return {
      title: s.title,
      description: s.description!,
      participantNum: s.count!,
      view: s.view,
      img: s.image,
      address: s.id!,
    };
  });
};
export default function AllSurvey({ loaderData }: Route.ComponentProps) {
  const [surveys, setSurveys] = useState<SurveyMeta[]>(
    Array.isArray(loaderData) ? loaderData : []
  );
  const onChainLoader = async () => {
    const client = createPublicClient({
      chain: kairos,
      transport: http(kairosRpcUrl),
    });
    const surveyFactoryContract = getContract({
      address: SURVEY_FACTORY,
      abi: SURVEY_FACTORY_ABI,
      client,
    });
    const surveys = await surveyFactoryContract.read.getSurveys();
    const surveyMeataData = await Promise.all(
      surveys.map(async (surveyAddress) => {
        const surveyContract = getContract({
          address: surveyAddress,
          abi: SURVEY_ABI,
          client,
        });
        const title = await surveyContract.read.title();
        const description = await surveyContract.read.description();
        const answers = await surveyContract.read.getAnswers();
        return {
          title,
          description,
          participantNum: answers.length,
          view: null,
          img: null,
          address: surveyAddress,
        };
      }),
    );
    return surveyMeataData;
  };

  // useEffect(() => {
  //   const onChainData = async () => {
  //     await new Promise((resolve) => setTimeout(resolve, 5000));
  //     const onChainSurveys = await onChainLoader();
  //     setSurveys(onChainSurveys);
  //   };
  //   onChainData();
  // }, []);

  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateColumnCount = () => {
      setColumnCount(getColumnCount(window.innerWidth));
    };
    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  const rows = useMemo(
    () => chunkIntoRows(surveys, columnCount),
    [surveys, columnCount],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Live Surveys</h1>
        <span className="text-lg font-light">Join the survey!</span>
      </div>
      <div className="flex flex-col gap-4">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid items-start gap-4 ${GRID_COLS_CLASS[columnCount]}`}
          >
            {row.map((survey) => (
              <SurveyCard
                key={survey.address}
                title={survey.title ?? ""}
                description={survey.description}
                img={survey.img ?? ""}
                view={survey.view ?? 0}
                participantNum={survey.participantNum}
                address={survey.address}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
