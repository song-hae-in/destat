import SurveyCard from "../components/survey-card";

export default function AllSurvey() {
  //survey list page

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">Live Surveys</h1>
        <span className="text-lg font-light">Join the survey!</span>
      </div>
      {Array.from({ length: 10 }).map((_, index) => (
        <SurveyCard key={index} />
      ))}
    </div>
  );
}
