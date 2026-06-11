import { SendIcon, User2Icon } from "lucide-react";
import { Form, useFetcher } from "react-router";
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
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect, useRef, useState } from "react";
import { getAddress } from "viem";
import { supabase } from "~/postgres/supaclient";

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

interface Question {
  question: string;
  options: string[];
}

const questions: Question[] = [
  {
    question: "프랑스의 수도는 어디인가요?",
    options: ["파리", "런던", "베를린", "마드리드"],
  },
  {
    question: "웹 브라우저에서 실행되는 언어는 무엇인가요?",
    options: ["파이썬", "자바", "C", "자바스크립트"],
  },
  {
    question: "HTML의 약자는 무엇인가요?",
    options: [
      "하이퍼 트레이너 마킹 언어",
      "하이퍼 텍스트 마크업 언어",
      "하이퍼 텍스트 마케팅 언어",
      "하이퍼 텍스트 마크업 레벨러",
    ],
  },
  {
    question: "React를 개발한 회사는 어디인가요?",
    options: ["구글", "페이스북", "마이크로소프트", "아마존"],
  },
  {
    question: "2 + 2의 값은 무엇인가요?",
    options: ["3", "4", "5", "6"],
  },
  {
    question: "다음 중 자바스크립트 프레임워크(또는 라이브러리)는 무엇인가요?",
    options: ["Django", "Laravel", "React", "Spring"],
  },
  {
    question: "CSS의 약자는 무엇인가요?",
    options: [
      "컴퓨터 스타일 시트",
      "크리에이티브 스타일 시트",
      "캐스케이딩 스타일 시트",
      "컬러풀 스타일 시트",
    ],
  },
  {
    question: "다음 중 데이터베이스는 무엇인가요?",
    options: ["MySQL", "React", "Node.js", "HTML"],
  },
  {
    question: "TypeScript 파일의 확장자는 무엇인가요?",
    options: [".ts", ".js", ".py", ".java"],
  },
  {
    question: "보안 웹 통신에 사용되는 프로토콜은 무엇인가요?",
    options: ["HTTP", "FTP", "HTTPS", "SMTP"],
  },
];

export default function Survey({ params }: Route.ComponentProps) {
  const surveyAddress = params.surveyId as `0x${string}`;

  const { data: title } = useReadContract({
    address: surveyAddress,
    abi: SURVEY_ABI,
    functionName: "title",
  });
  const { data: description } = useReadContract({
    address: surveyAddress,
    abi: SURVEY_ABI,
    functionName: "description",
  });
  const { data: questions } = useReadContract({
    address: surveyAddress,
    abi: SURVEY_ABI,
    functionName: "getQuestions",
    args: [],
  });
  const { writeContract, data: hash } = useWriteContract();
  const { isFetched, data: receipt } = useWaitForTransactionReceipt({ hash });
  const { address } = useAccount();
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
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

  const { data: answers } = useReadContract({
    address: params.surveyId as `0x${string}`,
    abi: SURVEY_ABI,
    functionName: "getAnswers",
    args: [],
  });
  const { data: target } = useReadContract({
    address: params.surveyId as `0x${string}`,
    abi: SURVEY_ABI,
    functionName: "targetNumber",
    args: [],
  });
  const [counts, setCounts] = useState<number[][]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const countAnswers = () => {
    //0:[0,0,1]
    //1:[0,0,1]
    if (!target) return;
    return questions?.map((q, i) => {
      const count = new Array(q.options.length).fill(0) as number[];
      answers?.map((answer) => count[answer.answers[i]]++);
      return count.map((n) => (n / Number(target)) * 100);
    });
  };
  useEffect(() => {
    if (!answers || !questions || !address) {
      return;
    }
    for (const answer of answers) {
      if (answer.respondent === address) {
        setCounts(countAnswers() || []);
        setIsAnswered(true);
        return;
      }
    }
  }, [answers, questions, address, target]);
  return (
    <div className="grid grid-cols-3 w-screen gap-3 p-4">
      {" "}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="font-extrabold text-3xl">
            {title ?? "Loading..."}
          </CardTitle>
          <CardDescription>{description ?? ""}</CardDescription>
        </CardHeader>
        {isAnswered ? (
          <CardContent className="overflow-y-auto h-[70vh] no-scrollbar">
            <h1 className="font-semibold text-xl mb-6">Survey Progress</h1>

            <div className="grid grid-cols-2 gap-8">
              {questions?.map((q, index) => (
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
              {questions?.map((q, index) => (
                <div className="flex flex-col gap-3">
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
          <CardDescription>{description ?? ""}</CardDescription>
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
