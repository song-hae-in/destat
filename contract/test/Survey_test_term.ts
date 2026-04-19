import { expect } from "chai";
import { network } from "hardhat";

interface Question {
  question: string;
  options: string[];
}
const { ethers } = await network.connect();

describe("Survey init", () => {
  const title = "막무가내 설문조사라면";

  const description =
    "중앙화된 설문조사로서, 모든 데이터는 공개되지 않으며 설문조사를 게시한자만 볼 수 있습니다.";

  const questions: Question[] = [
    {
      question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",

      options: [
        "구글폼 운영자",

        "탈중앙화된 블록체인 (관리주체 없으며 모든 데이터 공개)",

        "상관없음",
      ],
    },
  ];

  const getSurveyContractAndEthers = async (survey: {
    title: string;

    description: string;

    targetNumber: number;

    questions: Question[];
  }) => {
    const { ethers } = await network.connect();

    const cSurvey = await ethers.deployContract("Survey", [
      survey.title,

      survey.description,

      survey.targetNumber,

      survey.questions,
    ]);

    return { ethers, cSurvey };
  };

  describe("Deployment", () => {
    it("should store survey info correctly", async () => {
      /* ... */
      const { cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 100,
        questions,
      });
      //제대로 저장되었는 지 확인
      expect(await cSurvey.title()).to.equal(title);
      expect(await cSurvey.description()).to.equal(description);
      expect(await cSurvey.targetNumber()).to.equal(100);
    });

    it("should calculate rewardAmount correctly", async () => {
      /* ... */
      const totalReward = ethers.parseEther("10"); // 10 ETH
      const cSurvey = await ethers.deployContract(
        "Survey",
        [title, description, 100, questions],
        {
          value: totalReward,
        },
      );
      //rewardAmount = 10 / 100 = 0.1 ETH
      const expectedReward = ethers.parseEther("0.1");
      const rewardAmount = await cSurvey.rewardAmount();
      expect(rewardAmount).to.equal(expectedReward);
    });
  });

  describe("Questions and Answers", () => {
    it("should return questions correctly", async () => {
      /* ... */
      const cSurvey = await ethers.deployContract("Survey", [
        title,
        description,
        100,
        questions,
      ]);

      const Questions = await cSurvey.getQuestions();
      for (let i = 0; i < questions.length; i++) {
        expect(Questions[i].question).to.equal(questions[i].question);
        expect(Questions[i].options.length).to.equal(
          questions[i].options.length,
        );
      }
    });

    it("should allow valid answer submission", async () => {
      /* ... */
      const cSurvey = await ethers.deployContract("Survey", [
        title,
        description,
        100,
        questions,
      ]);
      const signers = await ethers.getSigners();
      const signer1 = signers[0];
      // 답변
      const Answer = {
        respondent: signer1.address,
        answers: [0],
      };
      await expect(cSurvey.connect(signer1).submitAnswer(Answer))
        .to.emit(cSurvey, "AnswerSubmitted")
        .withArgs(signer1.address, Answer.answers);
    });

    it("should revert if answer length mismatch", async () => {
      /* ... */
      const cSurvey = await ethers.deployContract("Survey", [
        title,
        description,
        100,
        questions,
      ]);
      const signers = await ethers.getSigners();
      const signer1 = signers[0];
      // 답변
      const Answer = {
        respondent: signer1.address,
        answers: [0, 1], // 잘못된 답변
      };
      await expect(
        cSurvey.connect(signer1).submitAnswer(Answer),
      ).to.be.revertedWith("err answers length");
    });

    it("should revert if target reached", async () => {
      /* ... */
      const cSurvey = await ethers.deployContract("Survey", [
        title,
        description,
        1,
        questions,
      ]);
      const signers = await ethers.getSigners();
      const signer1 = signers[0];
      const signer2 = signers[1];

      const Answer1 = {
        respondent: signer1.address,
        answers: [0],
      };
      await cSurvey.connect(signer1).submitAnswer(Answer1);
      // 두번째 시도

      const Answer2 = {
        respondent: signer2.address,
        answers: [1],
      };
      await expect(
        cSurvey.connect(signer2).submitAnswer(Answer2),
      ).to.be.revertedWith("This survey has been ended");
    });
  });

  describe("Rewards", () => {
    it("should pay correct reward to respondent", async () => {
      /* ... */
      const totalReward = ethers.parseEther("10");
      const cSurvey = await ethers.deployContract(
        "Survey",
        [title, description, 100, questions],
        {
          value: totalReward,
        },
      );
      // reward = 0.1 ETH
      const signers = await ethers.getSigners();
      const signer1 = signers[0];
      //const signer2 = signers[1];
      const expectedReward = ethers.parseEther("0.1");
      await expect(
        cSurvey.connect(signer1).submitAnswer({
          respondent: signer1.address,
          answers: [0],
        }),
      ).to.changeEtherBalance(ethers, signer1, expectedReward, {
        includesFee: true,
      });
      //   const after = await ethers.provider.getBalance(signer1.address);
      //   expect(after - before).to.equal(ethers.parseEther("0.1"));
    });
  });
});
