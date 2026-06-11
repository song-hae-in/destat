import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Route } from "./+types/create-survey";
import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { SURVEY_FACTORY, SURVEY_FACTORY_ABI } from "../constant";
import { decodeEventLog, getAddress, parseEther } from "viem";
import { supabase } from "~/postgres/supaclient";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const metadata = JSON.parse(formData.get("metadata") as string);
  const image = formData.get("image") as File;
  const surveyId = getAddress(metadata.id as `0x${string}`);

  const { data, error } = await supabase.storage
    .from("img")
    .upload(surveyId, image);
  if (error || !data) {
    console.error("Storage upload failed:", error);
    return { error: error?.message ?? "Upload failed" };
  }

  const { data: publicUrl } = supabase.storage
    .from("img")
    .getPublicUrl(data.path);

  const { error: insertError } = await supabase.from("survey").insert({
    id: surveyId,
    title: metadata.title,
    description: metadata.description,
    target_number: Number(metadata.targetNum),
    reward_amount: Number(metadata.rewardAmount),
    image: publicUrl.publicUrl,
    question: metadata.questions,
    owner: metadata.address,
  });

  if (insertError) {
    console.error("Survey insert failed:", insertError);
    return { error: insertError.message };
  }

  return { ok: true };
};

// []
export default function CreateSurvey() {
  const [options, setOptions] = useState([1]);
  const [img, setImg] = useState("");
  const [formImg, setFormImg] = useState<File>();
  const { data: hash, writeContract } = useWriteContract();
  const { data: receipt, isFetched } = useWaitForTransactionReceipt({ hash });
  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [surveyMeta, setSurveyMeta] = useState({});
  const { address } = useAccount();

  const addQuestion = () => {
    setOptions([...options, 1]);
  };
  const deleteQuestion = () => {
    setOptions(options.slice(0, options.length - 1));
  };
  const addOption = (index: number) => {
    setOptions(options.map((n, i) => (i === index ? n + 1 : n)));
  };
  const deleteOption = (index: number) => {
    if (options[index] <= 1) return;
    setOptions(options.map((n, i) => (i === index ? n - 1 : n)));
  };

  interface Question {
    question: string;
    options: string[];
  }
  const createSurvey = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const questionsData = formData.getAll("Question") as string[];
    const questions: Question[] = questionsData.map((q, i) => ({
      question: q,
      options: formData.getAll(`Question${i}`) as string[],
    }));
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const targetNum = formData.get("target") as string;
    const poolSize = formData.get("rewardPoolSize") as string;
    const formImg = formData.get("image") as File;
    setFormImg(formImg);
    writeContract({
      address: SURVEY_FACTORY,
      abi: SURVEY_FACTORY_ABI,
      functionName: "createsurvey",
      args: [
        {
          title,
          description,
          questions,
          targetNum: BigInt(targetNum),
        },
      ],
      value: parseEther(poolSize),
    });
    setSurveyMeta({
      title,
      description,
      targetNum,
      rewardAmount: Number(poolSize) / Number(targetNum),
      questions,
      address,
    });
    console.log("Final questions:", questions);
  };

  useEffect(() => {
    if (!isFetched || !receipt) return;

    const callAction = async () => {
      let contractAddress;
      for (const log of receipt?.logs) {
        const decoded = decodeEventLog({
          abi: SURVEY_FACTORY_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "SurveyCreated") {
          contractAddress = getAddress(decoded.args[0] as `0x${string}`);
        }
      }
      const formData = new FormData();
      const newSurveyMeta = { ...surveyMeta, id: contractAddress };

      formData.append("metadata", JSON.stringify(newSurveyMeta));
      if (formImg) {
        formData.append("image", formImg);
      }
      await fetch("/surveys/create", {
        method: "POST",
        body: formData,
      });
    };
    void callAction();
  }, [receipt]);

  return (
    <div className="flex justify-center w-full">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create Survey</CardTitle>
          <CardDescription>
            Bulid and publish a new survey to collect reliable responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            onSubmit={createSurvey}
            encType="multipart/form-data"
            className="max-w-2xl mx-auto p-4"
          >
            <label className="flex flex-col mb-4">
              <span className="font-semibold mb-1">Title</span>
              <Input
                type="text"
                name="title"
                placeholder="설문 제목을 입력하세요"
              />
            </label>
            <label className="flex flex-col mb-6">
              <span className="font-semibold mb-1">Description</span>
              <Input
                type="text"
                name="description"
                placeholder="설문에 대한 설명을 입력하세요"
              />
            </label>
            <label className="flex flex-col mb-6">
              <span className="font-semibold mb-1">Target Number</span>
              <Input type="number" name="target" />
            </label>{" "}
            <label className="flex flex-col mb-6">
              <span className="font-semibold mb-1">Reward pool size</span>
              <Input type="number" name="rewardPoolSize" />
            </label>
            <hr className="my-6" />
            {options.map((n, i) => (
              <div key={i} className="mb-8 p-4 border relative">
                {/* 질문 입력 섹션 */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1">
                    Question {i + 1}
                    <Input
                      type="text"
                      placeholder="질문을 입력하세요"
                      name="Question"
                    />
                  </div>
                </div>

                {/* 옵션 목록 섹션 */}
                <div className="ml-6 space-y-2">
                  {Array.from({ length: n }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      {j + 1}.
                      <Input
                        type="text"
                        placeholder={`Option ${j + 1}`}
                        name={`Question${i}`}
                      />
                      {/* del */}
                      {j == n - 1 && (
                        <Button
                          variant="outline"
                          className="h-8 w-8 rounded-full border-red-200 text-red-500"
                          onClick={() => deleteOption(i)}
                          type="button"
                        >
                          -
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* 옵션 추가 버튼 (+) */}
                  <Button
                    className="mt-2 font-medium"
                    onClick={() => addOption(i)}
                    type="button"
                  >
                    + add option
                  </Button>
                </div>
              </div>
            ))}
            {/* 새 질문 추가 */}
            <div className="grid grid-cols-2 ">
              <Button type="button" onClick={addQuestion}>
                + Add Question
              </Button>
              {/* 질문 삭제 버튼*/}
              <Button type="button" onClick={deleteQuestion}>
                - Delete Question
              </Button>
            </div>
            <Card className="relative overflow-hidden">
              <CardContent className="p-0">
                {" "}
                <label className="cursor-pointer group flex flex-col items-center justify-center h-[200px] w-full">
                  <input
                    type="file"
                    className="sr-only"
                    name="image"
                    onChange={uploadFile}
                  />
                  <div className="flex justify-center items-center w-full h-full">
                    {img ? (
                      <img
                        src={img}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-4xl font-light">+</span>
                        <span className="text-sm mt-2">이미지 업로드</span>
                      </div>
                    )}
                  </div>
                </label>
              </CardContent>
            </Card>
            <Button type="submit" className="w-full py-6 text-lg font-bold">
              Create Survey
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
