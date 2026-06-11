import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

export default buildModule("SurveyFactoryModule", (m) => {
  const surveyFactory = m.contract("SurveyFactory", [
    ethers.parseEther("50"), // min_pool_amount
    ethers.parseEther("0.1"), // min_reward_amount
  ]);

  return { surveyFactory };
});
