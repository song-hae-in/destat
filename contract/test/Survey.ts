import { expect } from "chai";
import { LogDescription } from "ethers";
import { network } from "hardhat";

interface Question {
  question: string;
  options: string[];
}

it("Survey Init", async () => {
  const { ethers } = await network.connect();
  const title = "설문조사";
  const description = "이것은 설문 조사 입니다.";
  const questions: Question[] = [
    {
      question: "설문조사에 응할 생각이 있으신가요?",
      options: ["네", "아니요", "모르겠습니다."],
    },
  ];
  const factory = await ethers.deployContract("SurveyFactory", [
    ethers.parseEther("50"),
    ethers.parseEther("0.1"),
  ]);

  const tx = await factory.createsurvey(
    {
      title,
      description,
      targetNum: 100,
      questions,
    },
    { value: ethers.parseEther("100") },
  );
  const receipt = await tx.wait();
  let surveyAddress;
  receipt?.logs.forEach((log) => {
    const event = factory.interface.parseLog(log);
    if (event?.name == "SurveyCreated") {
      surveyAddress = event.args[0];
    }
  });

  //const surveys = await factory.getSurveys();

  const surveyC = await ethers.getContractFactory("Survey");
  const signers = await ethers.getSigners();
  const respondent = signers[0];

  if (surveyAddress) {
    const survey = await surveyC.attach(surveyAddress);
    await survey.connect(respondent);
    console.log(
      ethers.formatEther(await ethers.provider.getBalance(respondent)),
    );
    const submitTx = await survey.submitAnswer({
      respondent,
      answers: [1],
    });
    await submitTx.wait();
    console.log(
      ethers.formatEther(await ethers.provider.getBalance(respondent)),
    );
  }
});
