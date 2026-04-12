import { supabase } from "~/postgres/supaclient";

// before rendering Home react 컴포넌트. at backend
// log 도 벡엔드에 찍힘.
export async function loader() {
  const { data } = await supabase().from("destat-test").select("*");
  console.log(data);
}

export default function Home() {
  return <div>Hello World</div>;
}
