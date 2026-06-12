import { SendIcon } from "lucide-react";
import { Form, useFetcher, useRevalidator } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import MessageBubble from "../components/message-bubble";
import { Input } from "~/components/ui/input";
import type { Route } from "./+types/survey";
import { SURVEY_ABI } from "../constant";
import {
  useAccount,
  // useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAddress } from "viem";
import { supabase } from "~/postgres/supaclient";

interface Question {
  question: string;
  options: string[];
}

export const loader = async ({ params }: Route.LoaderArgs) => {
  let surveyId: string;
  try {
    surveyId = getAddress(params.surveyId as `0x${string}`);
  } catch {
    throw new Response("Invalid survey id", { status: 400 });
  }

  const { data: survey, error } = await supabase
    .from("survey")
    .select("title, description, question, target_number")
    .eq("id", surveyId)
    .single();

  if (error || !survey) {
    throw new Response("Survey not found", { status: 404 });
  }

  const { data: answerRows, error: answersError } = await supabase
    .from("answer")
    .select("answer")
    .eq("survey_id", surveyId);

  if (answersError) {
    console.error("Answer fetch failed:", answersError);
  }

  const answers = (answerRows ?? [])
    .map((row) => row.answer)
    .filter((value): value is number[] => Array.isArray(value));

  return {
    title: survey.title,
    description: survey.description,
    questions: survey.question as unknown as Question[],
    targetNumber: survey.target_number,
    answers,
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();

  let surveyId: string;
  try {
    // normalize address
    surveyId = getAddress(formData.get("surveyId") as `0x${string}`);
  } catch {
    console.error("Invalid survey id");
    return { error: "Invalid survey id" };
  }

  const answerRaw = formData.get("answer");
  if (typeof answerRaw !== "string") {
    console.error("Missing answer payload");
    return { error: "Missing answer" };
  }

  const answer = JSON.parse(answerRaw) as number[];
  if (!Array.isArray(answer)) {
    console.error("Invalid answer payload");
    return { error: "Invalid answer" };
  }

  // insert answer
  const { error: insertError } = await supabase.from("answer").insert({
    survey_id: surveyId,
    answer,
  });
  if (insertError) {
    console.error("Answer insert failed:", insertError);
    return { error: insertError.message };
  }

  // count answers
  const { count, error: countError } = await supabase
    .from("answer")
    .select("*", { count: "exact", head: true })
    .eq("survey_id", surveyId);
  if (countError) {
    console.error("Answer count failed:", countError);
    return { error: countError.message };
  }

  // get target
  const { data: survey, error: surveyError } = await supabase
    .from("survey")
    .select("target_number")
    .eq("id", surveyId)
    .single();
  if (surveyError || !survey) {
    console.error("Survey fetch failed:", surveyError);
    return { error: surveyError?.message ?? "Survey not found" };
  }

  // mark finished
  if ((count ?? 0) >= survey.target_number) {
    const { error: updateError } = await supabase
      .from("survey")
      .update({ finished: true })
      .eq("id", surveyId);
    if (updateError) {
      console.error("Survey finished update failed:", updateError);
      return { error: updateError.message };
    }
  }

  return { ok: true };
};

function countAnswers(
  questions: Question[],
  answers: number[][],
  target: number,
): number[][] {
  if (target <= 0) return [];

  return questions.map((q, i) => {
    const count = new Array(q.options.length).fill(0) as number[];
    for (const answer of answers) {
      const choice = answer[i];
      if (typeof choice === "number" && choice >= 0 && choice < count.length) {
        count[choice]++;
      }
    }
    return count.map((n) => (n / target) * 100);
  });
}

export default function Survey({ loaderData, params }: Route.ComponentProps) {
  const { title, description, questions, targetNumber, answers } = loaderData;
  // const surveyAddress = params.surveyId as `0x${string}`;
  //
  // // on-chain read (local Hardhat / deployed chain required)
  // const { data: title } = useReadContract({
  //   address: surveyAddress,
  //   abi: SURVEY_ABI,
  //   functionName: "title",
  // });
  // const { data: description } = useReadContract({
  //   address: surveyAddress,
  //   abi: SURVEY_ABI,
  //   functionName: "description",
  // });
  // const { data: questions } = useReadContract({
  //   address: surveyAddress,
  //   abi: SURVEY_ABI,
  //   functionName: "getQuestions",
  //   args: [],
  // });
  // const { data: answers } = useReadContract({
  //   address: params.surveyId as `0x${string}`,
  //   abi: SURVEY_ABI,
  //   functionName: "getAnswers",
  //   args: [],
  // });
  // const { data: target } = useReadContract({
  //   address: params.surveyId as `0x${string}`,
  //   abi: SURVEY_ABI,
  //   functionName: "targetNumber",
  //   args: [],
  // });
  //
  // const countAnswersOnChain = () => {
  //   if (!target) return;
  //   return questions?.map((q, i) => {
  //     const count = new Array(q.options.length).fill(0) as number[];
  //     answers?.map((answer) => count[answer.answers[i]]++);
  //     return count.map((n) => (n / Number(target)) * 100);
  //   });
  // };
  //
  // useEffect(() => {
  //   if (!answers || !questions || !address) {
  //     return;
  //   }
  //   for (const answer of answers) {
  //     if (answer.respondent === address) {
  //       setCounts(countAnswersOnChain() || []);
  //       setIsAnswered(true);
  //       return;
  //     }
  //   }
  // }, [answers, questions, address, target]);

  const { writeContract, data: hash } = useWriteContract();
  const { isFetched, data: receipt } = useWaitForTransactionReceipt({ hash });
  const { address } = useAccount();
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const revalidator = useRevalidator();
  const pendingAnswersRef = useRef<number[] | null>(null);
  const syncedTxRef = useRef<string | null>(null);

  const submitAnswer = (e: React.FormEvent<HTMLFormElement>) => {
    if (!address) {
      alert("Please connect your wallet to submit the answer.");
      return;
    }
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const answers: number[] = [];
    for (const value of formData.values()) {
      answers.push(Number(value));
    }
    // save for db sync
    pendingAnswersRef.current = answers;
    syncedTxRef.current = null;
    // onchain submit
    writeContract({
      address: params.surveyId as `0x${string}`,
      abi: SURVEY_ABI,
      functionName: "submitAnswer",
      args: [{ respondent: address, answers }],
    });
  };

  // receipt → db sync
  useEffect(() => {
    if (!isFetched || !receipt || !pendingAnswersRef.current) return;
    if (syncedTxRef.current === receipt.transactionHash) return;

    syncedTxRef.current = receipt.transactionHash;
    const answers = pendingAnswersRef.current;
    pendingAnswersRef.current = null;

    const formData = new FormData();
    formData.append("surveyId", params.surveyId);
    formData.append("answer", JSON.stringify(answers));
    fetcher.submit(formData, {
      method: "post",
      action: `/surveys/${params.surveyId}`,
    });
  }, [receipt, isFetched, params.surveyId]);

  const [isAnswered, setIsAnswered] = useState(false);
  const counts = useMemo(
    () => countAnswers(questions, answers, targetNumber),
    [questions, answers, targetNumber],
  );

  useEffect(() => {
    if (!address) return;
    const key = `destat-answered:${params.surveyId}:${address}`;
    if (sessionStorage.getItem(key)) {
      setIsAnswered(true);
    }
  }, [address, params.surveyId]);

  useEffect(() => {
    if (!fetcher.data?.ok || !address) return;
    sessionStorage.setItem(
      `destat-answered:${params.surveyId}:${address}`,
      "1",
    );
    setIsAnswered(true);
    revalidator.revalidate();
  }, [fetcher.data?.ok, address, params.surveyId, revalidator]);

  return (
    <div className="grid grid-cols-3 w-screen gap-3 p-4">
      {" "}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="font-extrabold text-3xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {isAnswered ? (
          <CardContent className="overflow-y-auto h-[70vh] no-scrollbar">
            <h1 className="font-semibold text-xl mb-6">Survey Progress</h1>

            <div className="grid grid-cols-2 gap-8">
              {questions.map((q, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <h1 className="font-medium">{q.question}</h1>
                  <div className="flex flex-col gap-2">
                    {q.options.map((o, i) => (
                      <div
                        key={i}
                        className="flex flex-row justify-center items-center relative"
                      >
                        <div className="absolute left-0 pl-3 text-xs font-semibold z-10 text-white drop-shadow-md">
                          {o}
                        </div>
                        <div className="w-full bg-gray-200 h-7 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{
                              width: `${counts[index]?.[i] ?? 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex flex-col gap-5 overflow-y-auto h-[70vh] no-scrollbar">
            <Form
              method="post"
              onSubmit={submitAnswer}
              className="grid grid-cols-2"
            >
              {questions.map((q, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <span className="mt-5 mb-1">{q.question}</span>
                  <div className="flex flex-col gap-2">
                    {q.options.map((o, i) => (
                      <label
                        key={i}
                        className="text-sm font-medium flex items-center gap-1"
                      >
                        <Input
                          type="radio"
                          name={index.toString()}
                          value={i.toString()}
                          className="hidden peer"
                        />
                        <span className="w-4 h-4 rounded-full border-2 peer-checked:bg-primary "></span>
                        <span className="font-semibold">{o}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}{" "}
              <Button type="submit" className="w-full mt-5">
                Submit
              </Button>
            </Form>
          </CardContent>
        )}
      </Card>
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Chat View</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5 overflow-y-auto h-[70vh] no-scrollbar">
          {Array.from({ length: 10 }).map((_, i) => (
            <MessageBubble key={i} sender={i % 2 === 0} />
          ))}
        </CardContent>
        <CardFooter>
          <Form className="flex flex-row items-center w-full relative">
            <input
              type="text"
              placeholder="type a message.."
              className="border w-full h-10 rounded-2xl px-4 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              type="submit"
              size="icon"
              className="w-8 h-8 absolute right-1 rounded-full"
            >
              <SendIcon className="w-4 h-4" />
            </Button>
          </Form>
        </CardFooter>
      </Card>
    </div>
  );
}
