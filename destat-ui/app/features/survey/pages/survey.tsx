import { SendIcon, User2Icon } from "lucide-react";
import { Form } from "react-router";
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

export default function Survey() {
  return (
    <div className="grid grid-cols-3 w-screen gap-3 p-4">
      {" "}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="font-extrabold text-3xl">
            Sample survey
          </CardTitle>
          <CardDescription>This is a simple survey example</CardDescription>
        </CardHeader>
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
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">Card Footer</p>
        </CardFooter>
      </Card>
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Chat View</CardTitle>
          <CardDescription>This is Sample survey</CardDescription>
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
