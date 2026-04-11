// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Survey.sol";

struct SurveySchema {
    string title;
    string description;
    Question[] questions;
    uint256 targetNum;
}

event SurveyCreated(address);

contract SurveyFactory {
    uint256 min_pool_amount;
    uint256 min_reward_amout;
    Survey[] surveys;

    constructor(uint256 _min_pool_amount, uint _min_reward_amout) {
        min_pool_amount = _min_pool_amount;
        min_reward_amout = _min_reward_amout;
    }
    function createsurvey(SurveySchema calldata _survey) external payable {
        require(msg.value >= min_pool_amount, "insufficient pool amount");
        require(
            msg.value / _survey.targetNum >= min_reward_amout,
            "insufficient reward amount"
        );
        Survey survey = (new Survey){value: msg.value}(
            _survey.title,
            _survey.description,
            _survey.targetNum,
            _survey.questions
        );
        surveys.push(survey);
        emit SurveyCreated(address(survey));
    }
    function getSurveys() external view returns (Survey[] memory) {
        return surveys;
    }
    function getMinAmount() external view returns (uint256) {
        return min_pool_amount;
    }
    function getMinReward() external view returns (uint256) {
        return min_reward_amout;
    }
}
