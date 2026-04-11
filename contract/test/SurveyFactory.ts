import { expect } from "chai";
import { ethers, LogDescription, Contract } from "ethers";
import { network } from "hardhat";
import { title } from "process";

const questions = [
  { question: "테스트 1번 질문 입니다.", options: ["네", "아니요"] },
  { question: "테스트 2번 질문 입니다.", options: ["네", "아니요"] },
];
const New_Survey = {
  title: "Test",
  description: "This is Test Survey",
  targetNum: 100,
  questions: questions,
};

describe("SurveyFactory Contract", () => {
  let factory: any, owner, respondent1, respondent2;

  beforeEach(async () => {
    const { ethers } = await network.connect();
    [owner, respondent1, respondent2] = await ethers.getSigners();

    factory = await ethers.deployContract("SurveyFactory", [
      ethers.parseEther("50"), // min_pool_amount

      ethers.parseEther("0.1"), // min_reward_amount
    ]);
  });

  it("should deploy with correct minimum amounts", async () => {
    // TODO: check min_pool_amount and min_reward_amount

    const minAmount = await factory.getMinAmount();
    const minReward = await factory.getMinReward();
    expect(minAmount, "Miss match min_pool_amount").to.equal(
      ethers.parseEther("50"),
    );
    expect(minReward, "Miss match min_reward_amount").to.equal(
      ethers.parseEther("0.1"),
    );
  });

  it("should create a new survey when valid values are provided", async () => {
    // TODO: prepare SurveySchema and call createSurvey with msg.value
    // TODO: check event SurveyCreated emitted
    // TODO: check surveys array length increased
    const before_create = (await factory.getSurveys()).length;
    //1,2
    await expect(
      factory.createsurvey(
        { ...New_Survey },
        { value: ethers.parseEther("50") },
      ),
      "survey not created",
    ).to.emit(factory, "SurveyCreated");
    //3
    expect(
      (await factory.getSurveys()).length,
      "Length mismatch : survey is not added",
    ).to.equal(before_create + 1);

    // const receipt = await tx.wait();
    // const event = receipt.logs;
    // let new_survey_address;
    // receipt?.logs.forEach((log) => {
    // const event = factory.interface.parseLog(log);
    // if (event?.name == "SurveyCreated") {
    //   new_survey_address = event.args[0];
    // }

    // expect(new_survey_address, "")
  });

  it("should revert if pool amount is too small", async () => {
    // TODO: expect revert when msg.value < min_pool_amount
    await expect(
      factory.createsurvey(
        { ...New_Survey },
        { value: ethers.parseEther("7") },
      ),
    ).to.be.revertedWith("insufficient pool amount");
  });

  it("should revert if reward amount per respondent is too small", async () => {
    // TODO: expect revert when msg.value / targetNumber < min_reward_amount
    // TargetNumber = 100
    const invaild_survey = { ...New_Survey, targetNum: 10000 };
    await expect(
      factory.createsurvey(invaild_survey, { value: ethers.parseEther("50") }),
    ).to.be.revertedWith("insufficient reward amount");
  });

  it("should store created surveys and return them from getSurveys", async () => {
    // TODO: create multiple surveys and check getSurveys output
    const surveydata1 = { ...New_Survey, title: "TEST1" };
    const surveydata2 = { ...New_Survey, title: "TEST2" };
    const ETH_50 = ethers.parseEther("50");
    await factory.createsurvey(surveydata1, { value: ETH_50 });
    await factory.createsurvey(surveydata2, { value: ETH_50 });
    const surveys = await factory.getSurveys();

    expect(surveys.length).to.equal(2);
    expect(surveys[0]).to.not.equal(surveys[1]);
  });
});
