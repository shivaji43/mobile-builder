import Appbar from "@/components/Appbar";
import PromptArea from "@/components/Prompt";

export default function Home() {
  return (
    <div>
      <div className="font-sans flex items-center justify-center mt-4 mr-[100px] ml-[100px]">
      <Appbar />
      </div>
      <div className="flex flex-col justify-center items-center my-8 mt-[200px]">
        <h1 className="text-6xl font-bold font-sans">What do you want to build</h1>
        <div className="mt-3 font-sans">Make ReactNative Apps in few Prompts</div>
      </div>
      <div className="flex justify-center items-center w-full px-[100px] mt-6">
          <PromptArea />
      </div>
      
    </div>
  );
}